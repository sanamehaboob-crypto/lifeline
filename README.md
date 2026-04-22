# LifeLine – Real-Time Healthcare Assistance Platform

A full-stack healthcare platform that helps users find the most suitable hospital during emergencies using real-time data, AI-based symptom analysis, and intelligent recommendations.

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally on `mongodb://localhost:27017`

### 1. Setup Backend
```bash
cd server
npm install
npm run seed    # Seeds 15 hospitals + admin accounts
npm run dev     # Starts on port 5000
```

### 2. Setup Frontend
```bash
cd client
npm install
npm run dev     # Starts on port 5173
```

### 3. Open in Browser
Navigate to **http://localhost:5173**

## 🔐 Admin Credentials
| Username | Password | Hospital |
|----------|----------|----------|
| admin | admin123 | AIIMS Delhi |
| safdarjung_admin | admin123 | Safdarjung Hospital |
| max_admin | admin123 | Max Super Speciality Hospital |

## 🤖 OpenAI Integration
To enable AI-powered symptom analysis, add your OpenAI API key to `server/.env`:
```
OPENAI_API_KEY=sk-your-key-here
```
Without it, the system falls back to rule-based analysis automatically.

## 📁 Project Structure
```
lifeline-project/
├── client/          # React + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API service layer
│   │   └── utils/         # Helper functions
│   └── ...
├── server/          # Node.js + Express backend
│   ├── config/      # Database configuration
│   ├── middleware/   # Auth & validation middleware
│   ├── models/      # Mongoose models
│   ├── routes/      # API routes
│   ├── services/    # Business logic (AI analyzer, recommendation engine)
│   └── seed/        # Database seeder
└── README.md
```

## ✨ Features
- 🏥 Real-time hospital discovery with map & list views
- 🤖 AI symptom analyzer (OpenAI GPT + rule-based fallback)
- ⭐ Smart recommendation engine with weighted scoring
- 🔐 JWT-authenticated admin panel
- 🗺️ Interactive Leaflet maps with dark theme
- 📱 Fully responsive design
