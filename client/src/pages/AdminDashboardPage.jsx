import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateHospital, getHospitalById } from '../services/api';
import { FiLogOut, FiSave, FiRefreshCw, FiClock } from 'react-icons/fi';
import { MdOutlineBedroomParent, MdOutlineLocalHospital } from 'react-icons/md';

export default function AdminDashboardPage() {
  const { admin, hospital, logout, updateHospitalData } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bedsAvailable: 0,
    icuAvailable: 0,
    waitingTime: 0,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (hospital) {
      setForm({
        bedsAvailable: hospital.bedsAvailable || 0,
        icuAvailable: hospital.icuAvailable || 0,
        waitingTime: hospital.waitingTime || 0,
      });
    }
  }, [hospital]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await updateHospital({
        bedsAvailable: parseInt(form.bedsAvailable),
        icuAvailable: parseInt(form.icuAvailable),
        waitingTime: parseInt(form.waitingTime),
      });
      updateHospitalData(res.data);
      setSuccess('Hospital data updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const res = await getHospitalById(admin.hospitalId);
      updateHospitalData(res.data);
      setForm({
        bedsAvailable: res.data.bedsAvailable || 0,
        icuAvailable: res.data.icuAvailable || 0,
        waitingTime: res.data.waitingTime || 0,
      });
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!hospital) return null;

  const lastUpdated = hospital.lastUpdated
    ? new Date(hospital.lastUpdated).toLocaleString()
    : 'Never';

  return (
    <div className="min-h-screen pt-24 px-4 pb-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">
              Managing: <span className="text-primary-400 font-medium">{hospital.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            <button onClick={handleRefresh} className="btn-outline py-2 px-4 text-sm flex items-center gap-2">
              <FiRefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-emergency-500/10 border border-emergency-500/30 text-emergency-400 text-sm font-medium rounded-xl hover:bg-emergency-500/20 transition-all">
              <FiLogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Hospital Info Card */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">{hospital.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <p className="text-gray-400">📍 {hospital.address}</p>
            <p className="text-gray-400">📞 {hospital.phone}</p>
            <p className="text-gray-400">🛏️ Total Beds: <span className="text-white font-medium">{hospital.totalBeds}</span></p>
            <p className="text-gray-400">🏥 Total ICU: <span className="text-white font-medium">{hospital.totalIcu}</span></p>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-xs text-gray-500">Last updated: {lastUpdated}</p>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-4 p-4 bg-trust-500/10 border border-trust-500/30 rounded-xl animate-slide-up">
            <p className="text-sm text-trust-400 font-medium">✅ {success}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-emergency-500/10 border border-emergency-500/30 rounded-xl animate-slide-up">
            <p className="text-sm text-emergency-400">❌ {error}</p>
          </div>
        )}

        {/* Update Form */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-6">Update Availability</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Beds Available */}
            <div className="bg-white/5 rounded-2xl p-5 text-center">
              <MdOutlineBedroomParent className="w-8 h-8 text-primary-400 mx-auto mb-3" />
              <label className="text-sm text-gray-400 block mb-3">Beds Available</label>
              <input
                type="number"
                min="0"
                max={hospital.totalBeds}
                value={form.bedsAvailable}
                onChange={(e) => setForm({ ...form, bedsAvailable: e.target.value })}
                className="input-field text-center text-2xl font-bold"
                id="input-beds"
              />
              <p className="text-xs text-gray-500 mt-2">out of {hospital.totalBeds}</p>
              <input
                type="range"
                min="0"
                max={hospital.totalBeds}
                value={form.bedsAvailable}
                onChange={(e) => setForm({ ...form, bedsAvailable: e.target.value })}
                className="w-full mt-3 accent-primary-500"
              />
            </div>

            {/* ICU Available */}
            <div className="bg-white/5 rounded-2xl p-5 text-center">
              <MdOutlineLocalHospital className="w-8 h-8 text-emergency-400 mx-auto mb-3" />
              <label className="text-sm text-gray-400 block mb-3">ICU Available</label>
              <input
                type="number"
                min="0"
                max={hospital.totalIcu}
                value={form.icuAvailable}
                onChange={(e) => setForm({ ...form, icuAvailable: e.target.value })}
                className="input-field text-center text-2xl font-bold"
                id="input-icu"
              />
              <p className="text-xs text-gray-500 mt-2">out of {hospital.totalIcu}</p>
              <input
                type="range"
                min="0"
                max={hospital.totalIcu}
                value={form.icuAvailable}
                onChange={(e) => setForm({ ...form, icuAvailable: e.target.value })}
                className="w-full mt-3 accent-emergency-500"
              />
            </div>

            {/* Waiting Time */}
            <div className="bg-white/5 rounded-2xl p-5 text-center">
              <FiClock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <label className="text-sm text-gray-400 block mb-3">Waiting Time (min)</label>
              <input
                type="number"
                min="0"
                max="300"
                value={form.waitingTime}
                onChange={(e) => setForm({ ...form, waitingTime: e.target.value })}
                className="input-field text-center text-2xl font-bold"
                id="input-waittime"
              />
              <p className="text-xs text-gray-500 mt-2">minutes</p>
              <input
                type="range"
                min="0"
                max="120"
                value={form.waitingTime}
                onChange={(e) => setForm({ ...form, waitingTime: e.target.value })}
                className="w-full mt-3 accent-yellow-500"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
            id="btn-save-hospital"
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
