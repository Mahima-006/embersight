export interface LocationEntry {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  state: string;
  riskBias: number; // 0-1, higher = higher base risk
  isState?: boolean;
}

export const featuredLocations: LocationEntry[] = [
  { name: 'los angeles', displayName: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437, state: 'CA', riskBias: 0.82 },
  { name: 'san francisco', displayName: 'San Francisco, CA', lat: 37.7749, lng: -122.4194, state: 'CA', riskBias: 0.55 },
  { name: 'san diego', displayName: 'San Diego, CA', lat: 32.7157, lng: -117.1611, state: 'CA', riskBias: 0.72 },
  { name: 'sacramento', displayName: 'Sacramento, CA', lat: 38.5816, lng: -121.4944, state: 'CA', riskBias: 0.78 },
  { name: 'fresno', displayName: 'Fresno, CA', lat: 36.7378, lng: -119.7871, state: 'CA', riskBias: 0.85 },
  { name: 'bakersfield', displayName: 'Bakersfield, CA', lat: 35.3733, lng: -119.0187, state: 'CA', riskBias: 0.88 },
  { name: 'california', displayName: 'California, USA', lat: 36.7783, lng: -119.4179, state: 'CA', riskBias: 0.80, isState: true },
  { name: 'portland', displayName: 'Portland, OR', lat: 45.5051, lng: -122.6750, state: 'OR', riskBias: 0.58 },
  { name: 'seattle', displayName: 'Seattle, WA', lat: 47.6062, lng: -122.3321, state: 'WA', riskBias: 0.42 },
  { name: 'phoenix', displayName: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740, state: 'AZ', riskBias: 0.90 },
  { name: 'tucson', displayName: 'Tucson, AZ', lat: 32.2226, lng: -110.9747, state: 'AZ', riskBias: 0.86 },
  { name: 'las vegas', displayName: 'Las Vegas, NV', lat: 36.1699, lng: -115.1398, state: 'NV', riskBias: 0.84 },
  { name: 'reno', displayName: 'Reno, NV', lat: 39.5296, lng: -119.8138, state: 'NV', riskBias: 0.79 },
  { name: 'denver', displayName: 'Denver, CO', lat: 39.7392, lng: -104.9903, state: 'CO', riskBias: 0.62 },
  { name: 'salt lake city', displayName: 'Salt Lake City, UT', lat: 40.7608, lng: -111.8910, state: 'UT', riskBias: 0.68 },
  { name: 'boise', displayName: 'Boise, ID', lat: 43.6150, lng: -116.2023, state: 'ID', riskBias: 0.74 },
  { name: 'new york', displayName: 'New York, NY', lat: 40.7128, lng: -74.0060, state: 'NY', riskBias: 0.15 },
  { name: 'chicago', displayName: 'Chicago, IL', lat: 41.8781, lng: -87.6298, state: 'IL', riskBias: 0.12 },
  { name: 'miami', displayName: 'Miami, FL', lat: 25.7617, lng: -80.1918, state: 'FL', riskBias: 0.28 },
  { name: 'austin', displayName: 'Austin, TX', lat: 30.2672, lng: -97.7431, state: 'TX', riskBias: 0.65 },
  { name: 'dallas', displayName: 'Dallas, TX', lat: 32.7767, lng: -96.7970, state: 'TX', riskBias: 0.60 },
  { name: 'albuquerque', displayName: 'Albuquerque, NM', lat: 35.0853, lng: -106.6056, state: 'NM', riskBias: 0.82 },
  { name: 'flagstaff', displayName: 'Flagstaff, AZ', lat: 35.1983, lng: -111.6513, state: 'AZ', riskBias: 0.75 },
  { name: 'redding', displayName: 'Redding, CA', lat: 40.5865, lng: -122.3917, state: 'CA', riskBias: 0.91 },
  { name: 'tahoe', displayName: 'Lake Tahoe, CA', lat: 38.9399, lng: -119.9772, state: 'CA', riskBias: 0.80 },
  { name: 'yosemite', displayName: 'Yosemite, CA', lat: 37.8651, lng: -119.5383, state: 'CA', riskBias: 0.76 },
  { name: 'palm springs', displayName: 'Palm Springs, CA', lat: 33.8303, lng: -116.5453, state: 'CA', riskBias: 0.93 },
  { name: 'santa barbara', displayName: 'Santa Barbara, CA', lat: 34.4208, lng: -119.6982, state: 'CA', riskBias: 0.77 },
];

export function searchLocations(query: string): LocationEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return featuredLocations
    .filter(l => l.name.includes(q) || l.displayName.toLowerCase().includes(q))
    .slice(0, 6);
}
