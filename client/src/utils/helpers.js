/**
 * Format distance for display
 */
export const formatDistance = (km) => {
  if (km === undefined || km === null) return 'N/A';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

/**
 * Format travel time for display
 */
export const formatTravelTime = (minutes) => {
  if (minutes === undefined || minutes === null) return 'N/A';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Get urgency color class
 */
export const getUrgencyColor = (urgency) => {
  switch (urgency) {
    case 'Emergency': return 'text-emergency-400';
    case 'Medium': return 'text-yellow-400';
    case 'Low': return 'text-trust-400';
    default: return 'text-gray-400';
  }
};

/**
 * Get urgency badge class
 */
export const getUrgencyBadge = (urgency) => {
  switch (urgency) {
    case 'Emergency': return 'badge-emergency';
    case 'Medium': return 'badge-medium';
    case 'Low': return 'badge-low';
    default: return 'badge-low';
  }
};

/**
 * Get availability color based on percentage
 */
export const getAvailabilityColor = (available, total) => {
  if (total === 0) return 'bg-gray-500';
  const pct = (available / total) * 100;
  if (pct > 50) return 'bg-trust-500';
  if (pct > 20) return 'bg-yellow-500';
  return 'bg-emergency-500';
};

/**
 * Get waiting time color
 */
export const getWaitTimeColor = (minutes) => {
  if (minutes <= 15) return 'text-trust-400';
  if (minutes <= 45) return 'text-yellow-400';
  return 'text-emergency-400';
};

/**
 * Open Google Maps navigation
 */
export const openNavigation = (lat, lng, name) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
  window.open(url, '_blank');
};
