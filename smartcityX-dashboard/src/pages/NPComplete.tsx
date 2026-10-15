import { useState } from 'react';
import { Server, Plus, X, CheckCircle, XCircle, Shield } from 'lucide-react';

const DEFAULT_VARS = ['RoadA_Open', 'WaterMain_Working', 'EmergRoute_Open', 'PowerGrid_Active', 'TrafficSignal_On'];
const DEFAULT_CLAUSES = [[1,2,3],[-1,4,5],[2,-4,3],[-2,-3,4],[1,-5,2]];

const DEFAULT_NODES = ['CentralHub','PumpStation','Substation','Junction4','TrafficNode','WaterTower','FireStation','Hospital'];
const DEFAULT_EDGES = [[0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,6],[4,6],[5,7],[6,7]];

export default function NPComplete() {
  const [tab, setTab] = useState<'sat'|'vc'>('sat');

  // SAT state
  const [satResult, setSatResult] = useState<any>(null);
  const [satLoading, setSatLoading] = useState(false);
  const [satError, setSatError] = useState('');

  // Vertex Cover state
  const [vcResult, setVcResult] = useState<any>(null);
  const [vcLoading, setVcLoading] = useState(false);
  const [vcError, setVcError] = useState('');

  const runSAT = async () => {
    setSatLoading(true); setSatError(''); setSatResult(null);
    try {
      const res = await fetch('http://localhost:6789/api/sat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: DEFAULT_VARS, clauses: DEFAULT_CLAUSES })
      });
      setSatResult(await res.json());
    } catch { setSatError('Java server offline. Run: java -cp out SmartCityXServer'); }
    finally { setSatLoading(false); }
  };

  const runVC = async () => {
    setVcLoading(true); setVcError(''); setVcResult(null);
    try {
      const res = await fetch('http://localhost:6789/api/vertexcover', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: DEFAULT_NODES, edges: DEFAULT_EDGES })
      });
      setVcResult(await res.json());
    } catch { setVcError('Java server offline. Run: java -cp out SmartCityXServer'); }
    finally { setVcLoading(false); }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 p-4 rounded-xl" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
        <Server size={14} style={{color:'#38bdf8'}}/>
        <span style={{fontSize:12,color:'#94a3b8'}}>Module 5 — CO5 &nbsp;|&nbsp; NP-Completeness & Approximation &nbsp;|&nbsp; Java DPLL + 2-Approximation &nbsp;|&nbsp; Port 6789</span>
      </div>

      {/* NP explanation */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { title:'SAT / 3-SAT', color:'#ef4444', desc:'City planning constraints as boolean satisfiability. NP-Complete — no polynomial algorithm known.', complexity:'O(2^N)' },
          { title:'Vertex Cover', color:'#f59e0b', desc:'Minimum set of infrastructure nodes to cover all network connections. NP-Hard — use 2-approximation.', complexity:'O(V+E)' },
          { title:'CLIQUE / Indep. Set', color:'#8b5cf6', desc:'Find conflicting or compatible city services. Polynomial reduction from 3-SAT proves NP-hardness.', complexity:'O(2^N)' },
        ].map(c => (
          <div key={c.title} className="glass-card p-4" style={{ borderTop: `2px solid ${c.color}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>{c.title}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, marginBottom: 8 }}>{c.desc}</div>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: c.color }}>{c.complexity}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-5">
        {[{k:'sat',l:'3-SAT City Planner'},{k:'vc',l:'Vertex Cover Analyzer'}].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as any)}
            style={{ padding:'9px 20px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
              background:tab===t.k?'rgba(56,189,248,0.15)':'rgba(255,255,255,0.04)',
              color:tab===t.k?'#38bdf8':'#94a3b8',
              border:`1px solid ${tab===t.k?'rgba(56,189,248,0.4)':'rgba(255,255,255,0.06)'}` }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* SAT Tab */}
      {tab === 'sat' && (
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="glass-card p-5">
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>City Planning Constraint Solver</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16, lineHeight: 1.6 }}>
              Checks whether city planning constraints can all be satisfied simultaneously. Each variable represents a city service being active/inactive.
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 600, marginBottom: 8 }}>BOOLEAN VARIABLES (City Services)</div>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_VARS.map((v, i) => (
                  <span key={i} style={{ padding:'4px 10px', borderRadius:6, fontSize:11, background:'rgba(59,130,246,0.1)', color:'#60a5fa', border:'1px solid rgba(59,130,246,0.2)' }}>
                    x{i+1}: {v}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 600, marginBottom: 8 }}>3-SAT CLAUSES (Constraints)</div>
              {DEFAULT_CLAUSES.map((cl, i) => (
                <div key={i} style={{ marginBottom: 6, padding:'8px 12px', background:'rgba(255,255,255,0.03)', borderRadius:8, fontSize:12 }}>
                  <span style={{ color:'#4b5563', marginRight:8 }}>C{i+1}:</span>
                  {cl.map((lit, j) => (
                    <span key={j}>
                      <span style={{ color: lit < 0 ? '#f59e0b' : '#38bdf8' }}>
                        {lit < 0 ? `¬x${Math.abs(lit)}` : `x${lit}`}
                      </span>
                      {j < cl.length-1 && <span style={{ color:'#4b5563', margin:'0 6px' }}>∨</span>}
                    </span>
                  ))}
                </div>
              ))}
            </div>

            <button onClick={runSAT} disabled={satLoading}
              style={{ width:'100%', padding:'11px', borderRadius:10, fontWeight:700, fontSize:13, cursor:satLoading?'not-allowed':'pointer', border:'none',
                background:satLoading?'#1e3a5f':'linear-gradient(135deg,#ef4444,#f97316)', color:'#fff' }}>
              {satLoading ? 'Java DPLL Running...' : 'Solve with Java DPLL Algorithm'}
            </button>
            {satError && <div style={{ marginTop:8, fontSize:12, color:'#ef4444' }}>{satError}</div>}
          </div>

          <div>
            {satResult ? (
              <div className="fade-in flex flex-col gap-4">
                <div className="glass-card p-5" style={{ borderTop:`3px solid ${satResult.satisfiable?'#22c55e':'#ef4444'}` }}>
                  <div className="flex items-center gap-3 mb-4">
                    {satResult.satisfiable
                      ? <CheckCircle size={24} style={{color:'#22c55e'}}/>
                      : <XCircle size={24} style={{color:'#ef4444'}}/>}
                    <div>
                      <div style={{ fontSize:16, fontWeight:700, color:satResult.satisfiable?'#22c55e':'#ef4444' }}>
                        {satResult.satisfiable ? 'SATISFIABLE' : 'UNSATISFIABLE'}
                      </div>
                      <div style={{ fontSize:12, color:'#94a3b8' }}>
                        {satResult.satisfiable ? 'All city planning constraints can be met!' : 'Constraints conflict — planning impossible'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      {l:'Variables', v:satResult.numVars, c:'#38bdf8'},
                      {l:'Clauses', v:satResult.numClauses, c:'#8b5cf6'},
                      {l:'Algorithm', v:'DPLL', c:'#f59e0b'},
                      {l:'Complexity', v:'O(2^N)', c:'#ef4444'},
                    ].map(s => (
                      <div key={s.l} style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'10px 12px'}}>
                        <div style={{fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:10,color:'#4b5563'}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <div style={{ fontSize:12, fontWeight:600, color:'#f8fafc', marginBottom:12 }}>Variable Assignment (Satisfying Solution)</div>
                  {satResult.assignment?.map((a: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <span style={{fontSize:12,color:'#94a3b8'}}>{a.variable}</span>
                      <span style={{fontSize:12,fontWeight:700,color:a.value?'#22c55e':'#ef4444',padding:'2px 10px',borderRadius:6,background:a.value?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)'}}>
                        {a.value ? '✓ ACTIVE' : '✗ INACTIVE'}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{padding:'12px',borderRadius:8,background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)',fontSize:11,color:'#fca5a5',lineHeight:1.7}}>
                  <b style={{color:'#ef4444'}}>NP-Complete:</b> No polynomial-time algorithm is known for SAT. DPLL uses backtracking — worst case O(2^N). This is why city planning with many constraints is computationally hard.
                </div>
              </div>
            ) : (
              <div className="glass-card p-8 text-center h-full flex flex-col items-center justify-center" style={{border:'1px solid rgba(239,68,68,0.15)'}}>
                <Shield size={32} style={{color:'#ef4444',marginBottom:12}}/>
                <div style={{fontSize:14,color:'#94a3b8'}}>Run the DPLL solver to check if city constraints are satisfiable.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vertex Cover Tab */}
      {tab === 'vc' && (
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="glass-card p-5">
            <div style={{ fontSize:14, fontWeight:700, color:'#f8fafc', marginBottom:4 }}>Infrastructure Vertex Cover Analyzer</div>
            <div style={{ fontSize:12, color:'#94a3b8', marginBottom:16, lineHeight:1.6 }}>
              Finds the minimum set of infrastructure nodes that "cover" every connection. These are the critical nodes that must be monitored or maintained.
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:'#4b5563', fontWeight:600, marginBottom:8 }}>CITY INFRASTRUCTURE NODES</div>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_NODES.map((n, i) => (
                  <span key={i} style={{padding:'4px 10px',borderRadius:6,fontSize:11,background:'rgba(139,92,246,0.1)',color:'#a78bfa',border:'1px solid rgba(139,92,246,0.2)'}}>
                    {i}: {n}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:'#4b5563', fontWeight:600, marginBottom:8 }}>CONNECTIONS ({DEFAULT_EDGES.length} edges)</div>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_EDGES.map((e, i) => (
                  <span key={i} style={{padding:'3px 8px',borderRadius:4,fontSize:11,background:'rgba(255,255,255,0.04)',color:'#94a3b8',border:'1px solid rgba(255,255,255,0.06)'}}>
                    {DEFAULT_NODES[e[0]]} ↔ {DEFAULT_NODES[e[1]]}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={runVC} disabled={vcLoading}
              style={{width:'100%',padding:'11px',borderRadius:10,fontWeight:700,fontSize:13,cursor:vcLoading?'not-allowed':'pointer',border:'none',
                background:vcLoading?'#1e3a5f':'linear-gradient(135deg,#f59e0b,#fb923c)',color:'#fff'}}>
              {vcLoading ? 'Java Computing...' : 'Run 2-Approximation Vertex Cover (Java)'}
            </button>
            {vcError && <div style={{marginTop:8,fontSize:12,color:'#ef4444'}}>{vcError}</div>}
          </div>

          <div>
            {vcResult ? (
              <div className="fade-in flex flex-col gap-4">
                <div className="glass-card p-5" style={{borderTop:'3px solid #f59e0b'}}>
                  <div style={{fontSize:12,color:'#4b5563',fontWeight:600,marginBottom:4}}>MINIMUM VERTEX COVER</div>
                  <div style={{fontSize:40,fontWeight:800,color:'#f59e0b',lineHeight:1}}>{vcResult.coverSize}</div>
                  <div style={{fontSize:12,color:'#94a3b8',marginTop:4}}>critical nodes out of {vcResult.totalNodes}</div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {[
                      {l:'Nodes Covered', v:vcResult.coverSize, c:'#f59e0b'},
                      {l:'Edges Covered', v:`${vcResult.totalEdges}/${vcResult.totalEdges}`, c:'#22c55e'},
                      {l:'All Covered', v:vcResult.coversAllEdges?'Yes':'No', c:'#22c55e'},
                      {l:'Approximation', v:vcResult.approximationRatio, c:'#38bdf8'},
                    ].map(s => (
                      <div key={s.l} style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'10px 12px'}}>
                        <div style={{fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:10,color:'#4b5563'}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <div style={{fontSize:12,fontWeight:600,color:'#f8fafc',marginBottom:10}}>Critical Infrastructure Nodes</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vcResult.coverNodes?.map((n: string, i: number) => (
                      <span key={i} style={{padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:600,background:'rgba(245,158,11,0.15)',color:'#f59e0b',border:'1px solid rgba(245,158,11,0.3)'}}>
                        ⚡ {n}
                      </span>
                    ))}
                  </div>
                  <div style={{fontSize:11,color:'#94a3b8',lineHeight:1.7}}>
                    These {vcResult.coverSize} nodes, if maintained or monitored, ensure every connection in the city infrastructure network is covered. This is the 2-approximation result — guaranteed to be at most 2× the optimal minimum.
                  </div>
                </div>

                <div style={{padding:'12px',borderRadius:8,background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.15)',fontSize:11,color:'#fde68a',lineHeight:1.7}}>
                  <b style={{color:'#f59e0b'}}>NP-Hard:</b> Minimum Vertex Cover is NP-Hard — no polynomial exact algorithm. The 2-approximation runs in O(V+E) and guarantees the result is at most 2× optimal. Used when exact solution is too expensive.
                </div>
              </div>
            ) : (
              <div className="glass-card p-8 text-center h-full flex flex-col items-center justify-center" style={{border:'1px solid rgba(245,158,11,0.15)'}}>
                <Shield size={32} style={{color:'#f59e0b',marginBottom:12}}/>
                <div style={{fontSize:14,color:'#94a3b8'}}>Run the analyzer to find critical infrastructure nodes that must be monitored.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
