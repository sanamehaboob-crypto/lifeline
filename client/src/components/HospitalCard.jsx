import { FiMapPin, FiClock, FiNavigation } from 'react-icons/fi';
import { MdOutlineBedroomParent, MdOutlineLocalHospital } from 'react-icons/md';
import { formatDistance, formatTravelTime, getAvailabilityColor, getWaitTimeColor, openNavigation } from '../utils/helpers';

export default function HospitalCard({ hospital, onSelect }) {
  const bedPct = hospital.totalBeds > 0 ? (hospital.bedsAvailable / hospital.totalBeds) * 100 : 0;
  const icuPct = hospital.totalIcu > 0 ? (hospital.icuAvailable / hospital.totalIcu) * 100 : 0;

  return (
    <div
      className="glass-card-hover p-5 cursor-pointer group"
      onClick={() => onSelect?.(hospital)}
      id={`hospital-card-${hospital._id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
            {hospital.name}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{hospital.address}</p>
        </div>
        {hospital.emergencyServices && (
          <span className="badge-emergency text-[10px] ml-2 shrink-0">24/7</span>
        )}
      </div>

      {/* Distance & Time */}
      {hospital.distance !== undefined && (
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-sm">
            <FiMapPin className="w-4 h-4 text-primary-400" />
            <span className="text-gray-300">{formatDistance(hospital.distance)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <FiClock className={`w-4 h-4 ${getWaitTimeColor(hospital.travelTime || 0)}`} />
            <span className="text-gray-300">~{formatTravelTime(hospital.travelTime)}</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Beds */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MdOutlineBedroomParent className="w-4 h-4 text-primary-400" />
            <span className="text-xs text-gray-500">Beds</span>
          </div>
          <p className="text-sm font-bold text-white">{hospital.bedsAvailable}/{hospital.totalBeds}</p>
          <div className="progress-bar mt-1">
            <div
              className={`progress-fill ${getAvailabilityColor(hospital.bedsAvailable, hospital.totalBeds)}`}
              style={{ width: `${bedPct}%` }}
            />
          </div>
        </div>

        {/* ICU */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MdOutlineLocalHospital className="w-4 h-4 text-emergency-400" />
            <span className="text-xs text-gray-500">ICU</span>
          </div>
          <p className="text-sm font-bold text-white">{hospital.icuAvailable}/{hospital.totalIcu}</p>
          <div className="progress-bar mt-1">
            <div
              className={`progress-fill ${getAvailabilityColor(hospital.icuAvailable, hospital.totalIcu)}`}
              style={{ width: `${icuPct}%` }}
            />
          </div>
        </div>

        {/* Wait Time */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FiClock className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-500">Wait</span>
          </div>
          <p className={`text-sm font-bold ${getWaitTimeColor(hospital.waitingTime)}`}>
            {hospital.waitingTime} min
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-500/10 border border-primary-500/20 
                     text-primary-400 text-sm font-medium rounded-lg hover:bg-primary-500/20 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(hospital);
          }}
        >
          View Details
        </button>
        <button
          className="flex items-center justify-center gap-2 px-3 py-2 bg-trust-500/10 border border-trust-500/20 
                     text-trust-400 text-sm font-medium rounded-lg hover:bg-trust-500/20 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            openNavigation(hospital.location.lat, hospital.location.lng, hospital.name);
          }}
          title="Navigate"
        >
          <FiNavigation className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
