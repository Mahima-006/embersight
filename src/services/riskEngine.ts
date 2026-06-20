export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface RiskFactor {
  id: string;
  label: string;
  value: string;
  contribution: number;
  maxContribution: number;
  icon: string;
  detail: string;
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  state: string;
  summary: string;
}

export function getOfflineRiskResult(state: string): RiskResult {
  return {
    score: 0,
    level: 'Low',
    state,
    summary: 'Data unavailable (Offline). Please ensure the backend is running and API keys are configured.',
    factors: [
      { id: 'temperature', label: 'Temperature', value: 'N/A', contribution: 0, maxContribution: 25, icon: '🌡️', detail: 'Offline' },
      { id: 'humidity', label: 'Humidity', value: 'N/A', contribution: 0, maxContribution: 25, icon: '💧', detail: 'Offline' },
      { id: 'wind_speed', label: 'Wind Speed', value: 'N/A', contribution: 0, maxContribution: 20, icon: '💨', detail: 'Offline' },
      { id: 'fire_density', label: 'Active Fires', value: 'N/A', contribution: 0, maxContribution: 30, icon: '🔥', detail: 'Offline' }
    ]
  };
}
