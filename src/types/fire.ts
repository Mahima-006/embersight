export interface FireIncident {
  id: string;
  name: string;
  lat: number;
  lng: number;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  status: string;
  acreage: number;
  containment: number;
  startDate: string;
  cause: string;
  agency: string;
  state: string;
}

export const severityColors = {
  critical: '#FF2D00',
  high: '#FF5C00',
  moderate: '#FFC800',
  low: '#4ADE80',
};
