const express = require('express');
const { body } = require('express-validator');
const { analyzeSymptoms } = require('../services/symptomAnalyzer');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * POST /api/analyze
 * Analyze symptoms and return condition, urgency, and care type.
 */
router.post(
  '/',
  [
    body('symptoms')
      .trim()
      .notEmpty()
      .withMessage('Symptoms text is required')
      .isLength({ min: 3, max: 1000 })
      .withMessage('Symptoms must be between 3 and 1000 characters'),
  ],
  validate,
  async (req, res) => {
    try {
      const { symptoms } = req.body;

      const result = await analyzeSymptoms(symptoms);

      res.json({
        success: true,
        data: {
          ...result,
          disclaimer: 'This is an AI-powered informational assessment only and NOT a medical diagnosis. Always consult a qualified healthcare professional for medical advice.',
        },
      });
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze symptoms. Please try again.',
      });
    }
  }
);

module.exports = router;
