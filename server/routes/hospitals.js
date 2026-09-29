const express = require('express');
const { body } = require('express-validator');
const Hospital = require('../models/Hospital');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { calculateDistance, estimateTravelTime } = require('../services/recommendationEngine');
const { fetchNearbyHospitals } = require('../services/overpassService');

const router = express.Router();

// ============================================================
// In-memory cache for Overpass results (to avoid rate-limiting)
// ============================================================
const nearbyCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(lat, lng, radius) {
  // Round to ~500m precision to group nearby requests together
  return `${lat.toFixed(2)}_${lng.toFixed(2)}_${radius}`;
}

/**
 * GET /api/hospitals/nearby
 * Fetch REAL hospitals from OpenStreetMap near the user's location.
 * Query params: lat, lng, radius (meters, default 10000)
 */
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius, sort } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'lat and lng query parameters are required.',
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseInt(radius) || 10000;

    // Check cache first
    const cacheKey = getCacheKey(userLat, userLng, searchRadius);
    const cached = nearbyCache.get(cacheKey);

    let hospitals;

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      hospitals = cached.data;
    } else {
      // Fetch from Overpass API
      hospitals = await fetchNearbyHospitals(userLat, userLng, searchRadius);
      nearbyCache.set(cacheKey, { data: hospitals, timestamp: Date.now() });
    }

    // Calculate distances from user
    hospitals = hospitals.map((h) => {
      const distance = calculateDistance(userLat, userLng, h.location.lat, h.location.lng);
      return {
        ...h,
        distance: Math.round(distance * 10) / 10,
        travelTime: estimateTravelTime(distance),
      };
    });

    // Sort
    switch (sort) {
      case 'waitingTime':
        hospitals.sort((a, b) => a.waitingTime - b.waitingTime);
        break;
      case 'beds':
        hospitals.sort((a, b) => b.bedsAvailable - a.bedsAvailable);
        break;
      case 'icu':
        hospitals.sort((a, b) => b.icuAvailable - a.icuAvailable);
        break;
      case 'distance':
      default:
        hospitals.sort((a, b) => a.distance - b.distance);
        break;
    }

    res.json({
      success: true,
      count: hospitals.length,
      source: 'openstreetmap',
      data: hospitals,
    });
  } catch (error) {
    console.error('Error fetching nearby hospitals:', error);

    // If Overpass fails, fall back to seeded DB hospitals
    try {
      const { lat, lng } = req.query;
      let dbHospitals = await Hospital.find().lean();

      if (lat && lng) {
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        dbHospitals = dbHospitals.map((h) => {
          const distance = calculateDistance(userLat, userLng, h.location.lat, h.location.lng);
          return { ...h, distance: Math.round(distance * 10) / 10, travelTime: estimateTravelTime(distance) };
        });
        dbHospitals.sort((a, b) => a.distance - b.distance);
      }

      res.json({
        success: true,
        count: dbHospitals.length,
        source: 'database_fallback',
        data: dbHospitals,
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch hospitals from both OpenStreetMap and database.',
      });
    }
  }
});

/**
 * GET /api/hospitals
 * List all hospitals, optionally with distance calculations.
 */
router.get('/', async (req, res) => {
  try {
    const { lat, lng, maxDistance, sort, bedsAvailable, icuAvailable } = req.query;
    
    let hospitals = await Hospital.find().lean();

    // If user location provided, calculate distances
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      hospitals = hospitals.map(h => {
        const distance = calculateDistance(userLat, userLng, h.location.lat, h.location.lng);
        return {
          ...h,
          distance: Math.round(distance * 10) / 10,
          travelTime: estimateTravelTime(distance),
        };
      });

      // Filter by max distance if provided
      if (maxDistance) {
        const maxDist = parseFloat(maxDistance);
        hospitals = hospitals.filter(h => h.distance <= maxDist);
      }
    }

    // Filter by bed availability
    if (bedsAvailable === 'true') {
      hospitals = hospitals.filter(h => h.bedsAvailable > 0);
    }

    // Filter by ICU availability
    if (icuAvailable === 'true') {
      hospitals = hospitals.filter(h => h.icuAvailable > 0);
    }

    // Sort
    if (sort) {
      switch (sort) {
        case 'distance':
          hospitals.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          break;
        case 'waitingTime':
          hospitals.sort((a, b) => a.waitingTime - b.waitingTime);
          break;
        case 'beds':
          hospitals.sort((a, b) => b.bedsAvailable - a.bedsAvailable);
          break;
        case 'icu':
          hospitals.sort((a, b) => b.icuAvailable - a.icuAvailable);
          break;
        default:
          if (lat && lng) {
            hospitals.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          }
      }
    } else if (lat && lng) {
      hospitals.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    res.json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospitals.',
    });
  }
});

/**
 * GET /api/hospitals/:id
 * Get a single hospital by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found.',
      });
    }

    // Calculate distance if user location provided
    const { lat, lng } = req.query;
    if (lat && lng) {
      const distance = calculateDistance(parseFloat(lat), parseFloat(lng), hospital.location.lat, hospital.location.lng);
      hospital.distance = Math.round(distance * 10) / 10;
      hospital.travelTime = estimateTravelTime(distance);
    }

    res.json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    console.error('Error fetching hospital:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospital.',
    });
  }
});

/**
 * POST /api/hospitals/update
 * Update hospital availability data (requires auth).
 */
router.post(
  '/update',
  auth,
  [
    body('bedsAvailable').optional().isInt({ min: 0 }).withMessage('Beds available must be a non-negative integer'),
    body('icuAvailable').optional().isInt({ min: 0 }).withMessage('ICU available must be a non-negative integer'),
    body('waitingTime').optional().isInt({ min: 0 }).withMessage('Waiting time must be a non-negative integer'),
  ],
  validate,
  async (req, res) => {
    try {
      const { bedsAvailable, icuAvailable, waitingTime } = req.body;
      const hospitalId = req.admin.hospitalId;

      const updateData = { lastUpdated: new Date() };
      if (bedsAvailable !== undefined) updateData.bedsAvailable = bedsAvailable;
      if (icuAvailable !== undefined) updateData.icuAvailable = icuAvailable;
      if (waitingTime !== undefined) updateData.waitingTime = waitingTime;

      const hospital = await Hospital.findByIdAndUpdate(
        hospitalId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: 'Hospital not found.',
        });
      }

      res.json({
        success: true,
        message: 'Hospital data updated successfully.',
        data: hospital,
      });
    } catch (error) {
      console.error('Error updating hospital:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update hospital.',
      });
    }
  }
);

module.exports = router;
