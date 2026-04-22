require('dotenv').config();
const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const Admin = require('../models/Admin');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifeline';

// 15 Sample hospitals in Delhi NCR area
const hospitals = [
  {
    name: 'AIIMS Delhi',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi, 110029',
    phone: '+91-11-2658-8500',
    location: { lat: 28.5672, lng: 77.2100 },
    bedsAvailable: 45,
    totalBeds: 200,
    icuAvailable: 8,
    totalIcu: 25,
    waitingTime: 35,
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Trauma'],
    emergencyServices: true,
  },
  {
    name: 'Safdarjung Hospital',
    address: 'Ansari Nagar West, New Delhi, 110029',
    phone: '+91-11-2673-0000',
    location: { lat: 28.5685, lng: 77.2065 },
    bedsAvailable: 62,
    totalBeds: 300,
    icuAvailable: 12,
    totalIcu: 30,
    waitingTime: 45,
    specialties: ['General Medicine', 'Surgery', 'Pediatrics', 'Orthopedics'],
    emergencyServices: true,
  },
  {
    name: 'Max Super Speciality Hospital',
    address: 'Press Enclave Road, Saket, New Delhi, 110017',
    phone: '+91-11-2651-5050',
    location: { lat: 28.5280, lng: 77.2155 },
    bedsAvailable: 30,
    totalBeds: 150,
    icuAvailable: 5,
    totalIcu: 20,
    waitingTime: 20,
    specialties: ['Cardiology', 'Neuroscience', 'Oncology', 'Kidney'],
    emergencyServices: true,
  },
  {
    name: 'Fortis Hospital',
    address: 'Sector B, Pocket 1, Aruna Asaf Ali Marg, Vasant Kunj, New Delhi, 110070',
    phone: '+91-11-4277-6222',
    location: { lat: 28.5200, lng: 77.1540 },
    bedsAvailable: 18,
    totalBeds: 120,
    icuAvailable: 3,
    totalIcu: 15,
    waitingTime: 15,
    specialties: ['Cardiology', 'Orthopedics', 'Neurology', 'Gastroenterology'],
    emergencyServices: true,
  },
  {
    name: 'Apollo Hospital',
    address: 'Mathura Road, Sarita Vihar, New Delhi, 110076',
    phone: '+91-11-7179-1090',
    location: { lat: 28.5316, lng: 77.2868 },
    bedsAvailable: 55,
    totalBeds: 250,
    icuAvailable: 10,
    totalIcu: 30,
    waitingTime: 25,
    specialties: ['Cardiac Surgery', 'Transplant', 'Oncology', 'Neurosurgery'],
    emergencyServices: true,
  },
  {
    name: 'Sir Ganga Ram Hospital',
    address: 'Rajinder Nagar, New Delhi, 110060',
    phone: '+91-11-2575-0000',
    location: { lat: 28.6380, lng: 77.1880 },
    bedsAvailable: 40,
    totalBeds: 180,
    icuAvailable: 7,
    totalIcu: 22,
    waitingTime: 30,
    specialties: ['Cardiology', 'Pulmonology', 'Gastroenterology', 'Nephrology'],
    emergencyServices: true,
  },
  {
    name: 'Lok Nayak Hospital',
    address: 'Jawaharlal Nehru Marg, New Delhi, 110002',
    phone: '+91-11-2323-2400',
    location: { lat: 28.6353, lng: 77.2397 },
    bedsAvailable: 70,
    totalBeds: 350,
    icuAvailable: 15,
    totalIcu: 40,
    waitingTime: 50,
    specialties: ['General Medicine', 'Surgery', 'Pediatrics', 'Emergency Medicine'],
    emergencyServices: true,
  },
  {
    name: 'BLK Super Speciality Hospital',
    address: 'Pusa Road, Rajinder Nagar, New Delhi, 110005',
    phone: '+91-11-3040-3040',
    location: { lat: 28.6440, lng: 77.1820 },
    bedsAvailable: 25,
    totalBeds: 170,
    icuAvailable: 6,
    totalIcu: 18,
    waitingTime: 18,
    specialties: ['Bone Marrow Transplant', 'Cardiology', 'Liver Transplant', 'Oncology'],
    emergencyServices: true,
  },
  {
    name: 'Moolchand Medcity',
    address: 'Lala Lajpat Rai Marg, New Delhi, 110024',
    phone: '+91-11-4200-0000',
    location: { lat: 28.5750, lng: 77.2400 },
    bedsAvailable: 12,
    totalBeds: 100,
    icuAvailable: 2,
    totalIcu: 10,
    waitingTime: 12,
    specialties: ['IVF', 'Orthopedics', 'Cardiology', 'General Surgery'],
    emergencyServices: true,
  },
  {
    name: 'Primus Super Speciality Hospital',
    address: 'Chanakyapuri, New Delhi, 110021',
    phone: '+91-11-6620-6620',
    location: { lat: 28.5880, lng: 77.1730 },
    bedsAvailable: 8,
    totalBeds: 80,
    icuAvailable: 1,
    totalIcu: 8,
    waitingTime: 10,
    specialties: ['Spine Surgery', 'Urology', 'Bariatric Surgery', 'ENT'],
    emergencyServices: true,
  },
  {
    name: 'RML Hospital',
    address: 'Baba Kharak Singh Marg, New Delhi, 110001',
    phone: '+91-11-2336-5525',
    location: { lat: 28.6254, lng: 77.2067 },
    bedsAvailable: 55,
    totalBeds: 280,
    icuAvailable: 10,
    totalIcu: 28,
    waitingTime: 40,
    specialties: ['General Medicine', 'Surgery', 'Dermatology', 'Psychiatry'],
    emergencyServices: true,
  },
  {
    name: 'Medanta – The Medicity',
    address: 'CH Baktawar Singh Road, Sector 38, Gurugram, 122001',
    phone: '+91-124-4141-414',
    location: { lat: 28.4395, lng: 77.0420 },
    bedsAvailable: 80,
    totalBeds: 400,
    icuAvailable: 20,
    totalIcu: 45,
    waitingTime: 22,
    specialties: ['Cardiology', 'Neuroscience', 'Oncology', 'Robotics Surgery', 'Transplants'],
    emergencyServices: true,
  },
  {
    name: 'Artemis Hospital',
    address: 'Sector 51, Gurugram, Haryana, 122001',
    phone: '+91-124-6767-999',
    location: { lat: 28.4242, lng: 77.0520 },
    bedsAvailable: 35,
    totalBeds: 180,
    icuAvailable: 8,
    totalIcu: 20,
    waitingTime: 15,
    specialties: ['Cardiac Sciences', 'Neuro Sciences', 'Oncology', 'Renal Sciences'],
    emergencyServices: true,
  },
  {
    name: 'Columbia Asia Hospital',
    address: 'Palam Vihar, Gurugram, Haryana, 122017',
    phone: '+91-124-3989-555',
    location: { lat: 28.4970, lng: 77.0360 },
    bedsAvailable: 22,
    totalBeds: 100,
    icuAvailable: 4,
    totalIcu: 12,
    waitingTime: 18,
    specialties: ['Internal Medicine', 'Orthopedics', 'Pediatrics', 'Obstetrics'],
    emergencyServices: true,
  },
  {
    name: 'GTB Hospital',
    address: 'Dilshad Garden, Delhi, 110095',
    phone: '+91-11-2258-9100',
    location: { lat: 28.6850, lng: 77.3120 },
    bedsAvailable: 90,
    totalBeds: 400,
    icuAvailable: 18,
    totalIcu: 35,
    waitingTime: 55,
    specialties: ['Trauma', 'General Medicine', 'Surgery', 'Obstetrics', 'Pediatrics'],
    emergencyServices: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Hospital.deleteMany({});
    await Admin.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert hospitals
    const createdHospitals = await Hospital.insertMany(hospitals);
    console.log(`🏥 Inserted ${createdHospitals.length} hospitals`);

    // Create admin accounts (one per hospital for the first 3 hospitals)
    const admins = [
      {
        hospitalId: createdHospitals[0]._id,
        username: 'admin',
        password: 'admin123',
        hospitalName: createdHospitals[0].name,
      },
      {
        hospitalId: createdHospitals[1]._id,
        username: 'safdarjung_admin',
        password: 'admin123',
        hospitalName: createdHospitals[1].name,
      },
      {
        hospitalId: createdHospitals[2]._id,
        username: 'max_admin',
        password: 'admin123',
        hospitalName: createdHospitals[2].name,
      },
    ];

    for (const adminData of admins) {
      const admin = new Admin(adminData);
      await admin.save();
    }
    console.log(`👤 Created ${admins.length} admin accounts`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Username: admin       | Password: admin123 | Hospital: AIIMS Delhi');
    console.log('   Username: safdarjung_admin | Password: admin123 | Hospital: Safdarjung Hospital');
    console.log('   Username: max_admin   | Password: admin123 | Hospital: Max Super Speciality Hospital');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
