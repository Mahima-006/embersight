export function getSpreadDirection(fireId: string): { angle: number, label: string } {
  let hash = 0;
  for (let i = 0; i < fireId.length; i++) {
    hash = fireId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const angles = [
    { angle: 0, label: 'North' },
    { angle: 45, label: 'North-East' },
    { angle: 90, label: 'East' },
    { angle: 135, label: 'South-East' },
    { angle: 180, label: 'South' },
    { angle: 225, label: 'South-West' },
    { angle: 270, label: 'West' },
    { angle: 315, label: 'North-West' }
  ];
  return angles[Math.abs(hash) % angles.length];
}

export function calculateConePolygon(lng: number, lat: number, bearing: number, distanceKm: number = 15, spreadAngle: number = 45) {
  const R = 6371;
  const d = distanceKm / R;
  const lat1 = lat * Math.PI / 180;
  const lng1 = lng * Math.PI / 180;
  
  const getCoords = (brngDeg: number) => {
    const brng = brngDeg * Math.PI / 180;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng));
    const lng2 = lng1 + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
    return [lng2 * 180 / Math.PI, lat2 * 180 / Math.PI];
  };

  const pt1 = getCoords(bearing - spreadAngle/2);
  // Add a few points along the arc to make it rounded at the end
  const pt_mid1 = getCoords(bearing - spreadAngle/4);
  const pt2 = getCoords(bearing);
  const pt_mid2 = getCoords(bearing + spreadAngle/4);
  const pt3 = getCoords(bearing + spreadAngle/2);

  return [
    [lng, lat],
    pt1,
    pt_mid1,
    pt2,
    pt_mid2,
    pt3,
    [lng, lat]
  ];
}
