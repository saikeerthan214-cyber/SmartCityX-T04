import { useState } from 'react';
import { Server, Droplets, Zap, Car, AlertTriangle } from 'lucide-react';

const PRESETS: Record<string, { label: string; icon: any; color: string; nodes: number; source: number; sink: number; edges: number[][]; nodeLabels: string[]; description: string }> = {
  water: {
    label: 'Water Distribution Network', icon: Droplets, color: '#38bdf8',
    nodes: 6, source: 0, sink: 5,
    nodeLabels: ['Reservoir', 'Pump A', 'Pump B', 'Zone A', 'Zone B', 'Zone C'],
    edges: [[0,1,15],[0,2,12],[1,3,10],[1,4,8],[2,4,7],[2,5,10],[3,5,5],[4,5,9]],
    description: 'Models water flow from Central Reservoir through pump stations to city zones. Max flow = maximum water deliverable to Zone C.'
  },
  energy: {
    label: 'Energy Grid Network', icon: Zap, color: '#f59e0b',
    nodes: 6, source: 0, sink: 5,
    nodeLabels: ['Power Plant', 'Sub-A', 'Sub-B', 'Grid-1', 'Grid-2', 'City Load'],
    edges: [[0,1,30],[0,2,25],[1,3,15],[1,4,18],[2,4,12],[2,5,14],[3,5,20],[4,5,16]],
    description: 'Models electricity flow from Power Plant through substations to city load. Min-cut identifies critical grid bottlenecks.'
  },
  traffic: {
    label: 'Traffic Flow Network', icon: Car, color: '#22c55e',
    nodes: 6, source: 0, sink: 5,
    nodeLabels: ['Highway Hub', 'Route-1', 'Route-2', 'Junction-A', 'Junction-B', 'City Center'],
    edges: [[0,1,20],[0,2,15],[1,3,12],[1,4,10],[2,4,8],[2,3,11],[3,5,14],[4,5,16]],
    description: 'Models vehicle flow through city road network. Max flow = peak traffic capacity. Min-cut = most critical road segment.'
  },
  emergency: {
    label: 'Emergency Resource Network', icon: AlertTriangle, color: '#ef4444',
    nodes: 5, source: 0, sink: 4,
    nodeLabels: ['Dispatch', 'Route-1', 'Route-2', 'Zone-A', 'Zone-B'],
    edges: [[0,1,6],[0,2,8],[1,3,5],[2,3,4],[2,4,6],[3,4,3]],
    description: 'Models emergency vehicle routing. Max flow = maximum resources deployable to emergency zones simultaneously.'
  }
};

