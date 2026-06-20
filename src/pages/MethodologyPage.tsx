import { ArrowLeft, Calculator, Thermometer, Droplets, Wind, Flame, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MethodologyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: '#0e0e0e' }}>
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 sticky top-0 z-30"
        style={{ borderBottom: '1px solid rgba(91,65,55,0.2)', background: 'rgba(14,14,14,0.95)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 map-control-btn text-neutral-400 hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display font-bold text-lg text-[#e5e2e1] flex items-center gap-2">
            <Calculator size={18} className="text-orange-500" /> Risk Calculation Methodology
          </h1>
          <p className="text-xs font-mono text-neutral-500">Transparent, deterministic risk scoring for EmberSight</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-12">
        
        {/* Intro */}
        <section className="flex flex-col gap-4 text-neutral-300">
          <div className="flex items-center gap-2 text-orange-500">
            <ShieldCheck size={24} />
            <h2 className="font-display text-xl font-bold text-[#e5e2e1]">Engineering Decisions Over Black Boxes</h2>
          </div>
          <p className="leading-relaxed">
            At EmberSight, we believe critical decision-making tools should be transparent. Instead of relying on unexplainable machine learning black boxes, our risk engine uses a deterministic, weighted normalization algorithm. The final Risk Score (0-100) is a weighted sum of four environmental factors.
          </p>
          <div className="bg-[#1a1311] border border-orange-500/20 rounded-xl p-6 font-mono text-sm text-center text-orange-400">
            Risk = (Temperature × 0.25) + (Humidity × 0.30) + (Wind Speed × 0.20) + (Fire Density × 0.25)
          </div>
        </section>

        {/* Factors Grid */}
        <section>
          <h3 className="font-display text-lg font-bold text-[#e5e2e1] mb-6 border-b border-white/10 pb-2">Environmental Factors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Temperature */}
            <div className="liquid-glass-strong rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-400">
                  <Thermometer size={20} />
                  <span className="font-bold uppercase tracking-wider text-sm">Temperature</span>
                </div>
                <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-neutral-400 border border-white/5">Weight: 25%</span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Extremely high temperatures rapidly dry out vegetation, turning it into highly combustible fuel. Temperatures above 35°C (95°F) max out this factor's contribution.
              </p>
            </div>

            {/* Humidity */}
            <div className="liquid-glass-strong rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400">
                  <Droplets size={20} />
                  <span className="font-bold uppercase tracking-wider text-sm">Relative Humidity</span>
                </div>
                <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-neutral-400 border border-white/5">Weight: 30%</span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Humidity is the strongest predictor of fire ignition probability. Low humidity (below 20%) pulls moisture from the air and foliage. We invert this metric so lower humidity yields a higher risk contribution.
              </p>
            </div>

            {/* Wind Speed */}
            <div className="liquid-glass-strong rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-300">
                  <Wind size={20} />
                  <span className="font-bold uppercase tracking-wider text-sm">Wind Speed</span>
                </div>
                <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-neutral-400 border border-white/5">Weight: 20%</span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Wind directly impacts how fast a fire spreads and how intensely it burns by supplying oxygen. Wind speeds exceeding 40 km/h drastically raise the risk severity and spread projection confidence.
              </p>
            </div>

            {/* Fire Density */}
            <div className="liquid-glass-strong rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-500">
                  <Flame size={20} />
                  <span className="font-bold uppercase tracking-wider text-sm">Historical Fire Density</span>
                </div>
                <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-neutral-400 border border-white/5">Weight: 25%</span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Sourced from NASA FIRMS VIIRS satellite data. A region's current active hotspots act as a cascading risk multiplier. More active local detections imply dry fuel and favorable spread conditions.
              </p>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
