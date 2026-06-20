import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { featuredLocations, type LocationEntry } from '../../data/featuredLocations';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationSearchProps {
  onSelect: (location: LocationEntry) => void;
  selectedLocation?: LocationEntry | null;
}

export default function LocationSearch({ onSelect, selectedLocation }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationEntry[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const resp = await fetch(`http://localhost:8000/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal
        });
        if (resp.ok) {
          const data = await resp.json();
          // Extract a state or fallback code from Nominatim's display_name
          const parts = data.display_name.split(',');
          let state = 'US';
          if (parts.length > 2) {
            const statePart = parts[parts.length - 3]?.trim() || '';
            state = statePart.length <= 4 ? statePart : statePart.substring(0, 2).toUpperCase();
          }
          const isState = data.addresstype === 'state' || data.addresstype === 'country' || 
                          data.addresstype === 'region' || (data.place_rank && data.place_rank <= 12);
          const entry: LocationEntry = {
            name: data.display_name.split(',')[0].toLowerCase(),
            displayName: data.display_name,
            lat: data.lat,
            lng: data.lon,
            state: state,
            riskBias: data.importance || 0.5,
            isState: isState
          };
          setResults([entry]);
          setOpen(true);
          return;
        }
      } catch (error) {
        console.warn('Backend search offline, falling back to featured locations', error);
        // Fallback to local featured locations if backend is down
        const matches = featuredLocations.filter(loc => 
          loc.name.toLowerCase().includes(query.toLowerCase()) ||
          loc.displayName.toLowerCase().includes(query.toLowerCase())
        );
        setResults(matches);
        setOpen(matches.length > 0);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(loc: LocationEntry) {
    onSelect(loc);
    setQuery('');
    setOpen(false);
  }

  function handleClear() {
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'rgba(171,137,125,0.6)' }}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search location…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          className="search-input pl-9 pr-9"
          style={{ height: 38 }}
        />
        {query && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80">
            <X size={14} style={{ color: 'rgba(171,137,125,0.6)' }} />
          </button>
        )}
      </div>

      {selectedLocation && !query && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <MapPin size={11} style={{ color: '#FF5C00' }} />
          <span className="text-xs font-mono" style={{ color: 'rgba(255,181,154,0.8)' }}>
            {selectedLocation.displayName}
          </span>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 z-50 rounded-xl overflow-hidden liquid-glass-strong"
            style={{ transformOrigin: 'top' }}>
            {results.map((loc, i) => (
              loc.isState ? (
                <div
                  key={loc.name}
                  className="w-full flex flex-col gap-1 px-4 py-2.5 text-left border-b border-white/5 bg-red-950/20"
                  style={{
                    borderBottom: i < results.length - 1 ? '1px solid rgba(91,65,55,0.15)' : 'none',
                  }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 bg-red-950/40 border border-red-500/25">
                      <MapPin size={12} style={{ color: '#EF4444' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-300 truncate">{loc.displayName}</p>
                      <p className="text-[10px] font-mono text-red-400 font-semibold mt-0.5">
                        State summaries not supported. Please select a specific city.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  key={loc.name}
                  onClick={() => handleSelect(loc)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 group animate-pulse-once"
                  style={{
                    borderBottom: i < results.length - 1 ? '1px solid rgba(91,65,55,0.15)' : 'none',
                  }}>
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,92,0,0.1)' }}>
                    <MapPin size={12} style={{ color: '#FF5C00' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#e5e2e1' }}>{loc.displayName}</p>
                    <p className="text-xs font-mono" style={{ color: 'rgba(171,137,125,0.6)' }}>
                      {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                    </p>
                  </div>
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: loc.riskBias > 0.75 ? 'rgba(255,92,0,0.15)' : loc.riskBias > 0.5 ? 'rgba(255,200,0,0.1)' : 'rgba(74,222,128,0.1)',
                      color: loc.riskBias > 0.75 ? '#FF5C00' : loc.riskBias > 0.5 ? '#FFC800' : '#4ADE80',
                    }}>
                    {loc.riskBias > 0.75 ? 'HIGH' : loc.riskBias > 0.5 ? 'MOD' : 'LOW'}
                  </span>
                </button>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