export default function NetworkFlow() {
  const [preset, setPreset] = useState('water');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cfg = PRESETS[preset];

  const runFlow = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:6789/api/flow', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: preset, nodes: cfg.nodes, source: cfg.source, sink: cfg.sink, edges: cfg.edges })
      });
      setResult(await res.json());
    } catch { setError('Java server offline. Run: java -cp out SmartCityXServer'); }
    finally { setLoading(false); }
  };

  const Icon = cfg.icon;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-xl" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
        <Server size={14} style={{color:'#38bdf8'}}/>
        <span style={{fontSize:12,color:'#94a3b8'}}>Module 4 — CO4 &nbsp;|&nbsp; Java Ford-Fulkerson (Edmonds-Karp) &nbsp;|&nbsp; O(V·E²) &nbsp;|&nbsp; Port 6789</span>
      </div>

      {/* Preset selector */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {Object.entries(PRESETS).map(([key, p]) => {
          const I = p.icon;
          return (
            <button key={key} onClick={() => { setPreset(key); setResult(null); }}
              className="glass-card p-4 text-left"
              style={{ border: `2px solid ${preset===key ? p.color : 'rgba(255,255,255,0.07)'}`, cursor:'pointer', transition:'all 0.2s' }}>
              <I size={18} style={{ color: p.color, marginBottom: 8 }} />
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{p.label}</div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 400px' }}>
        {/* Left — network viz + run */}
        <div className="flex flex-col gap-4">
          {/* Network diagram */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: 15 }}>
                <Icon size={15} style={{ color: cfg.color, display:'inline',marginRight:8 }}/>{cfg.label}
              </div>
              <span className="badge" style={{ background: `${cfg.color}15`, color: cfg.color, fontSize: 10 }}>
                {cfg.nodes} Nodes · {cfg.edges.length} Edges
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16, lineHeight: 1.6 }}>{cfg.description}</p>

            {/* Node list */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 600, marginBottom: 8 }}>NETWORK NODES</div>
              <div className="flex flex-wrap gap-2">
                {cfg.nodeLabels.map((n, i) => (
                  <span key={i} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: i===cfg.source ? `${cfg.color}25` : i===cfg.sink ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                    color: i===cfg.source ? cfg.color : i===cfg.sink ? '#22c55e' : '#94a3b8',
                    border: `1px solid ${i===cfg.source ? `${cfg.color}40` : i===cfg.sink ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`
                  }}>
                    {i===cfg.source ? '▶ ' : i===cfg.sink ? '◀ ' : ''}{n}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 mt-2" style={{ fontSize: 11, color: '#4b5563' }}>
                <span style={{ color: cfg.color }}>▶ Source</span>
                <span style={{ color: '#22c55e' }}>◀ Sink</span>
              </div>
            </div>

            {/* Edge table */}
            <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 600, marginBottom: 8 }}>NETWORK EDGES (Capacity)</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['From', 'To', 'Capacity', result ? 'Flow' : '', result ? 'Utilization' : ''].filter(Boolean).map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#4b5563', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(result?.edges || cfg.edges.map(e => ({ from: e[0], to: e[1], capacity: e[2] }))).map((e: any, i: number) => {
                    const isCut = result?.minCutEdges?.some((c: any) => c.from === e.from && c.to === e.to);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: isCut ? 'rgba(239,68,68,0.06)' : 'transparent' }}>
                        <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>{cfg.nodeLabels[e.from] || `N${e.from}`}</td>
                        <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>{cfg.nodeLabels[e.to] || `N${e.to}`}</td>
                        <td style={{ padding: '8px 12px', color: cfg.color, fontWeight: 600 }}>{e.capacity}</td>
                        {result && <td style={{ padding: '8px 12px', color: '#22c55e', fontWeight: 600 }}>{e.flow ?? 0}</td>}
                        {result && (
                          <td style={{ padding: '8px 12px' }}>
                            <div className="flex items-center gap-2">
                              <div style={{ width: 60, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                                <div style={{ height: '100%', borderRadius: 3, background: isCut ? '#ef4444' : cfg.color, width: `${e.utilization ?? 0}%` }} />
                              </div>
                              <span style={{ fontSize: 11, color: isCut ? '#ef4444' : '#94a3b8' }}>{e.utilization ?? 0}%{isCut ? ' ⚠' : ''}</span>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button onClick={runFlow} disabled={loading}
              style={{ marginTop: 16, width: '100%', padding: '11px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', border: 'none', background: loading ? '#1e3a5f' : `linear-gradient(135deg,${cfg.color},${cfg.color}cc)`, color: '#fff' }}>
              {loading ? 'Java Computing Max Flow...' : `Run Ford-Fulkerson on ${cfg.label}`}
            </button>
            {error && <div style={{ marginTop: 8, fontSize: 12, color: '#ef4444' }}>{error}</div>}
          </div>
        </div>

        {/* Right — results */}
        <div className="flex flex-col gap-4">
          {result ? (
            <>
              {/* Max flow result */}
              <div className="glass-card p-5" style={{ borderTop: `3px solid ${cfg.color}` }}>
                <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 600, marginBottom: 4 }}>MAXIMUM FLOW</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{result.maxFlow}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {preset === 'water' ? 'KL/hr to Zone C' : preset === 'energy' ? 'MW to City Load' : preset === 'traffic' ? 'Vehicles/min to City Center' : 'Units to Zone B'}
                </div>
                <div style={{ marginTop: 12, fontSize: 11, color: '#4b5563' }}>
                  Source: {cfg.nodeLabels[result.source]} → Sink: {cfg.nodeLabels[result.sink]}
                </div>
              </div>

              {/* Min cut */}
              <div className="glass-card p-5" style={{ border: '1px solid rgba(239,68,68,0.25)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>⚠ Critical Bottleneck (Min-Cut)</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 1.6 }}>
                  These edges are the critical bottlenecks — removing them would completely cut off flow.
                </div>
                {result.minCutEdges?.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 12, color: '#fca5a5' }}>
                      {cfg.nodeLabels[c.from] || `N${c.from}`} → {cfg.nodeLabels[c.to] || `N${c.to}`}
                    </span>
                    <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 700 }}>Cap: {c.capacity}</span>
                  </div>
                ))}
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(239,68,68,0.06)', borderRadius: 8, fontSize: 11, color: '#fca5a5' }}>
                  Max-Flow Min-Cut Theorem: max flow = capacity of min cut = {result.maxFlow}
                </div>
              </div>

              {/* Algorithm details */}
              <div className="glass-card p-4" style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.1)' }}>
                <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600, marginBottom: 8 }}>JAVA ALGORITHM: {result.algorithm}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.8 }}>
                  Time Complexity: {result.timeComplexity}<br/>
                  Uses BFS to find augmenting paths (Edmonds-Karp variant)<br/>
                  Guarantees optimal max flow via augmenting path method
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-6 text-center" style={{ border: `1px solid ${cfg.color}20` }}>
              <Icon size={32} style={{ color: cfg.color, margin: '0 auto 12px' }} />
              <div style={{ fontSize: 14, color: '#94a3b8' }}>Select a network type and click Run to see Java Ford-Fulkerson compute the maximum flow.</div>
            </div>
          )}

          {/* Theory card */}
          <div className="glass-card p-4">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f8fafc', marginBottom: 8 }}>Algorithms in this Module</div>
            {[
              { name: 'Ford-Fulkerson', use: 'Water/energy flow', complexity: 'O(E × maxFlow)' },
              { name: 'Edmonds-Karp', use: 'BFS augmenting paths', complexity: 'O(V × E²)' },
              { name: "Dinic's", use: 'Large city networks', complexity: 'O(V² × E)' },
              { name: 'Bipartite Match', use: 'Resource assignment', complexity: 'O(E√V)' },
            ].map(a => (
              <div key={a.name} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{a.name}</span>
                <span style={{ color: '#4b5563' }}>{a.use}</span>
                <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{a.complexity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
