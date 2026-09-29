import { FiSliders, FiFilter } from 'react-icons/fi';

export default function FilterPanel({ filters, onFilterChange, onSortChange, sort }) {
  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <FiSliders className="w-4 h-4 text-primary-400" />
        <h3 className="text-sm font-semibold text-white">Filters & Sort</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Max Distance */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Max Distance</label>
          <select
            value={filters.maxDistance || ''}
            onChange={(e) => onFilterChange({ ...filters, maxDistance: e.target.value })}
            className="input-field text-sm py-2"
            id="filter-distance"
          >
            <option value="">All distances</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="20">Within 20 km</option>
            <option value="50">Within 50 km</option>
          </select>
        </div>

        {/* Bed Availability */}
        <div className="flex items-center gap-3 pt-5">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.bedsAvailable || false}
              onChange={(e) => onFilterChange({ ...filters, bedsAvailable: e.target.checked })}
              className="sr-only peer"
              id="filter-beds"
            />
            <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full
                            after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
            <span className="ml-2 text-sm text-gray-300">Beds Available</span>
          </label>
        </div>

        {/* ICU Availability */}
        <div className="flex items-center gap-3 pt-5">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.icuAvailable || false}
              onChange={(e) => onFilterChange({ ...filters, icuAvailable: e.target.checked })}
              className="sr-only peer"
              id="filter-icu"
            />
            <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full
                            after:h-4 after:w-4 after:transition-all peer-checked:bg-emergency-500"></div>
            <span className="ml-2 text-sm text-gray-300">ICU Available</span>
          </label>
        </div>

        {/* Sort */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Sort By</label>
          <select
            value={sort || 'distance'}
            onChange={(e) => onSortChange(e.target.value)}
            className="input-field text-sm py-2"
            id="sort-select"
          >
            <option value="distance">Nearest First</option>
            <option value="waitingTime">Shortest Wait</option>
            <option value="beds">Most Beds Available</option>
            <option value="icu">Most ICU Available</option>
          </select>
        </div>
      </div>
    </div>
  );
}
