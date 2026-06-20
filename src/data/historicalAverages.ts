export interface MonthlyData {
  month: string;
  fires: number;
  acreage: number;
}

export interface AnnualData {
  year: number;
  fires: number;
  acreage: number;
  avgSeverity: number;
}

export interface SeverityTrend {
  month: string;
  severity: number;
  temperature: number;
}

export const monthlyData: MonthlyData[] = [
  { month: 'Jan', fires: 12, acreage: 1200 },
  { month: 'Feb', fires: 8,  acreage: 940 },
  { month: 'Mar', fires: 15, acreage: 2100 },
  { month: 'Apr', fires: 22, acreage: 3400 },
  { month: 'May', fires: 38, acreage: 6800 },
  { month: 'Jun', fires: 72, acreage: 18200 },
  { month: 'Jul', fires: 148, acreage: 52000 },
  { month: 'Aug', fires: 184, acreage: 68000 },
  { month: 'Sep', fires: 132, acreage: 41000 },
  { month: 'Oct', fires: 88, acreage: 24000 },
  { month: 'Nov', fires: 31, acreage: 5200 },
  { month: 'Dec', fires: 18, acreage: 2100 },
];

export const annualData: AnnualData[] = [
  { year: 2018, fires: 524, acreage: 189000, avgSeverity: 62 },
  { year: 2019, fires: 612, acreage: 254000, avgSeverity: 67 },
  { year: 2020, fires: 897, acreage: 412000, avgSeverity: 78 },
  { year: 2021, fires: 842, acreage: 381000, avgSeverity: 75 },
  { year: 2022, fires: 763, acreage: 298000, avgSeverity: 71 },
  { year: 2023, fires: 918, acreage: 453000, avgSeverity: 82 },
  { year: 2024, fires: 768, acreage: 344000, avgSeverity: 77 },
];

export const severityTrend: SeverityTrend[] = [
  { month: 'Jan', severity: 28, temperature: 14 },
  { month: 'Feb', severity: 24, temperature: 16 },
  { month: 'Mar', severity: 32, temperature: 19 },
  { month: 'Apr', severity: 41, temperature: 23 },
  { month: 'May', severity: 54, temperature: 27 },
  { month: 'Jun', severity: 71, temperature: 32 },
  { month: 'Jul', severity: 88, temperature: 38 },
  { month: 'Aug', severity: 92, temperature: 40 },
  { month: 'Sep', severity: 79, temperature: 36 },
  { month: 'Oct', severity: 61, temperature: 29 },
  { month: 'Nov', severity: 38, temperature: 22 },
  { month: 'Dec', severity: 29, temperature: 16 },
];
