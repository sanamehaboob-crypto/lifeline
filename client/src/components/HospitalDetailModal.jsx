import { useEffect, useCallback } from 'react';
import { FiX, FiMapPin, FiClock, FiNavigation, FiPhone, FiActivity } from 'react-icons/fi';
import { MdOutlineBedroomParent, MdOutlineLocalHospital } from 'react-icons/md';
import { formatDistance, formatTravelTime, getAvailabilityColor, getWaitTimeColor, openNavigation } from '../utils/helpers';

export default function HospitalDetailModal({ hospital, onClose }) {
  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!hospital) return null;

  const bedPct = hospital.totalBeds > 0 ? (hospital.bedsAvailable / hospital.totalBeds) * 100 : 0;
  const icuPct = hospital.totalIcu > 0 ? (hospital.icuAvailable / hospital.totalIcu) * 100 : 0;
  const lastUpdated = hospital.lastUpdated
    ? new Date(hospital.lastUpdated).toLocaleString()
    : 'N/A';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      id="hospital-detail-modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-dark-800/95 backdrop-blur-xl shadow-2xl animate-slideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/5 border border-white/10 
                     text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          id="modal-close-btn"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/5">
          <div className="flex items-start gap-3 pr-10">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <MdOutlineLocalHospital className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{hospital.name}</h2>
              <p className="text-sm text-gray-400 mt-1">{hospital.address}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {hospital.emergencyServices && (
              <span className="badge-emergency text-[10px]">🚨 24/7 Emergency</span>
            )}
            {hospital.distance !== undefined && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary-500/10 text-primary-400 border border-primary-500/20 px-2.5 py-1 rounded-full">
                <FiMapPin className="w-3 h-3" />
                {formatDistance(hospital.distance)}
              </span>
            )}
            {hospital.travelTime !== undefined && (
              <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-full">
                <FiClock className="w-3 h-3" />
                ~{formatTravelTime(hospital.travelTime)}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Contact */}
          {hospital.phone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-trust-500/10 border border-trust-500/20 flex items-center justify-center shrink-0">
                <FiPhone className="w-5 h-5 text-trust-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Phone</p>
                <a href={`tel:${hospital.phone}`} className="text-sm text-white hover:text-primary-400 transition-colors">
                  {hospital.phone}
                </a>
              </div>
            </div>
          )}

          {/* Availability Stats */}
          <div className="grid grid-cols-3 gap-3">
            {/* Beds */}
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
              <MdOutlineBedroomParent className="w-6 h-6 text-primary-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{hospital.bedsAvailable}<span className="text-sm text-gray-500">/{hospital.totalBeds}</span></p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Beds Available</p>
              <div className="progress-bar mt-2">
                <div
                  className={`progress-fill ${getAvailabilityColor(hospital.bedsAvailable, hospital.totalBeds)}`}
                  style={{ width: `${bedPct}%` }}
                />
              </div>
            </div>

            {/* ICU */}
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
              <MdOutlineLocalHospital className="w-6 h-6 text-emergency-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{hospital.icuAvailable}<span className="text-sm text-gray-500">/{hospital.totalIcu}</span></p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">ICU Available</p>
              <div className="progress-bar mt-2">
                <div
                  className={`progress-fill ${getAvailabilityColor(hospital.icuAvailable, hospital.totalIcu)}`}
                  style={{ width: `${icuPct}%` }}
                />
              </div>
            </div>

            {/* Wait Time */}
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
              <FiClock className={`w-6 h-6 ${getWaitTimeColor(hospital.waitingTime)} mx-auto mb-2`} />
              <p className={`text-lg font-bold ${getWaitTimeColor(hospital.waitingTime)}`}>{hospital.waitingTime}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Min Wait</p>
            </div>
          </div>

          {/* Specialties */}
          {hospital.specialties && hospital.specialties.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FiActivity className="w-4 h-4 text-primary-400" />
                <h4 className="text-sm font-semibold text-white">Specialties</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {hospital.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="text-xs bg-white/5 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-white/5">
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            className="flex-1 flex items-center justify-center gap-2 btn-primary"
            onClick={() => openNavigation(hospital.location.lat, hospital.location.lng, hospital.name)}
            id="modal-navigate-btn"
          >
            <FiNavigation className="w-4 h-4" />
            Navigate
          </button>
          {hospital.phone && (
            <a
              href={`tel:${hospital.phone}`}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-trust-500/10 border border-trust-500/20 
                         text-trust-400 font-medium rounded-xl hover:bg-trust-500/20 transition-all"
              id="modal-call-btn"
            >
              <FiPhone className="w-4 h-4" />
              Call
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
