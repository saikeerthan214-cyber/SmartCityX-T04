import { useState, KeyboardEvent } from 'react';
import { Search, Zap, Server } from 'lucide-react';
import { citizenReports } from '../data/reports';
import { cityDocuments } from '../data/documents';
import { javaSearch, javaAutocorrect, SearchResult, AutocorrectResult } from '../api/javaApi';

type Algo = 'kmp' | 'rabin-karp' | 'aho-corasick';
const ALGO_LABELS: Record<Algo, string> = { 'kmp':'KMP', 'rabin-karp':'Rabin-Karp', 'aho-corasick':'Aho-Corasick' };
const EMERGENCY_KEYWORDS = 'fire,flood,accident,gas leak,explosion,injured,ambulance,emergency,danger,critical,blackout,collapse';

function highlightText(text: string, query: string) {
  if (!query) return text;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${safe})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: 'rgba(56,189,248,0.35)', color: '#fff', borderRadius: 2, padding: '0 2px' }}>{p}</mark>
      : p
  );
}

export default function SmartSearch() {
  const [query, setQuery]           = useState('');
  const [algo, setAlgo]             = useState<Algo>('kmp');
  const [results, setResults]       = useState<any[]>([]);
  const [stats, setStats]           = useState<SearchResult | null>(null);
  const [correction, setCorrection] = useState<AutocorrectResult | null>(null);
  const [emergencyHits, setEmergencyHits] = useState<any[]>([]);
  const [ran, setRan]               = useState(false);
  const [loading, setLoading]       = useState(false);
  const [javaError, setJavaError]   = useState('');

  // All texts to search
  const allItems = [
    ...citizenReports.map(r => ({ type: 'Report',   id: r.id, title: r.issue,  body: r.description, location: r.location, category: r.category })),
    ...cityDocuments.map(d  => ({ type: 'Document', id: d.id, title: d.title,  body: d.content,     location: '',         category: d.category })),
  ];
  const allTexts = allItems.map(item => (item.title + ' ' + item.body).toLowerCase());

  const runSearch = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true); setJavaError('');

    try {
      // 1. Autocorrect via Java (Damerau-Levenshtein)
      const corr = await javaAutocorrect(q);
      setCorrection(corr.changed ? corr : null);
      const searchQ = corr.changed ? corr.corrected : q;

      // 2. Main search via Java (KMP / Rabin-Karp / Aho-Corasick)
      const searchResult = await javaSearch(allTexts, searchQ, algo);
      setStats(searchResult);

      // 3. Emergency scan via Java Aho-Corasick
      const emgResult = await javaSearch([q], EMERGENCY_KEYWORDS, 'aho-corasick');
      setEmergencyHits(emgResult.matches || []);

      // 4. Map match results back to items
      const matched: any[] = [];
      if (algo === 'aho-corasick') {
        // AC returns matches[] with textIndex per keyword hit — group by textIndex
        const countByIndex: Record<number, number> = {};
        (searchResult.matches || []).forEach((m: any) => {
          countByIndex[m.textIndex] = (countByIndex[m.textIndex] || 0) + 1;
        });
        Object.entries(countByIndex).forEach(([idx, count]) => {
          const i = parseInt(idx);
          if (allItems[i]) matched.push({ ...allItems[i], count });
        });
      } else {
        (searchResult.matchDetails || []).forEach(md => {
          matched.push({ ...allItems[md.textIndex], count: (md.positions?.length || 1) });
        });
      }

      setResults(matched);
      setRan(true);
    } catch (err: any) {
      setJavaError('Java DSA server is not running. Start it with: java -cp out SmartCityXServer');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') runSearch(); };

  return (
    <div className="fade-in">

      {/* Java server badge */}
      <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)', display: 'inline-flex' }}>
        <Server size={13} style={{ color: '#38bdf8' }} />
        <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>Java DSA Engine</span>
        <span style={{ fontSize: 11, color: '#4b5563', marginLeft: 4 }}>All algorithms execute in Java · Port 6789</span>
      </div>

      {/* Error */}
      {javaError && (
        <div className="mb-4 px-4 py-3 rounded-xl fade-in" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ color: '#ef4444', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>⚠ Java Server Offline</div>
          <div style={{ color: '#fca5a5', fontSize: 12, fontFamily: 'monospace' }}>java -cp out SmartCityXServer</div>
          <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>Run the above command from the project root, then search again.</div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 px-4 flex-1" style={{ background: '#111827', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 12, height: 46, minWidth: 280 }}>
          <Search size={16} style={{ color: '#38bdf8' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="e.g.  water leakage sector 12   |   road repair   |   fire emergency..."
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f8fafc', fontSize: 13, width: '100%' }} />
        </div>
        <div className="flex gap-2">
          {(['kmp', 'rabin-karp', 'aho-corasick'] as Algo[]).map(a => (
            <button key={a} onClick={() => setAlgo(a)}
              style={{ padding: '0 14px', height: 46, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                background: algo === a ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.04)',
                color: algo === a ? '#38bdf8' : '#94a3b8',
                border: `1px solid ${algo === a ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.06)'}` }}>
              {ALGO_LABELS[a]}
            </button>
          ))}
        </div>
        <button onClick={() => runSearch()} disabled={loading}
          style={{ padding: '0 20px', height: 46, borderRadius: 10, background: loading ? '#1e3a5f' : 'linear-gradient(135deg,#3b82f6,#38bdf8)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}>
          {loading ? 'Running Java...' : 'Search'}
        </button>
      </div>

      {/* Autocorrect */}
      {correction && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl fade-in" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <span style={{ color: '#f59e0b', fontSize: 13 }}>✏️ Autocorrected by Java (Damerau-Levenshtein):</span>
          <button onClick={() => { setQuery(correction.corrected); runSearch(correction.corrected); }}
            style={{ color: '#fff', fontWeight: 600, fontSize: 13, background: 'rgba(245,158,11,0.2)', padding: '2px 10px', borderRadius: 6, border: '1px solid rgba(245,158,11,0.3)', cursor: 'pointer' }}>
            "{correction.corrected}"
          </button>
          <span style={{ color: '#4b5563', fontSize: 12 }}>· Edit distance: {correction.editDistance}</span>
        </div>
      )}

      {/* Emergency keywords */}
      {emergencyHits.length > 0 && (
        <div className="glass-card p-4 mb-4 fade-in" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 10 }}>🚨 Emergency Keywords Detected · Java Aho-Corasick</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {emergencyHits.map((m, i) => (
              <span key={i} className="badge badge-danger">🔴 {m.keyword.toUpperCase()} @ pos {m.position}</span>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#fca5a5', padding: '8px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.08)' }}>
            ⚡ Emergency Level: HIGH · Dispatch emergency response team immediately
          </div>
        </div>
      )}

      {/* Algorithm stats from Java */}
      {stats && (
        <div className="glass-card p-4 mb-5 fade-in" style={{ borderTop: '2px solid #3b82f6' }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} style={{ color: '#38bdf8' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc' }}>Java Algorithm Analysis — {stats.algorithm}</span>
            <span style={{ fontSize: 11, color: '#4b5563', marginLeft: 'auto' }}>Executed in Java · Port 6789</span>
          </div>
          <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))' }}>
            {[
              { label: 'Results Found',  value: results.length,                         color: '#38bdf8' },
              { label: 'Total Matches',  value: stats.totalMatches,                     color: '#22c55e' },
              { label: 'Comparisons',    value: stats.comparisons ?? stats.statesVisited ?? 0, color: '#8b5cf6' },
              { label: 'Exec Time',      value: `${stats.executionTimeMs?.toFixed(3)} ms`, color: '#f59e0b' },
              ...(stats.hashCollisions !== undefined ? [{ label: 'Hash Collisions', value: stats.hashCollisions, color: '#f97316' }] : []),
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 6px' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#4b5563', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Failure table for KMP — removed */}
        </div>
      )}

      {/* Results */}
      {ran && (
        <div className="fade-in">
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>{results.length} matching results for "{query}"</div>
          {results.length === 0
            ? <div className="glass-card p-8 text-center"><div style={{ fontSize: 14, color: '#4b5563' }}>No results found. Try a different term.</div></div>
            : <div className="flex flex-col gap-3">
              {results.map((r, i) => (
                <div key={i} className="glass-card p-4" style={{ borderLeft: `3px solid ${r.type === 'Report' ? '#38bdf8' : '#8b5cf6'}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge" style={{ background: r.type === 'Report' ? 'rgba(56,189,248,0.12)' : 'rgba(139,92,246,0.12)', color: r.type === 'Report' ? '#38bdf8' : '#a78bfa', fontSize: 10 }}>{r.type}</span>
                    <span style={{ fontSize: 11, color: '#4b5563', fontWeight: 600 }}>{r.id}</span>
                    <span style={{ fontSize: 11, color: '#22c55e', marginLeft: 'auto' }}>{r.count} match{r.count > 1 ? 'es' : ''} · Java {ALGO_LABELS[algo]}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
                    {highlightText(r.title, query)}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
                    {highlightText(r.body.substring(0, 150) + '...', query)}
                  </div>
                  {r.location && <div style={{ fontSize: 11, color: '#4b5563', marginTop: 6 }}>📍 {r.location}</div>}
                </div>
              ))}
            </div>
          }
        </div>
      )}
    </div>
  );
}
