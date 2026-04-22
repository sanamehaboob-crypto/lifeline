import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRecommendations } from '../services/api';
import { useLocation } from '../context/LocationContext';
import RecommendationCard from '../components/RecommendationCard';
import MapView from '../components/MapView';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiStar, FiAlertTriangle } from 'react-icons/fi';
import { getUrgencyBadge } from '../utils/helpers';

export default function RecommendationPage() {
  const { location: userLocation, loading: locLoading } = useLocation();
  const [searchParams] = useSearchParams();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const urgency = searchParams.get('urgency') || 'Medium';

  const fetchRecommendations = async () => {
    if (!userLocation) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getRecommendations(userLocation, urgency);
      setRecommendations(res.data);
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) fetchRecommendations();
  }, [userLocation, urgency]);

  const hospitals = recommendations.map(r => ({
    ...r.hospital,
    distance: r.distance,
    travelTime: r.travelTime,
  }));

  return (
    <div className="min-h-screen pt-24 px-4 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 mb-5">
            <FiStar className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Top <span className="gradient-text">Recommended</span> Hospitals
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="text-gray-400 text-sm">Urgency Level:</span>
            <span className={getUrgencyBadge(urgency)}>{urgency}</span>
          </div>
          {urgency === 'Emergency' && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emergency-500/10 border border-emergency-500/30 rounded-xl">
              <FiAlertTriangle className="w-4 h-4 text-emergency-400" />
              <span className="text-sm text-emergency-400">For life-threatening emergencies, always call 112 immediately</span>
            </div>
          )}
        </div>

        {locLoading || loading ? (
          <LoadingSpinner text="Finding the best hospitals for you..." />
        ) : error ? (
          <div className="glass-card p-8 text-center">
            <p className="text-emergency-400 mb-4">{error}</p>
            <button onClick={fetchRecommendations} className="btn-primary">Retry</button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-400 text-lg">No recommendations available at this time.</p>
          </div>
        ) : (
          <>
            {/* Map */}
            <div className="mb-8" style={{ height: '350px' }}>
              <MapView
                hospitals={hospitals}
                userLocation={userLocation}
                className="h-full"
              />
            </div>

            {/* Recommendation Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.rank} recommendation={rec} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
