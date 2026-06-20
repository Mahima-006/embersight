import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Flame, Activity, BarChart2, ChevronDown,
  Satellite, Wind, Thermometer, Droplets,
  Map,
  ExternalLink, Play, Sparkles,
  Globe, Share2, Rss,
} from 'lucide-react';

/* ─── Fire Logo SVG ───────────────────────────────────────────── */
function FireLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M9 2C9 2 4 6 4 10.5C4 13.538 6.239 16 9 16C11.761 16 14 13.538 14 10.5C14 6 9 2 9 2Z"
        fill="url(#flg)" />
      <path d="M9 8C9 8 7 10 7 11.5C7 12.88 7.895 14 9 14C10.105 14 11 12.88 11 11.5C11 10 9 8 9 8Z"
        fill="rgba(255,255,255,0.85)" />
      <defs>
        <linearGradient id="flg" x1="9" y1="2" x2="9" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF8C00" />
          <stop offset="1" stopColor="#FF2D00" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Animated Stat Counter ───────────────────────────────────── */
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px)',
      borderRadius: '0.75rem',
      padding: '0.75rem 1.25rem',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FF5C00', fontFamily: 'Geist, Inter, sans-serif', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>{label}</p>
    </div>
  );
}

/* ─── Mini Threat Card (right panel) ─────────────────────────── */
function ThreatCard({ name, severity, pct }: { name: string; severity: 'CRITICAL' | 'HIGH' | 'MOD'; pct: number }) {
  const col = severity === 'CRITICAL' ? '#FF2D00' : severity === 'HIGH' ? '#FF5C00' : '#FFC800';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px', borderRadius: 10,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: col, flexShrink: 0, boxShadow: `0 0 6px ${col}` }} />
      <span style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      <span style={{ fontSize: 10, color: col, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{severity}</span>
      <div style={{ width: 36, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 2 }} />
      </div>
    </div>
  );
}

/* ─── Feature Section Bento Card ─────────────────────────────── */
interface BentoCardProps {
  tag: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  metric: string;
  metricSub: string;
  accent?: string;
  wide?: boolean;
  children?: React.ReactNode;
}
function BentoCard({ tag, title, desc, icon, metric, metricSub, accent = '#FF5C00', wide, children }: BentoCardProps) {
  return (
    <div
      style={{
        gridColumn: wide ? 'span 2' : 'span 1',
        background: 'rgba(20,19,19,0.72)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}40`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${accent}10`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 200, height: 200,
        background: `radial-gradient(ellipse at top right, ${accent}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Tag + Icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(171,137,125,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>{tag}</span>
        <div style={{
          width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${accent}18`, border: `1px solid ${accent}30`,
        }}>{icon}</div>
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#e5e2e1', margin: '0 0 8px', fontFamily: 'Geist, Inter, sans-serif', letterSpacing: '-0.02em' }}>{title}</h3>
        <p style={{ fontSize: '0.8125rem', color: 'rgba(229,226,225,0.5)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
      </div>

      {children}

      {/* Metric footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: '1.375rem', fontWeight: 700, color: accent, fontFamily: 'Geist, Inter, sans-serif' }}>{metric}</span>
        <span style={{ fontSize: 10, color: 'rgba(171,137,125,0.6)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{metricSub}</span>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#0a0a0a', color: '#e5e2e1', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — FULL-SCREEN HERO WITH VIDEO BACKGROUND
      ══════════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>

        {/* ── Video Background ── */}
        <video
          autoPlay muted loop playsInline
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', zIndex: 0,
          }}>
          {/* Aerial wildfire footage */}
          <source src="https://assets.mixkit.co/videos/preview/mixkit-forest-fire-aerial-view-27136-large.mp4" type="video/mp4" />
          <source src="https://cdn.coverr.co/videos/coverr-burning-fire-5491/1080p.mp4" type="video/mp4" />
        </video>

        {/* ── Multi-layer overlay ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(6,4,4,0.55)' }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }} />
        {/* Tactical grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          backgroundImage: 'linear-gradient(rgba(255,92,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,92,0,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        {/* ── Two-panel Hero Layout ── */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', minHeight: '100vh' }}>

          {/* ════ LEFT PANEL (55%) ════ */}
          <div style={{ width: '55%', display: 'flex', flexDirection: 'column', padding: '1.5rem', minWidth: 0 }}>

            {/* Glass inset card */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              background: 'rgba(10,8,8,0.45)',
              backdropFilter: 'blur(50px)',
              WebkitBackdropFilter: 'blur(50px)',
              borderRadius: '1.5rem',
              padding: '1.75rem 2rem',
              position: 'relative', overflow: 'hidden',
              boxShadow: '4px 4px 4px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.1)',
            }}>
              {/* Glass border via ::before equivalent — done with box shadows */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '1.5rem',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 30%, transparent 60%, rgba(255,255,255,0.06) 100%)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor' as any,
                maskComposite: 'exclude' as any,
                padding: '1px', pointerEvents: 'none',
              }} />

              {/* NAV */}
              <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,92,0,0.2)',
                  }}>
                    <FireLogo size={18} />
                  </div>
                  <span style={{ fontSize: '1.0625rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', fontFamily: 'Geist, Inter, sans-serif' }}>
                    EmberSight<span style={{ color: '#FF5C00' }}>AI</span>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {['Features', 'Data', 'Docs'].map(item => (
                    <button key={item} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif',
                      transition: 'color 0.15s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
                      {item}
                    </button>
                  ))}
                  {/* Menu pill */}
                  <button style={{
                    background: 'rgba(255,255,255,0.07)', border: 'none',
                    backdropFilter: 'blur(4px)', borderRadius: 9999,
                    padding: '6px 14px', cursor: 'pointer',
                    fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif',
                    display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
                    transition: 'transform 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                    <span style={{ width: 14, height: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {[0, 1, 2].map(i => <div key={i} style={{ height: 1.5, background: 'rgba(255,255,255,0.7)', borderRadius: 1 }} />)}
                    </span>
                    Menu
                  </button>
                </div>
              </nav>

              {/* HERO CENTER */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 0' }}>

                {/* Live badge */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                  style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: 9999,
                    padding: '6px 14px',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF5C00', animation: 'blink 1.5s ease-in-out infinite' }} />
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.06em' }}>
                      ACTIVE WILDFIRE SEASON · THREAT LEVEL ELEVATED
                    </span>
                    <span style={{
                      fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                      padding: '2px 8px', borderRadius: 9999,
                      background: 'rgba(255,92,0,0.25)', color: '#FF5C00', letterSpacing: '0.08em',
                    }}>LIVE</span>
                  </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                  style={{
                    fontSize: 'clamp(36px, 4.5vw, 64px)',
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.1,
                    color: '#ffffff',
                    fontFamily: 'Geist, Inter, sans-serif',
                    margin: '0 0 1.25rem',
                  }}>
                  Understand wildfire risk<br />
                  <span style={{
                    fontStyle: 'italic', fontWeight: 500,
                    color: 'rgba(255,255,255,0.7)',
                  }}>before </span>
                  <span style={{
                    background: 'linear-gradient(135deg, #FF5C00 0%, #FF8C00 60%, #FFB59A 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>the fire reaches you</span>
                </motion.h1>

                {/* Sub */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
                  style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 440, margin: '0 0 2rem' }}>
                  Real-time satellite intelligence and explainable risk scoring for property owners, agencies and emergency responders.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
                  style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: '2rem' }}>
                  <button onClick={() => navigate('/dashboard')} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    background: 'rgba(10,8,8,0.55)',
                    backdropFilter: 'blur(50px)',
                    border: 'none',
                    borderRadius: 9999,
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: 14, fontWeight: 600, color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: '4px 4px 4px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.15)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative', overflow: 'hidden',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                    onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'; }}
                    onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}>
                    {/* Glass border */}
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: 9999,
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 20%, transparent 40%, transparent 60%, rgba(255,255,255,0.2) 80%, rgba(255,255,255,0.5) 100%)',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor' as any,
                      maskComposite: 'exclude' as any,
                      padding: '1.4px', pointerEvents: 'none',
                    }} />
                    Explore Now
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowRight size={14} />
                    </div>
                  </button>

                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 9999, padding: '12px 22px',
                    cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,0.7)',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'transform 0.2s, background 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}>
                    <Play size={13} fill="currentColor" />
                    Watch Demo
                  </button>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '2.5rem' }}>
                  {['Satellite Feed', 'Risk Scoring', 'Fire Tracking', 'Historical Data'].map(pill => (
                    <span key={pill} style={{
                      fontSize: 12, color: 'rgba(255,255,255,0.6)',
                      background: 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: 9999,
                      padding: '5px 14px',
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)',
                      fontFamily: 'Inter, sans-serif',
                    }}>{pill}</span>
                  ))}
                </motion.div>

                {/* Quote / Description */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }}
                  style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
                  <p style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
                    TACTICAL INTELLIGENCE SYSTEM
                  </p>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, margin: 0 }}>
                    Built using satellite wildfire detections, <span style={{ color: '#FFB59A' }}>weather observations, and explainable risk scoring.</span>
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* ════ RIGHT PANEL (45%) ════ */}
          <div className="hidden lg:flex" style={{ width: '45%', padding: '1.5rem 1.5rem 1.5rem 0', flexDirection: 'column', gap: 12 }}>

            {/* Top bar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
              {/* Social pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(4px)',
                borderRadius: 9999, padding: '8px 14px',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
              }}>
                {[Globe, Share2, Rss].map((Icon, idx) => (
                  <button key={idx} style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.7)',
                    transition: 'color 0.15s, transform 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}>
                    <Icon size={12} />
                  </button>
                ))}
                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
                <ArrowRight size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
              {/* Account */}
              <button style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(4px)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.7)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
                transition: 'transform 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}>
                <Sparkles size={14} />
              </button>
            </motion.div>

            {/* Live threat feed card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
              style={{
                background: 'rgba(10,8,8,0.5)',
                backdropFilter: 'blur(40px)',
                borderRadius: '1.25rem',
                padding: '1.25rem',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(171,137,125,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                    LIVE THREAT FEED
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#e5e2e1', fontFamily: 'Geist, Inter, sans-serif' }}>Active Incidents</p>
                </div>
                <span style={{
                  fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                  padding: '3px 10px', borderRadius: 9999,
                  background: 'rgba(255,92,0,0.15)', color: '#FF5C00',
                  border: '1px solid rgba(255,92,0,0.25)',
                }}>11 ACTIVE</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <ThreatCard name="Dixie Fire — Northern CA" severity="CRITICAL" pct={12} />
                <ThreatCard name="Bootleg Fire — S. Oregon" severity="CRITICAL" pct={22} />
                <ThreatCard name="Creek Fire — Sierra Nevada" severity="HIGH" pct={35} />
                <ThreatCard name="Monument Fire — Humboldt" severity="HIGH" pct={44} />
                <ThreatCard name="Tamarack Fire — Alpine Co." severity="MOD" pct={71} />
              </div>
            </motion.div>

            {/* Stats 2×2 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.55 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { value: '12', label: 'Active Fires' },
                { value: '3', label: 'Critical Events' },
                { value: '1 min ago', label: 'Last Update' },
                { value: '24', label: 'Regions Monitored' },
              ].map(s => <StatPill key={s.label} {...s} />)}
            </motion.div>

            {/* Agency strip */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.65 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(4px)',
                borderRadius: '1rem',
                padding: '1rem 1.25rem',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.07)',
              }}>
              <p style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                DATA SOURCES
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { name: 'NASA FIRMS', icon: Satellite },
                  { name: 'OpenWeather', icon: Wind },
                  { name: 'OpenStreetMap', icon: Map },
                ].map(({ name, icon: Icon }) => (
                  <div key={name} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 8, padding: '5px 10px',
                  }}>
                    <Icon size={11} style={{ color: '#FF5C00', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>{name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Launch CTA */}
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.75 }}
              onClick={() => navigate('/dashboard')}
              style={{
                width: '100%',
                background: '#FF5C00',
                border: 'none', borderRadius: '1rem',
                padding: '14px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontSize: 14, fontWeight: 600, color: '#fff',
                fontFamily: 'Geist, Inter, sans-serif',
                boxShadow: '0 0 30px rgba(255,92,0,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(255,92,0,0.5)' } as any}
              whileTap={{ scale: 0.98 } as any}>
              Launch Intelligence Dashboard
              <ExternalLink size={15} />
            </motion.button>
          </div>
        </div>

        {/* ── Scroll cue ── */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
            zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: 'rgba(255,255,255,0.3)',
          }}>
          <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em' }}>SCROLL</span>
          <ChevronDown size={16} />
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1.5 — DASHBOARD PREVIEW
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '6rem 2rem 0', background: '#0a0a0a', textAlign: 'center', position: 'relative', zIndex: 20 }}>
        <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(171,137,125,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
          INTERACTIVE DASHBOARD PREVIEW
        </p>
        <div style={{ 
          maxWidth: 1200, margin: '0 auto', 
          borderRadius: '1.5rem', overflow: 'hidden', 
          border: '1px solid rgba(255,255,255,0.1)', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 80px rgba(255,92,0,0.1)' 
        }}>
          <img src="/dashboard_preview.png" alt="Dashboard Preview" style={{ width: '100%', display: 'block' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — TACTICAL INTELLIGENCE SUITE (BENTO GRID)
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '6rem 2rem 5rem', background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>

        {/* Background glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(255,92,0,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ height: 1, width: 48, background: 'linear-gradient(90deg, transparent, rgba(255,92,0,0.4))' }} />
              <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,92,0,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                THE TACTICAL INTELLIGENCE SUITE
              </span>
              <div style={{ height: 1, width: 48, background: 'linear-gradient(90deg, rgba(255,92,0,0.4), transparent)' }} />
            </div>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 700, letterSpacing: '-0.04em',
              lineHeight: 1.1, color: '#fff',
              fontFamily: 'Geist, Inter, sans-serif',
              margin: '0 0 1rem',
            }}>
              Every data point.<br />
              <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Every second that matters.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Three intelligence modules work in concert to give you the clearest possible view of wildfire risk — in real time.
            </p>
          </motion.div>

          {/* Bento grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>

            {/* CARD 1 — Wide: Live Monitoring */}
            <motion.div
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0 }}
              style={{ gridColumn: 'span 2' }}>
              <BentoCard
                tag="MODULE 01 · LIVE"
                title="Satellite Active Monitoring"
                desc="Live thermal anomaly detection via NASA FIRMS. Every 6 minutes, our engine cross-references satellite passes with terrain, vegetation, and wind vectors to flag emerging ignitions before smoke is visible."
                icon={<Satellite size={18} style={{ color: '#FF5C00' }} />}
                metric="< 6 min"
                metricSub="Global Refresh Cycle"
                wide>
                {/* Mini sparkline visualization */}
                <div style={{
                  padding: '12px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'flex-end', gap: 3,
                  height: 56,
                }}>
                  {[22, 18, 28, 45, 38, 65, 88, 72, 96, 82, 110, 98].map((h, i) => (
                    <div key={i} style={{
                      flex: 1, borderRadius: 3,
                      background: i >= 10 ? '#FF5C00' : `rgba(255,92,0,${0.15 + (h / 110) * 0.35})`,
                      height: `${(h / 110) * 100}%`,
                      boxShadow: i >= 10 ? '0 0 8px rgba(255,92,0,0.6)' : 'none',
                      transition: 'height 0.3s',
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(171,137,125,0.5)', marginTop: -4 }}>
                  THERMAL SIGNATURE DENSITY · LAST 12H
                </p>
              </BentoCard>
            </motion.div>

            {/* CARD 2 — Narrow: Live status */}
            <motion.div
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              <BentoCard
                tag="SYSTEM STATUS"
                title="Operations Center"
                desc="All inference pipelines nominal. Satellite ingestion active."
                icon={<Activity size={18} style={{ color: '#4ADE80' }} />}
                metric="99.8%"
                metricSub="Uptime SLA"
                accent="#4ADE80">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'SATELLITE LINK', status: 'NOMINAL', col: '#4ADE80' },
                    { label: 'RISK ENGINE', status: 'ACTIVE', col: '#4ADE80' },
                    { label: 'ALERT RELAY', status: 'NOMINAL', col: '#4ADE80' },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>{s.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.col, boxShadow: `0 0 5px ${s.col}` }} />
                        <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: s.col, fontWeight: 600 }}>{s.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </BentoCard>
            </motion.div>

            {/* CARD 3 — Risk Engine */}
            <motion.div
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}>
              <BentoCard
                tag="MODULE 02 · AI"
                title="Explainable Risk Scoring"
                desc="Five-factor deterministic engine. Temperature, humidity, wind, drought, and historical density. Every point justified."
                icon={<Flame size={18} style={{ color: '#FF5C00' }} />}
                metric="5 factors"
                metricSub="Transparent Model">
                {/* Mini factor bars */}
                {[
                  { label: 'TEMP', val: 80, col: '#FF5C00' },
                  { label: 'WIND', val: 60, col: '#FF8C00' },
                  { label: 'HUM.', val: 75, col: '#508EFF' },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(171,137,125,0.6)', width: 32, letterSpacing: '0.06em' }}>{f.label}</span>
                    <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${f.val}%`, height: '100%', background: f.col, borderRadius: 2, boxShadow: `0 0 5px ${f.col}60` }} />
                    </div>
                    <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: f.col, fontWeight: 600, width: 20 }}>{f.val}</span>
                  </div>
                ))}
              </BentoCard>
            </motion.div>

            {/* CARD 4 — Environmental sensors */}
            <motion.div
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
              <BentoCard
                tag="ENV. SENSORS"
                title="Real-Time Conditions"
                desc="Ground truth from 1,200+ weather stations fused with satellite-derived drought indices."
                icon={<Wind size={18} style={{ color: '#A0C9FF' }} />}
                metric="1,200+"
                metricSub="Ground Stations"
                accent="#A0C9FF">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { icon: Thermometer, val: '34°C', label: 'Temp', col: '#FF5C00' },
                    { icon: Droplets, val: '18%', label: 'Humidity', col: '#508EFF' },
                    { icon: Wind, val: '28 km/h', label: 'Wind', col: '#A0C9FF' },
                    { icon: Activity, val: 'D8.2', label: 'Drought', col: '#FFC800' },
                  ].map(({ icon: Icon, val, label, col }) => (
                    <div key={label} style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                      <Icon size={12} style={{ color: col, marginBottom: 4 }} />
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#e5e2e1', margin: 0, fontFamily: 'Geist, Inter, sans-serif' }}>{val}</p>
                      <p style={{ fontSize: 9, color: 'rgba(171,137,125,0.55)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em', margin: '2px 0 0' }}>{label}</p>
                    </div>
                  ))}
                </div>
              </BentoCard>
            </motion.div>

            {/* CARD 5 — Historical Trends wide */}
            <motion.div
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.25 }}
              style={{ gridColumn: 'span 3' }}>
              <div style={{
                background: 'rgba(20,19,19,0.72)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '1.5rem',
                padding: '1.75rem 2rem',
                display: 'flex', alignItems: 'center', gap: '3rem',
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(171,137,125,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                    MODULE 03 · ARCHIVE
                  </span>
                  <h3 style={{ fontSize: '1.375rem', fontWeight: 600, color: '#e5e2e1', fontFamily: 'Geist, Inter, sans-serif', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                    Decade of Historical Fire Intelligence
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(229,226,225,0.5)', lineHeight: 1.6, margin: '0 0 1.25rem', maxWidth: 380 }}>
                    Ten years of incident records across the western US. Identify seasonal peaks, multi-year trends, and regional risk patterns with interactive charts.
                  </p>
                  <button onClick={() => navigate('/dashboard')} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: '#FF5C00', border: 'none', borderRadius: 9999,
                    padding: '10px 20px', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: '0 0 20px rgba(255,92,0,0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(255,92,0,0.5)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(255,92,0,0.3)'; }}>
                    Explore Fire Archive
                    <BarChart2 size={14} />
                  </button>
                </div>

                {/* Mini annual chart visualization */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
                    {[
                      { yr: '18', val: 58 }, { yr: '19', val: 68 }, { yr: '20', val: 97 },
                      { yr: '21', val: 91 }, { yr: '22', val: 82 }, { yr: '23', val: 100 }, { yr: '24', val: 84 },
                    ].map(({ yr, val }) => (
                      <div key={yr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{
                          width: '100%', borderRadius: '4px 4px 0 0',
                          background: yr === '24' ? '#FF5C00' : `rgba(255,92,0,${0.18 + (val / 100) * 0.25})`,
                          height: `${val}%`,
                          boxShadow: yr === '24' ? '0 0 10px rgba(255,92,0,0.5)' : 'none',
                          transition: 'height 0.6s',
                        }} />
                        <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: yr === '24' ? '#FF5C00' : 'rgba(171,137,125,0.4)' }}>{yr}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(171,137,125,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>PEAK SEASON</p>
                      <p style={{ fontSize: 18, fontWeight: 700, color: '#FF5C00', fontFamily: 'Geist, Inter, sans-serif' }}>Jul–Sep</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(171,137,125,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>YoY TREND</p>
                      <p style={{ fontSize: 18, fontWeight: 700, color: '#FF5C00', fontFamily: 'Geist, Inter, sans-serif' }}>+8.4%</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(171,137,125,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>RECORDS (2018-24)</p>
                      <p style={{ fontSize: 18, fontWeight: 700, color: '#FF5C00', fontFamily: 'Geist, Inter, sans-serif' }}>5,326</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — CTA BANNER
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 2rem 6rem', background: '#0a0a0a' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{
            maxWidth: 1100, margin: '0 auto',
            background: 'rgba(255,92,0,0.07)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,92,0,0.2)',
            borderRadius: '1.5rem',
            padding: '2.5rem 2.5rem',
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem',
            position: 'relative', overflow: 'hidden',
          }}>
          {/* Glow */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(255,92,0,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div>
            <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,92,0,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
              RISK YOUR PARAMETER TODAY
            </p>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 700, color: '#fff', fontFamily: 'Geist, Inter, sans-serif', letterSpacing: '-0.03em', margin: '0 0 8px' }}>
              30 seconds. 5 environmental factors.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Get your location's risk score explained, not just reported.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/dashboard')} style={{
              background: '#FF5C00', border: 'none', borderRadius: 9999,
              padding: '13px 28px', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, color: '#fff',
              fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 24px rgba(255,92,0,0.4)',
              transition: 'transform 0.2s', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}>
              Proceed to Dashboard
              <ArrowRight size={16} />
            </button>
            <button style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 9999, padding: '13px 24px',
              cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,0.65)',
              fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
              transition: 'border-color 0.2s, color 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,92,0,0.4)'; (e.currentTarget as HTMLButtonElement).style.color = '#FF5C00'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)'; }}>
              Schedule Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem 2rem', background: '#0a0a0a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,92,0,0.15)' }}>
              <FireLogo size={12} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e5e2e1', fontFamily: 'Geist, Inter, sans-serif' }}>
              EmberSight<span style={{ color: '#FF5C00' }}>AI</span>
            </span>
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(171,137,125,0.35)', marginLeft: 8 }}>
              © 2024 Tactical Data Protocol Protected
            </span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service', 'API Docs', 'Contact'].map(link => (
              <button key={link} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
                color: 'rgba(171,137,125,0.45)', transition: 'color 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,92,0,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(171,137,125,0.45)')}>
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
