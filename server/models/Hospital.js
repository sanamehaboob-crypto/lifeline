const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  location: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
  },
  bedsAvailable: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  totalBeds: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  icuAvailable: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  totalIcu: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  waitingTime: {
    type: Number, // in minutes
    required: true,
    min: 0,
    default: 0,
  },
  specialties: {
    type: [String],
    default: [],
  },
  emergencyServices: {
    type: Boolean,
    default: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for geolocation queries
hospitalSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);
