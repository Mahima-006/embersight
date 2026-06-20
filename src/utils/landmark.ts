interface Landmark {
  name: string;
  lat: number;
  lng: number;
}

const LANDMARKS: Landmark[] = [
  { name: 'Yosemite National Park', lat: 37.8651, lng: -119.5383 },
  { name: 'Sierra National Forest', lat: 37.1920, lng: -119.3210 },
  { name: 'Lake Tahoe', lat: 39.0968, lng: -120.0324 },
  { name: 'Angeles National Forest', lat: 34.3142, lng: -118.0645 },
  { name: 'Joshua Tree National Park', lat: 33.8734, lng: -115.9010 },
  { name: 'Sequoia National Park', lat: 36.4864, lng: -118.5658 },
  { name: 'Death Valley National Park', lat: 36.5323, lng: -116.9325 },
  { name: 'Big Sur Coastline', lat: 36.2704, lng: -121.8081 },
  { name: 'Mount Shasta Wilderness', lat: 41.4092, lng: -122.1949 },
  { name: 'Cleveland National Forest', lat: 32.7562, lng: -116.5982 },
  { name: 'Redwood National Park', lat: 41.2132, lng: -124.0046 },
  { name: 'Kings Canyon National Park', lat: 36.8879, lng: -118.5551 },
  { name: 'Point Reyes National Seashore', lat: 38.0692, lng: -122.9062 },
  { name: 'San Bernardino National Forest', lat: 34.1833, lng: -116.9833 },
  { name: 'Mount Rainier National Park', lat: 46.8523, lng: -121.7603 }
];

export function getNearestLandmark(lat: number, lng: number): string {
  let minDistance = Infinity;
  let nearest: Landmark | null = null;
  
  for (const landmark of LANDMARKS) {
    const dlat = landmark.lat - lat;
    const dlng = landmark.lng - lng;
    // Euclidean distance in degrees is fine for local proximity checking
    const dist = Math.sqrt(dlat * dlat + dlng * dlng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = landmark;
    }
  }
  
  // 1 degree is roughly 111km, 0.85 degrees is ~94km
  if (nearest && minDistance < 0.85) {
    if (nearest.name === 'Sierra National Forest' || nearest.name === 'Yosemite National Park') {
      return 'Near Yosemite National Park';
    }
    return `Near ${nearest.name}`;
  }
  
  return `Area near ${lat.toFixed(3)}°N, ${Math.abs(lng).toFixed(3)}°W`;
}
