import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import HospitalResultsPage from './pages/HospitalResultsPage';
import SymptomAnalyzerPage from './pages/SymptomAnalyzerPage';
import RecommendationPage from './pages/RecommendationPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <LocationProvider>
          <div className="min-h-screen bg-dark-900">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/hospitals" element={<HospitalResultsPage />} />
              <Route path="/symptoms" element={<SymptomAnalyzerPage />} />
              <Route path="/recommendations" element={<RecommendationPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </LocationProvider>
      </AuthProvider>
    </Router>
  );
}
