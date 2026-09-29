const express = require('express');
const { body } = require('express-validator');
const Hospital = require('../models/Hospital');
const { getRecommendations } = require('../services/recommendationEngine');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * POST /api/recommend
 * Get top recommended hospitals based on user location and urgency.
 */
router.post(
  '/',
  [
    body('location.lat')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Valid latitude is required'),
    body('location.lng')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Valid longitude is required'),
    body('urgency')
      .optional()
      .isIn(['Emergency', 'Medium', 'Low'])
      .withMessage('Urgency must be one of: Emergency, Medium, Low'),
  ],
  validate,
  async (req, res) => {
    try {
      const { location, urgency = 'Medium' } = req.body;

      const hospitals = await Hospital.find().lean();

      if (hospitals.length === 0) {
        return res.json({
          success: true,
          data: [],
          message: 'No hospitals found in the database.',
        });
      }

      const recommendations = getRecommendations(
        hospitals,
        location.lat,
        location.lng,
        urgency,
        3
      );

      res.json({
        success: true,
        urgency,
        count: recommendations.length,
        data: recommendations,
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate recommendations.',
      });
    }
  }
);

module.exports = router;
