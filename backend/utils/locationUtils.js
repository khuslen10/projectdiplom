/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c * 1000; // Distance in meters
  return distance;
};

/**
 * Check if location is within allowed radius of office
 * @param {number} latitude - Current latitude
 * @param {number} longitude - Current longitude
 * @param {number} officeLat - Office latitude
 * @param {number} officeLng - Office longitude
 * @param {number} allowedRadius - Allowed radius in meters
 * @returns {object} Result with distance and status
 */
exports.isWithinOfficeRadius = (latitude, longitude, officeLat, officeLng, allowedRadius) => {
  const distance = this.calculateDistance(latitude, longitude, officeLat, officeLng);
  return {
    distance,
    isWithin: distance <= allowedRadius,
    allowedRadius
  };
};
