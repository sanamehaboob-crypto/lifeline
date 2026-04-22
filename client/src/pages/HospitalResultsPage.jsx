import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getNearbyHospitals, getHospitals } from '../services/api';
import { useLocation } from '../context/LocationContext';
import HospitalCard from '../components/HospitalCard';
import HospitalDetailModal from '../components/HospitalDetailModal';
import MapView from '../components/MapView';
import FilterPanel from '../components/FilterPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiList, FiMap, FiGlobe } from 'react-icons/fi';

export default function HospitalResultsPage() {
  const { location: userLocation } = useLocation();
  const [searchParams] = useSearchParams();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('split'); // split, list, map
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [filters, setFilters] = useState({
    maxDistance: searchParams.get('maxDistance') || '',
    bedsAvailable: false,
    icuAvailable: false,
  });
  const [sort, setSort] = useState('distance');
  const [dataSource, setDataSource] = useState('');
  const [radius, setRadius] = useState(10000); // 10km default

  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;

      if (userLocation) {
        // Try fetching real hospitals from OpenStreetMap
        try {
          res = await getNearbyHospitals({
            lat: userLocation.lat,
            lng: userLocation.lng,
            radius,
            sort,
          });
          setDataSource(res.source || 'openstreetmap');
        } catch {
          // Fall back to database hospitals
          const params = { sort, lat: userLocation.lat, lng: userLocation.lng };
          res = await getHospitals(params);
          setDataSource('database');
        }
      } else {
        res = await getHospitals({ sort });
        setDataSource('database');
      }

      let data = res.data || [];

      // Apply client-side filters
      if (filters.maxDistance) {
        const maxDist = parseFloat(filters.maxDistance);
        data = data.filter((h) => h.distance <= maxDist);
      }
      if (filters.bedsAvailable) {
        data = data.filter((h) => h.bedsAvailable > 0);
      }
      if (filters.icuAvailable) {
        data = data.filter((h) => h.icuAvailable > 0);
      }

      setHospitals(data);
    } catch (err) {
      setError('Failed to load hospitals. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHospitals(); }, [userLocation, filters, sort, radius]);

  // Auto-refresh every 60s (less aggressive for external API)
  useEffect(() => {
    const interval = setInterval(fetchHospitals, 60000);
    return () => clearInterval(interval);
  }, [userLocation, filters, sort, radius]);

  return (
    <div className="min-h-screen pt-20 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Nearby Hospitals</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-400 text-sm">
                {hospitals.length} hospitals found • Auto-refreshes every 60s
              </p>
              {dataSource && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-trust-500/10 text-trust-400 border border-trust-500/20">
                  <FiGlobe className="w-3 h-3" />
                  {dataSource === 'openstreetmap' ? 'Live OSM Data' : 'Database'}
                </span>
              )}
            </div>
          </div>
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 mt-3 sm:mt-0">
            {[
              { key: 'split', label: 'Split' },
              { key: 'list', label: 'List', icon: FiList },
              { key: 'map', label: 'Map', icon: FiMap },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${view === key ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-white'}`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Radius */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-sm text-gray-400">Search radius:</span>
          {[5000, 10000, 20000, 50000].map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
                ${radius === r
                  ? 'bg-primary-500/20 border-primary-500/40 text-primary-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              {r >= 1000 ? `${r / 1000} km` : `${r} m`}
            </button>
          ))}
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          sort={sort}
          onSortChange={setSort}
        />

        {/* Content */}
        {loading ? (
          <LoadingSpinner text="Finding hospitals near you..." />
        ) : error ? (
          <div className="glass-card p-8 text-center">
            <p className="text-emergency-400 mb-4">{error}</p>
            <button onClick={fetchHospitals} className="btn-primary">Retry</button>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-400 text-lg">No hospitals found matching your criteria.</p>
            <button onClick={() => setFilters({ maxDistance: '', bedsAvailable: false, icuAvailable: false })} className="btn-outline mt-4">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-5 ${view === 'split' ? 'lg:grid-cols-2' : ''}`}>
            {/* Map */}
            {(view === 'split' || view === 'map') && (
              <div className={view === 'map' ? 'col-span-full' : ''} style={{ minHeight: '500px' }}>
                <MapView
                  hospitals={hospitals}
                  userLocation={userLocation}
                  selectedHospital={selectedHospital}
                  onHospitalClick={setSelectedHospital}
                  className="h-full"
                />
              </div>
            )}

            {/* List */}
            {(view === 'split' || view === 'list') && (
              <div className={`space-y-4 ${view === 'list' ? 'col-span-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 space-y-0' : 'max-h-[600px] overflow-y-auto pr-1'}`}>
                {hospitals.map((h) => (
                  <HospitalCard
                    key={h._id}
                    hospital={h}
                    onSelect={setSelectedHospital}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedHospital && (
        <HospitalDetailModal
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </div>
  );
}
