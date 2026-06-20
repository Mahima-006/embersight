import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, BarChart2, Bell } from 'lucide-react';
import FireMap from '../components/Map/FireMap';
import RiskScore from '../components/RiskPanel/RiskScore';
import ExplainabilityPanel from '../components/RiskPanel/ExplainabilityPanel';
import MonthlyActivityChart from '../components/Charts/MonthlyActivityChart';
import AnnualFrequencyChart from '../components/Charts/AnnualFrequencyChart';
import LocationSearch from '../components/Search/LocationSearch';
import ForecastPanel from '../components/RiskPanel/ForecastPanel';
import CommunityImpactPanel from '../components/RiskPanel/CommunityImpactPanel';
import { getOfflineRiskResult, type RiskResult, type RiskFactor } from '../services/riskEngine';
import type { LocationEntry } from '../data/featuredLocations';
import type { FireIncident } from '../types/fire';
import RiskExplainDrawer from '../components/RiskPanel/RiskExplainDrawer';
import { getNearestLandmark } from '../utils/landmark';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://embersight.onrender.com";

const DEFAULT_LOCATION: LocationEntry = {
  name: 'california',
  displayName: 'California, USA',
  lat: 36.7783,
  lng: -119.4179,
  state: 'CA',
  riskBias: 0.80,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<LocationEntry>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [fires, setFires] = useState<FireIncident[]>([]);
  
  // Part 3 States
  const [historyResult, setHistoryResult] = useState<any>(null);
  const [forecastResult, setForecastResult] = useState<any>(null);
  const [impactResult, setImpactResult] = useState<any>(null);
  const [freshnessLabel, setFreshnessLabel] = useState<string>('Powered by NASA FIRMS & OpenWeather • Last updated: Just now');

  // Collapse and explain drawer states
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const [isExplainDrawerOpen, setIsExplainDrawerOpen] = useState(false);

  // Client-side relative freshness ticker
  useEffect(() => {
    if (!riskResult) return;
    const fetchTime = new Date();
    
    const updateLabel = () => {
      const diffMs = Date.now() - fetchTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins === 0) {
        setFreshnessLabel('Powered by NASA FIRMS & OpenWeather • Last updated: Just now');
      } else {
        setFreshnessLabel(`Powered by NASA FIRMS & OpenWeather • Last updated: ${diffMins} min${diffMins > 1 ? 's' : ''} ago`);
      }
    };
    
    updateLabel();
    const interval = setInterval(updateLabel, 30000);
    return () => clearInterval(interval);
  }, [riskResult]);

  // Fetch all location-dependent data on selected location change
  useEffect(() => {
    let active = true;
    const fetchAllData = async () => {
      setLoading(true);
      
      const { lat, lng } = selectedLocation;
      
      try {
        const [riskResp, recResp, firesResp, histResp, foreResp, impResp] =
        await Promise.all([
          fetch(`${API_BASE_URL}/risk?lat=${lat}&lon=${lng}`),
          fetch(`${API_BASE_URL}/recommendations?lat=${lat}&lon=${lng}`),
          fetch(`${API_BASE_URL}/fires?lat=${lat}&lon=${lng}`),
          fetch(`${API_BASE_URL}/risk/history?lat=${lat}&lon=${lng}`),
          fetch(`${API_BASE_URL}/risk/forecast?lat=${lat}&lon=${lng}`),
          fetch(`${API_BASE_URL}/community-impact?lat=${lat}&lon=${lng}`)
        ]);
        
        if (!riskResp.ok || !recResp.ok || !firesResp.ok) {
          throw new Error('API server returned error');
        }
        
        const riskData = await riskResp.json();
        const recData = await recResp.json();
        const firesData = await firesResp.json();
        
        let histData = { current: riskData.risk_score, last_week: riskData.risk_score, last_month: riskData.risk_score, change_vs_last_week_pct: 0 };
        let foreData = { today: riskData.risk_score, tomorrow: riskData.risk_score + 2, in_3_days: riskData.risk_score + 4 };
        let impData = { population_estimate: 25000, schools_nearby: 5, hospitals_nearby: 1 };
        
        if (histResp.ok) histData = await histResp.json();
        if (foreResp.ok) foreData = await foreResp.json();
        if (impResp.ok) impData = await impResp.json();
        
        if (!active) return;
        
        // Translate backend risk breakdown to frontend RiskResult
        const mappedFactors: RiskFactor[] = riskData.breakdown.map((b: any) => {
          const factorId = b.factor.toLowerCase().replace(' ', '_');
          let icon = '🌡️';
          if (factorId === 'humidity') icon = '💧';
          else if (factorId === 'wind_speed') icon = '💨';
          else if (factorId === 'fire_density') icon = '🔥';
          
          return {
            id: factorId,
            label: b.factor,
            value: b.value,
            contribution: Math.round(b.contribution),
            maxContribution: b.weight_pct,
            icon,
            detail: `${b.factor} sub-score: ${Math.round(b.sub_score)}/100 (contribution: ${Math.round(b.contribution)} pts)`
          };
        });
        
        const riskResultObj: RiskResult = {
          score: riskData.risk_score,
          level: riskData.risk_level,
          factors: mappedFactors,
          state: selectedLocation.state,
          summary: `${selectedLocation.displayName} is experiencing ${riskData.risk_level.toLowerCase()} wildfire risk (${riskData.risk_score}/100) based on current environmental data.`
        };
        
        // Translate hotspots to incidents
        const mappedFires: FireIncident[] = firesData.hotspots.map((h: any, idx: number) => {
          let severity: 'critical' | 'high' | 'moderate' | 'low' = 'low';
          if (h.frp >= 150) severity = 'critical';
          else if (h.frp >= 80) severity = 'high';
          else if (h.frp >= 30) severity = 'moderate';
          
          return {
            id: `firms-${idx}-${h.lat}-${h.lon}`,
            name: `Satellite Detection #${idx + 1}`,
            lat: h.lat,
            lng: h.lon,
            severity,
            status: 'Active',
            acreage: Math.round(h.frp * 1.5),
            containment: 0,
            startDate: h.acq_date + ' ' + h.acq_time,
            cause: 'Satellite Detection',
            agency: h.satellite || 'VIIRS',
            state: 'Active'
          };
        });
        
        setRiskResult(riskResultObj);
        setRecommendations(recData);
        setFires(mappedFires);
        setHistoryResult(histData);
        setForecastResult(foreData);
        setImpactResult(impData);
      } catch (err) {
        console.warn('Failed to load backend data, falling back to offline state:', err);
        if (!active) return;
        
        const result = getOfflineRiskResult(selectedLocation.state);
        setRiskResult(result);
        setRecommendations(null);
        setFires([]);
        setHistoryResult(null);
        setForecastResult(null);
        setImpactResult(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    
    fetchAllData();
    return () => { active = false; };
  }, [selectedLocation]);

  const [activeTab, setActiveTab] = useState<'risk' | 'fires'>('risk');
  const [activeMobileTab, setActiveMobileTab] = useState<'map' | 'risk' | 'alerts' | 'settings'>('map');

  const handleLocationSelect = useCallback((loc: LocationEntry) => {
    setSelectedLocation(loc);
  }, []);

  const activeFiresCount = fires.filter(f => f.status === 'Active').length;
  const criticalCount = fires.filter(f => f.severity === 'critical').length;

  const levelColor = riskResult ? {
    Low: '#4ADE80', Moderate: '#FFC800', High: '#FF5C00', Critical: '#FF2D00',
  }[riskResult.level] : '#4ADE80';

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#0e0e0e' }}>

      {/* ─── Top Nav ─── */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 z-30"
        style={{ borderBottom: '1px solid rgba(91,65,55,0.2)', background: 'rgba(14,14,14,0.95)', backdropFilter: 'blur(20px)' }}>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 map-control-btn">
            <ArrowLeft size={15} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: 'rgba(255,92,0,0.15)', border: '1px solid rgba(255,92,0,0.3)' }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M9 2C9 2 4 6 4 10.5C4 13.538 6.239 16 9 16C11.761 16 14 13.538 14 10.5C14 6 9 2 9 2Z" fill="url(#dg)"/>
                <path d="M9 8C9 8 7 10 7 11.5C7 12.88 7.895 14 9 14C10.105 14 11 12.88 11 11.5C11 10 9 8 9 8Z" fill="rgba(255,255,255,0.8)"/>
                <defs><linearGradient id="dg" x1="9" y1="2" x2="9" y2="16" gradientUnits="userSpaceOnUse"><stop stopColor="#FF8C00"/><stop offset="1" stopColor="#FF2D00"/></linearGradient></defs>
              </svg>
            </div>
            <span className="font-display font-bold text-sm tracking-tight hidden sm:block" style={{ color: '#e5e2e1' }}>
              EmberSight<span style={{ color: '#FF5C00' }}>AI</span>
            </span>
          </div>

          {/* Status pills */}
          <div className="hidden md:flex items-center gap-2 ml-2">
            <div className="liquid-glass rounded-full px-3 py-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-blink" style={{ background: '#FF5C00' }} />
              <span className="text-xs font-mono" style={{ color: 'rgba(229,226,225,0.6)' }}>
                {activeFiresCount} Active Fires
              </span>
            </div>
            <div className="liquid-glass rounded-full px-3 py-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF2D00' }} />
              <span className="text-xs font-mono" style={{ color: 'rgba(229,226,225,0.6)' }}>
                {criticalCount} Critical
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMapCollapsed(!mapCollapsed)}
            className={`map-control-btn px-2.5 py-1.5 flex items-center gap-1 text-[10px] font-mono transition-all duration-150 ${mapCollapsed ? 'border-orange-500/50 text-orange-400 bg-orange-950/20' : 'text-neutral-400'}`}
            title="Toggle Map Panel"
          >
            {mapCollapsed ? '[+] Show Map' : '[-] Hide Map'}
          </button>
          <LocationSearch onSelect={handleLocationSelect} selectedLocation={selectedLocation} />
          <button className="map-control-btn relative" title="Alerts">
            <Bell size={15} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: '#FF5C00' }} />
          </button>
        </div>
      </header>

      {/* ─── Main Content (desktop) ─── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Map Section (Collapsible) */}
        <div 
          className={`relative min-w-0 flex-shrink-0 transition-all duration-300 overflow-hidden ${mapCollapsed ? 'w-0' : 'w-[35%]'}`}
          style={{ borderRight: mapCollapsed ? 'none' : '1px solid rgba(91,65,55,0.2)' }}
        >
          <FireMap selectedLocation={selectedLocation} fires={fires} />
        </div>

        {/* ─── Right Panel (Insights Section - expanded to dominate layout) ─── */}
        <div className="hidden lg:flex flex-col flex-1 overflow-y-auto"
          style={{ background: '#131313' }}>

          {/* Location Header */}
          <div className="flex-shrink-0 px-4 pt-4 pb-3"
            style={{ borderBottom: '1px solid rgba(91,65,55,0.15)' }}>
            <p className="section-label mb-1">Regional Risk Score</p>
            <div className="flex items-center justify-between">
              <p className="font-display font-semibold text-base" style={{ color: '#e5e2e1' }}>
                {selectedLocation.displayName}
              </p>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,92,0,0.1)', color: '#FF5C00', border: '1px solid rgba(255,92,0,0.2)' }}>
                {selectedLocation.state}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-shrink-0 flex px-4 pt-3 gap-2"
            style={{ borderBottom: '1px solid rgba(91,65,55,0.15)' }}>
            {[
              { id: 'risk', label: 'Risk Analysis', icon: Activity },
              { id: 'fires', label: 'Fire List', icon: BarChart2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as 'risk' | 'fires')}
                className="flex items-center gap-1.5 px-3 pb-3 text-sm font-medium transition-all duration-150 border-b-2"
                style={{
                  borderColor: activeTab === id ? '#FF5C00' : 'transparent',
                  color: activeTab === id ? '#FF5C00' : 'rgba(171,137,125,0.6)',
                }}>
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="relative flex-1 overflow-y-auto px-4 py-4">
            {/* Skeletons overlay when loading */}
            {loading && (
              <div className="absolute inset-0 bg-[#131313]/85 backdrop-blur-[3px] z-30 flex flex-col gap-4 p-4 animate-pulse select-none pointer-events-none">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="h-44 bg-white/5 rounded-2xl border border-white/5 p-4 flex items-center justify-between gap-4">
                      <div className="flex flex-col items-center gap-2 w-1/3">
                        <div className="w-24 h-24 rounded-full bg-white/10" />
                        <div className="w-16 h-3 bg-white/5 rounded" />
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="w-1/2 h-3 bg-white/10 rounded" />
                        <div className="w-full h-2 bg-white/5 rounded" />
                        <div className="w-full h-2 bg-white/5 rounded" />
                        <div className="w-5/6 h-2 bg-white/5 rounded" />
                      </div>
                    </div>
                    <div className="h-32 bg-white/5 rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
                      <div className="w-1/3 h-4 bg-white/10 rounded" />
                      <div className="h-10 bg-white/10 rounded w-full" />
                    </div>
                    <div className="h-56 bg-white/5 rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
                      <div className="w-1/4 h-4 bg-white/10 rounded" />
                      <div className="h-32 bg-white/10 rounded w-full" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-52 bg-white/5 rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
                      <div className="w-1/3 h-4 bg-white/10 rounded" />
                      <div className="h-3 bg-white/10 rounded w-full" />
                      <div className="h-3 bg-white/10 rounded w-full" />
                      <div className="h-3 bg-white/10 rounded w-2/3" />
                    </div>
                    <div className="h-48 bg-white/5 rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
                      <div className="w-1/4 h-4 bg-white/10 rounded" />
                      <div className="h-28 bg-white/10 rounded w-full" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading && !riskResult ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 py-12">
                <span className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono text-neutral-400">Loading risk parameters...</p>
              </div>
            ) : riskResult ? (
              <AnimatePresence mode="wait">
                {activeTab === 'risk' ? (
                  <motion.div
                    key="risk"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 xl:grid-cols-2 gap-4 text-left">

                    {/* Column 1: Core Risk & Metrics */}
                    <div className="space-y-4">
                      {/* Circular Gauge and Compact Breakdown Side-by-Side */}
                      <div className="liquid-glass-strong rounded-2xl p-4 flex items-center justify-between gap-4">
                        {/* Left: Gauge circle */}
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                          <RiskScore 
                            result={riskResult} 
                            changePct={historyResult?.change_vs_last_week_pct} 
                            onClick={() => setIsExplainDrawerOpen(true)}
                          />
                          {/* Data Freshness Indicator */}
                          <p className="text-[10px] font-mono text-neutral-500 text-center select-none mt-1">
                            {freshnessLabel}
                          </p>
                        </div>

                        {/* Right: Why {score}? Breakdown Panel */}
                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                          <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-left" style={{ color: '#FF5C00' }}>
                            Why {riskResult.score}?
                          </p>
                          <div className="space-y-1.5">
                            {riskResult.factors.map(f => {
                              const pct = Math.round((f.contribution / f.maxContribution) * 100);
                              const barColor = f.id === 'humidity' ? '#508EFF'
                                : f.id === 'wind_speed' ? '#A0C9FF'
                                : f.id === 'fire_density' ? '#FF2D00' : '#FF5C00';
                              return (
                                <div key={f.id} className="text-[10px] flex flex-col gap-0.5">
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-neutral-300 font-medium truncate">{f.icon} {f.label}</span>
                                    <span className="font-mono font-bold text-neutral-200" style={{ color: barColor }}>
                                      {f.value} (+{f.contribution})
                                    </span>
                                  </div>
                                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* 3-Day Risk Forecast */}
                      <ForecastPanel forecast={forecastResult} />

                      {/* Explainability Breakdown */}
                      <div className="liquid-glass-strong rounded-2xl p-4">
                        <ExplainabilityPanel factors={riskResult.factors} />
                      </div>
                    </div>

                    {/* Column 2: Actions & Impact */}
                    <div className="space-y-4">
                      {/* Recommended Actions */}
                      {recommendations && (
                        <div className="liquid-glass-strong rounded-2xl p-4 flex flex-col gap-3">
                          <div className="flex items-center gap-1.5 text-orange-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            <h4 className="font-display font-semibold text-xs tracking-wider uppercase text-neutral-300">Recommended Actions</h4>
                          </div>
                          
                          {recommendations.primary_drivers && recommendations.primary_drivers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pb-1 border-b border-white/5">
                              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider mr-1 mt-0.5">Drivers:</span>
                              {recommendations.primary_drivers.map((driver: string, idx: number) => (
                                <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/5">
                                  {driver}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="space-y-2">
                            {recommendations.recommended_actions.map((action: string, idx: number) => (
                              <div key={idx} className="flex gap-2 items-start text-xs text-neutral-300">
                                <span className="text-orange-500 font-mono mt-0.5">▪</span>
                                <p className="leading-relaxed">{action}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Community Impact Estimator */}
                      <CommunityImpactPanel impact={impactResult} />

                      {/* Summary */}
                      <div className="data-card rounded-xl" style={{ borderColor: `${levelColor}30` }}>
                        <p className="text-xs leading-relaxed" style={{ color: 'rgba(229,226,225,0.65)' }}>
                          {riskResult.summary}
                        </p>
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  <motion.div
                    key="fires"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2">
                    {fires.length === 0 ? (
                      <div className="text-center py-12 text-neutral-500 font-mono text-xs">
                        No active fire detections in this area
                      </div>
                    ) : (
                      fires.map((fire: FireIncident, i: number) => (
                        <motion.div
                          key={fire.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="data-card-hover rounded-xl flex items-center gap-3 text-left">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                              background: fire.severity === 'critical' ? '#FF2D00'
                                : fire.severity === 'high' ? '#FF5C00'
                                : fire.severity === 'moderate' ? '#FFC800' : '#4ADE80',
                              boxShadow: `0 0 6px ${fire.severity === 'critical' ? '#FF2D00' : fire.severity === 'high' ? '#FF5C00' : '#FFC800'}60`,
                            }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#e5e2e1' }}>
                              {fire.cause === 'Satellite Detection' ? getNearestLandmark(fire.lat, fire.lng) : fire.name}
                            </p>
                            <p className="text-xs font-mono" style={{ color: 'rgba(171,137,125,0.6)' }}>
                              {fire.acreage ? `${Math.round(fire.acreage / 1.5)} MW intensity` : 'Unknown intensity'}
                            </p>
                          </div>
                          <span className="text-xs font-mono px-2 py-0.5 rounded-full flex-shrink-0 bg-orange-950/40 text-orange-400 border border-orange-500/20">
                            {fire.status}
                          </span>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            ) : null}
          </div>
        </div>
      </div>

      {/* ─── Historical Charts Section ─── */}
      <div className="hidden lg:block flex-shrink-0"
        style={{ borderTop: '1px solid rgba(91,65,55,0.2)', background: '#131313', maxHeight: 310 }}>
        <div className="grid grid-cols-2 h-full" style={{ borderTop: '1px solid rgba(91,65,55,0.2)' }}>
          <div className="px-6 py-3 overflow-hidden flex flex-col gap-2">
            {/* Historical Insight Header */}
            <div className="bg-[#201F1F]/60 border border-[#FF5C00]/25 rounded-lg px-3 py-2 flex flex-col gap-0.5 select-none">
              <span className="text-[9px] font-mono font-bold tracking-wider text-orange-500 uppercase">Historical Trend Analysis</span>
              <p className="text-[10px] text-neutral-300 leading-normal">
                <strong>Seasonality Insight:</strong> August accounts for <strong>34%</strong> of annual wildfire activity. Peak season: <strong>July–September</strong>. 2024 activity: <strong>+8.4%</strong> above historical averages.
              </p>
            </div>
            <MonthlyActivityChart />
          </div>
          <div className="px-6 py-4 overflow-hidden" style={{ borderLeft: '1px solid rgba(91,65,55,0.2)' }}>
            <AnnualFrequencyChart />
          </div>
        </div>
      </div>

      {/* ─── Mobile Layout ─── */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
        {/* Mobile content based on active tab */}
        <div className="flex-1 overflow-hidden">
          {activeMobileTab === 'map' && (
            <div className="h-full">
              <FireMap selectedLocation={selectedLocation} fires={fires} />
            </div>
          )}
          {activeMobileTab === 'risk' && (
            <div className="h-full overflow-y-auto px-4 py-4 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="section-label mb-0.5">Regional Risk Score</p>
                  <p className="font-display font-semibold" style={{ color: '#e5e2e1' }}>{selectedLocation.displayName}</p>
                </div>
              </div>
              {loading && !riskResult ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <span className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono text-neutral-400">Recalculating score...</p>
                </div>
              ) : riskResult ? (
                <>
                  <div className="liquid-glass-strong rounded-2xl overflow-hidden">
                    <RiskScore result={riskResult} />
                  </div>
                  {recommendations && (
                    <div className="liquid-glass-strong rounded-2xl p-4 space-y-2">
                      <p className="text-[10px] font-mono uppercase text-orange-500 font-bold">Recommended Actions</p>
                      <div className="space-y-1.5">
                        {recommendations.recommended_actions.map((act: string, idx: number) => (
                          <p key={idx} className="text-xs text-neutral-300 leading-relaxed">• {act}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="data-card rounded-xl">
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(229,226,225,0.65)' }}>{riskResult.summary}</p>
                  </div>
                  <div className="liquid-glass-strong rounded-2xl p-4">
                    <ExplainabilityPanel factors={riskResult.factors} />
                  </div>
                </>
              ) : null}
            </div>
          )}
          {activeMobileTab === 'alerts' && (
            <div className="h-full overflow-y-auto px-4 py-4 space-y-2 text-left">
              <p className="section-label mb-3">Active Fire Incidents</p>
              {fires.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 font-mono text-xs">
                  No active fire detections in this area
                </div>
              ) : (
                fires.map((fire: FireIncident, i: number) => (
                  <motion.div
                    key={fire.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="data-card-hover rounded-xl flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: fire.severity === 'critical' ? '#FF2D00' : fire.severity === 'high' ? '#FF5C00' : '#FFC800' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#e5e2e1' }}>
                        {fire.cause === 'Satellite Detection' ? getNearestLandmark(fire.lat, fire.lng) : fire.name}
                      </p>
                      <p className="text-xs font-mono" style={{ color: 'rgba(171,137,125,0.6)' }}>
                        {fire.acreage ? `${Math.round(fire.acreage / 1.5)} MW intensity` : 'Unknown intensity'}
                      </p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full flex-shrink-0 bg-orange-950/40 text-orange-400 border border-orange-500/20">
                      {fire.status}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          )}
          {activeMobileTab === 'settings' && (
            <div className="h-full overflow-y-auto px-4 py-4 space-y-4">
              <p className="section-label mb-3">Historical Trends</p>
              <div className="liquid-glass-strong rounded-2xl p-4">
                <MonthlyActivityChart />
              </div>
              <div className="liquid-glass-strong rounded-2xl p-4">
                <AnnualFrequencyChart />
              </div>
            </div>
          )}
        </div>

        {/* Mobile bottom nav */}
        <div className="flex-shrink-0 flex items-center justify-around px-2 py-3"
          style={{ borderTop: '1px solid rgba(91,65,55,0.2)', background: 'rgba(14,14,14,0.95)', backdropFilter: 'blur(20px)' }}>
          {[
            { id: 'map', label: 'Monitor', icon: '🗺️' },
            { id: 'risk', label: 'Risk', icon: '📊' },
            { id: 'alerts', label: 'Alerts', icon: '🔥' },
            { id: 'settings', label: 'Settings', icon: '📈' },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveMobileTab(id as typeof activeMobileTab)}
              className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-150"
              style={{
                background: activeMobileTab === id ? 'rgba(255,92,0,0.1)' : 'transparent',
                color: activeMobileTab === id ? '#FF5C00' : 'rgba(171,137,125,0.6)',
              }}>
              <span className="text-lg leading-none">{icon}</span>
              <span className="text-xs font-mono">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Risk Explainability Drawer */}
      <RiskExplainDrawer 
        isOpen={isExplainDrawerOpen} 
        onClose={() => setIsExplainDrawerOpen(false)} 
        result={riskResult} 
      />
    </div>
  );
}
