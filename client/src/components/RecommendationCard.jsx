import { FiMapPin, FiClock, FiNavigation, FiAward } from 'react-icons/fi';
import { MdOutlineBedroomParent, MdOutlineLocalHospital } from 'react-icons/md';
import { formatDistance, formatTravelTime, getAvailabilityColor, getWaitTimeColor, openNavigation } from '../utils/helpers';

const rankStyles = {
  1: {
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/5',
    badge: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    label: '🥇 Best Match',
  },
  2: {
    border: 'border-gray-400/30',
    bg: 'bg-gray-400/5',
    badge: 'bg-gradient-to-r from-gray-400 to-gray-500',
    label: '🥈 Runner Up',
  },
  3: {
    border: 'border-amber-700/30',
    bg: 'bg-amber-700/5',
    badge: 'bg-gradient-to-r from-amber-700 to-amber-800',
    label: '🥉 Third Choice',
  },
};

export default function RecommendationCard({ recommendation }) {
  const { rank, hospital, distance, travelTime, score, reasoning } = recommendation;
  const style = rankStyles[rank] || rankStyles[3];
  const bedPct = hospital.totalBeds > 0 ? (hospital.bedsAvailable / hospital.totalBeds) * 100 : 0;
  const icuPct = hospital.totalIcu > 0 ? (hospital.icuAvailable / hospital.totalIcu) * 100 : 0;

  return (
    <div
      className={`rounded-2xl border-2 ${style.border} ${style.bg} backdrop-blur-xl p-6 transition-all duration-300 
                  hover:shadow-xl ${rank === 1 ? 'hover:shadow-yellow-500/10 scale-[1.02]' : 'hover:shadow-primary-500/5'}`}
      id={`recommendation-${rank}`}
    >
      {/* Rank Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`${style.badge} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}>
            #{rank}
          </span>
          <span className="text-sm font-medium text-gray-300">{style.label}</span>
        </div>
        <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
          <FiAward className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-sm font-bold text-primary-400">{Math.round(score * 100)}%</span>
        </div>
      </div>

      {/* Hospital Name */}
      <h3 className="text-xl font-bold text-white mb-1">{hospital.name}</h3>
      <p className="text-sm text-gray-400 mb-4">{hospital.address}</p>

      {/* Distance & Time */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-sm">
          <FiMapPin className="w-4 h-4 text-primary-400" />
          <span className="text-gray-300">{formatDistance(distance)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <FiClock className="w-4 h-4 text-yellow-400" />
          <span className="text-gray-300">~{formatTravelTime(travelTime)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <MdOutlineBedroomParent className="w-5 h-5 text-primary-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-white">{hospital.bedsAvailable}/{hospital.totalBeds}</p>
          <p className="text-[10px] text-gray-500">Beds</p>
          <div className="progress-bar mt-1">
            <div className={`progress-fill ${getAvailabilityColor(hospital.bedsAvailable, hospital.totalBeds)}`}
                 style={{ width: `${bedPct}%` }} />
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <MdOutlineLocalHospital className="w-5 h-5 text-emergency-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-white">{hospital.icuAvailable}/{hospital.totalIcu}</p>
          <p className="text-[10px] text-gray-500">ICU</p>
          <div className="progress-bar mt-1">
            <div className={`progress-fill ${getAvailabilityColor(hospital.icuAvailable, hospital.totalIcu)}`}
                 style={{ width: `${icuPct}%` }} />
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <FiClock className={`w-5 h-5 ${getWaitTimeColor(hospital.waitingTime)} mx-auto mb-1`} />
          <p className={`text-sm font-bold ${getWaitTimeColor(hospital.waitingTime)}`}>{hospital.waitingTime} min</p>
          <p className="text-[10px] text-gray-500">Wait Time</p>
        </div>
      </div>

      {/* Reasoning */}
      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <h4 className="text-xs font-semibold text-primary-400 uppercase tracking-wide mb-2">Why this hospital?</h4>
        <ul className="space-y-1">
          {reasoning.map((reason, i) => (
            <li key={i} className="text-sm text-gray-300 leading-relaxed">{reason}</li>
          ))}
        </ul>
      </div>

      {/* Navigate Button */}
      <button
        className="w-full flex items-center justify-center gap-2 btn-primary"
        onClick={() => openNavigation(hospital.location.lat, hospital.location.lng, hospital.name)}
      >
        <FiNavigation className="w-4 h-4" />
        Navigate to Hospital
      </button>
    </div>
  );
}
