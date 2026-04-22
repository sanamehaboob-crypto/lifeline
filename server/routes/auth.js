const express = require('express');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const Admin = require('../models/Admin');
const Hospital = require('../models/Hospital');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticate admin and return JWT token.
 */
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find admin by username
      const admin = await Admin.findOne({ username: username.toLowerCase() });
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials.',
        });
      }

      // Check password
      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials.',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: admin._id, hospitalId: admin.hospitalId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Get associated hospital data
      const hospital = await Hospital.findById(admin.hospitalId).lean();

      res.json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          admin: {
            id: admin._id,
            username: admin.username,
            hospitalId: admin.hospitalId,
            hospitalName: admin.hospitalName,
          },
          hospital,
        },
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during authentication.',
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current admin profile and hospital data.
 */
router.get('/me', auth, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.admin.hospitalId).lean();

    res.json({
      success: true,
      data: {
        admin: req.admin,
        hospital,
      },
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile.',
    });
  }
});

module.exports = router;
