/**
 * LifeLine Recommendation Engine
 * 
 * Scores hospitals based on distance, bed availability, ICU availability,
 * and waiting time — weighted dynamically by urgency level.
 */

/**
 * Calculate distance between two coordinates using Haversine formula.
 * Returns distance in kilometers.
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Estimate travel time in minutes based on distance.
 * Assumes average urban speed of 30 km/h.
 */
function estimateTravelTime(distanceKm) {
  const avgSpeedKmh = 30;
  return Math.round((distanceKm / avgSpeedKmh) * 60);
}

/**
 * Weight configurations for different urgency levels.
 */
const WEIGHTS = {
  Emergency: { distance: 0.15, beds: 0.15, icu: 0.40, waitTime: 0.30 },
  Medium:    { distance: 0.30, beds: 0.30, icu: 0.15, waitTime: 0.25 },
  Low:       { distance: 0.40, beds: 0.25, icu: 0.10, waitTime: 0.25 },
};

/**
 * Score a single hospital.
 */
function scoreHospital(hospital, userLat, userLng, urgency, maxDistance, maxWaitTime) {
  const distance = calculateDistance(userLat, userLng, hospital.location.lat, hospital.location.lng);
  const travelTime = estimateTravelTime(distance);
  const weights = WEIGHTS[urgency] || WEIGHTS.Medium;

  // Distance score: closer is better (0-1)
  const distanceScore = Math.max(0, 1 - (distance / maxDistance));

  // Bed availability score (0-1)
  const bedScore = hospital.totalBeds > 0
    ? hospital.bedsAvailable / hospital.totalBeds
    : 0;

  // ICU availability score (0-1)
  const icuScore = hospital.totalIcu > 0
    ? hospital.icuAvailable / hospital.totalIcu
    : 0;

  // Wait time score: lower wait is better (0-1)
  const waitTimeScore = Math.max(0, 1 - (hospital.waitingTime / maxWaitTime));

  // Composite score
  const totalScore =
    weights.distance * distanceScore +
    weights.beds * bedScore +
    weights.icu * icuScore +
    weights.waitTime * waitTimeScore;

  // Penalty: if Emergency and no ICU beds, penalize heavily
  let adjustedScore = totalScore;
  if (urgency === 'Emergency' && hospital.icuAvailable === 0) {
    adjustedScore *= 0.3;
  }
  // Penalty: if no beds at all
  if (hospital.bedsAvailable === 0) {
    adjustedScore *= 0.5;
  }

  return {
    hospital: {
      _id: hospital._id,
      name: hospital.name,
      address: hospital.address,
      phone: hospital.phone,
      location: hospital.location,
      bedsAvailable: hospital.bedsAvailable,
      totalBeds: hospital.totalBeds,
      icuAvailable: hospital.icuAvailable,
      totalIcu: hospital.totalIcu,
      waitingTime: hospital.waitingTime,
      specialties: hospital.specialties,
      emergencyServices: hospital.emergencyServices,
      lastUpdated: hospital.lastUpdated,
    },
    distance: Math.round(distance * 10) / 10, // round to 1 decimal
    travelTime,
    score: Math.round(adjustedScore * 100) / 100,
    scores: {
      distance: Math.round(distanceScore * 100) / 100,
      beds: Math.round(bedScore * 100) / 100,
      icu: Math.round(icuScore * 100) / 100,
      waitTime: Math.round(waitTimeScore * 100) / 100,
    },
  };
}

/**
 * Generate human-readable reasoning for a recommendation.
 */
function generateReasoning(scored, rank, urgency) {
  const reasons = [];

  if (rank === 1) {
    reasons.push(`🏆 Best overall match for your ${urgency.toLowerCase()} situation.`);
  }

  if (scored.distance <= 3) {
    reasons.push(`📍 Very close to your location (${scored.distance} km away, ~${scored.travelTime} min).`);
  } else if (scored.distance <= 10) {
    reasons.push(`📍 Reasonably close (${scored.distance} km away, ~${scored.travelTime} min).`);
  } else {
    reasons.push(`📍 Located ${scored.distance} km away (~${scored.travelTime} min travel).`);
  }

  if (scored.hospital.bedsAvailable > 10) {
    reasons.push(`🛏️ Good bed availability (${scored.hospital.bedsAvailable}/${scored.hospital.totalBeds} beds available).`);
  } else if (scored.hospital.bedsAvailable > 0) {
    reasons.push(`🛏️ Limited beds available (${scored.hospital.bedsAvailable}/${scored.hospital.totalBeds}).`);
  } else {
    reasons.push(`⚠️ No beds currently available.`);
  }

  if (urgency === 'Emergency') {
    if (scored.hospital.icuAvailable > 0) {
      reasons.push(`🏥 ICU beds available (${scored.hospital.icuAvailable}/${scored.hospital.totalIcu}).`);
    } else {
      reasons.push(`⚠️ No ICU beds currently available.`);
    }
  }

  if (scored.hospital.waitingTime <= 15) {
    reasons.push(`⏱️ Short waiting time (~${scored.hospital.waitingTime} min).`);
  } else if (scored.hospital.waitingTime <= 45) {
    reasons.push(`⏱️ Moderate waiting time (~${scored.hospital.waitingTime} min).`);
  } else {
    reasons.push(`⏱️ Long waiting time (~${scored.hospital.waitingTime} min).`);
  }

  if (scored.hospital.emergencyServices && urgency === 'Emergency') {
    reasons.push(`🚑 Has emergency services.`);
  }

  return reasons;
}

/**
 * Main recommendation function.
 * Returns top N hospitals with scores and reasoning.
 */
function getRecommendations(hospitals, userLat, userLng, urgency = 'Medium', topN = 3) {
  if (!hospitals || hospitals.length === 0) {
    return [];
  }

  // Calculate max values for normalization
  const distances = hospitals.map(h =>
    calculateDistance(userLat, userLng, h.location.lat, h.location.lng)
  );
  const maxDistance = Math.max(...distances, 50); // At least 50km range
  const maxWaitTime = Math.max(...hospitals.map(h => h.waitingTime), 120); // At least 120 min range

  // Score all hospitals
  const scored = hospitals.map(h =>
    scoreHospital(h, userLat, userLng, urgency, maxDistance, maxWaitTime)
  );

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Take top N and add reasoning
  const recommendations = scored.slice(0, topN).map((s, index) => ({
    rank: index + 1,
    ...s,
    reasoning: generateReasoning(s, index + 1, urgency),
  }));

  return recommendations;
}

module.exports = {
  getRecommendations,
  calculateDistance,
  estimateTravelTime,
};
