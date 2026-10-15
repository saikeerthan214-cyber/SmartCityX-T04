import { useState, useEffect } from 'react';
import { Server, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

export default function RandomizedParallel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('quicksort');

  const run = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:6789/api/randomized');
      setData(await res.json());
    } catch { setError('Java server offline. Run: java -cp out SmartCityXServer'); }
    finally { setLoading(false); }
  };

  useEffect(() => { run(); }, []);

  const tabs = [
    { k:'quicksort', l:'QuickSort' },
    { k:'reservoir', l:'Reservoir Sampling' },
    { k:'miller',    l:'Miller-Rabin' },
    { k:'parallel',  l:'Parallel Reduce' },
    { k:'blelloch',  l:'Blelloch Scan' },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 p-4 rounded-xl" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="flex items-center gap-2">
          <Server size={14} style={{color:'#38bdf8'}}/>
          <span style={{fontSize:12,color:'#94a3b8'}}>Module 6 — CO6 &nbsp;|&nbsp; Randomized & Parallel Algorithms &nbsp;|&nbsp; Java Backend &nbsp;|&nbsp; Port 6789</span>
        </div>
        <button onClick={run} disabled={loading} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:8,background:'rgba(56,189,248,0.1)',color:'#38bdf8',border:'1px solid rgba(56,189,248,0.2)',cursor:'pointer',fontSize:12,fontWeight:600}}>
          <RefreshCw size={13} style={{animation:loading?'spin 1s linear infinite':undefined}}/> {loading?'Running Java...':'Re-run'}
        </button>
      </div>

      {error && <div style={{padding:'10px 14px',borderRadius:8,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',fontSize:12,color:'#ef4444',marginBottom:16}}>{error}</div>}

      {/* Overview cards */}
      <div className="grid grid-cols-5 gap-3 mb-5" style={{gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))'}}>
        {[
          {l:'Randomized QuickSort', c:'#3b82f6', desc:'O(N log N) expected'},
          {l:'Reservoir Sampling',   c:'#38bdf8', desc:'O(N) one-pass'},
          {l:'Miller-Rabin',         c:'#8b5cf6', desc:'O(k log² N)'},
          {l:'Parallel Reduce',      c:'#22c55e', desc:'O(N/P + log P)'},
          {l:'Blelloch Scan',        c:'#f59e0b', desc:'O(log N) parallel'},
        ].map(a => (
          <div key={a.l} className="glass-card p-3" style={{borderTop:`2px solid ${a.c}`,cursor:'pointer'}} onClick={()=>setActiveTab(a.l.toLowerCase().includes('quick')?'quicksort':a.l.toLowerCase().includes('reservoir')?'reservoir':a.l.toLowerCase().includes('miller')?'miller':a.l.toLowerCase().includes('parallel')?'parallel':'blelloch')}>
            <div style={{fontSize:12,fontWeight:600,color:'#e2e8f0',marginBottom:4}}>{a.l}</div>
            <div style={{fontSize:11,color:a.c,fontFamily:'monospace'}}>{a.desc}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(t => (
          <button key={t.k} onClick={()=>setActiveTab(t.k)}
            style={{padding:'7px 16px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',transition:'all 0.15s',
              background:activeTab===t.k?'rgba(56,189,248,0.15)':'rgba(255,255,255,0.04)',
              color:activeTab===t.k?'#38bdf8':'#94a3b8',
              border:`1px solid ${activeTab===t.k?'rgba(56,189,248,0.4)':'rgba(255,255,255,0.06)'}`}}>
            {t.l}
          </button>
        ))}
      </div>

      {!data && !loading && <div className="glass-card p-8 text-center"><div style={{color:'#4b5563'}}>Loading Java results...</div></div>}

      {/* QuickSort */}
      {activeTab==='quicksort' && data?.quickSort && (
        <div className="grid gap-5" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="glass-card p-5">
            <div style={{fontSize:14,fontWeight:700,color:'#f8fafc',marginBottom:4}}>Randomized QuickSort</div>
            <div style={{fontSize:12,color:'#94a3b8',marginBottom:16,lineHeight:1.6}}>
              Sorts city service request priorities using a randomly chosen pivot. Random pivot prevents worst-case O(N²) for sorted inputs, guaranteeing O(N log N) expected time.
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:'#4b5563',fontWeight:600,marginBottom:6}}>INPUT — Service Request Priority Scores</div>
              <div className="flex flex-wrap gap-1">
                {data.quickSort.original.map((v: number, i: number) => (
                  <span key={i} style={{padding:'3px 8px',borderRadius:4,fontSize:12,fontWeight:600,background:'rgba(59,130,246,0.1)',color:'#60a5fa'}}>{v}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:11,color:'#4b5563',fontWeight:600,marginBottom:6}}>OUTPUT — Sorted (Lowest to Highest Priority)</div>
              <div className="flex flex-wrap gap-1">
                {data.quickSort.sorted.map((v: number, i: number) => (
                  <span key={i} style={{padding:'3px 8px',borderRadius:4,fontSize:12,fontWeight:600,
                    background: i >= data.quickSort.sorted.length-3 ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.1)',
                    color: i >= data.quickSort.sorted.length-3 ? '#ef4444' : '#22c55e'}}>
                    {v}
                  </span>
                ))}
              </div>
              <div style={{fontSize:11,color:'#ef4444',marginTop:6}}>Top 3 critical: {data.quickSort.sorted.slice(-3).reverse().join(', ')}</div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div style={{fontSize:13,fontWeight:600,color:'#f8fafc',marginBottom:12}}>Priority Distribution</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.quickSort.sorted.map((v:number,i:number)=>({rank:i+1,priority:v}))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="rank" tick={{fill:'#4b5563',fontSize:10}}/>
                <YAxis tick={{fill:'#4b5563',fontSize:10}}/>
                <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f8fafc',fontSize:12}}/>
                <Bar dataKey="priority" fill="#3b82f6" radius={[2,2,0,0]} name="Priority Score"/>
              </BarChart>
            </ResponsiveContainer>
            <div style={{marginTop:12,padding:'10px',borderRadius:8,background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.1)',fontSize:11,color:'#94a3b8',lineHeight:1.7}}>
              <b style={{color:'#60a5fa'}}>Algorithm:</b> {data.quickSort.algorithm}<br/>
              <b style={{color:'#60a5fa'}}>Complexity:</b> {data.quickSort.complexity}<br/>
              Random pivot ensures no adversarial input can force O(N²)
            </div>
          </div>
        </div>
      )}

      {/* Reservoir Sampling */}
      {activeTab==='reservoir' && data?.reservoirSample && (
        <div className="grid gap-5" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="glass-card p-5">
            <div style={{fontSize:14,fontWeight:700,color:'#f8fafc',marginBottom:4}}>Reservoir Sampling — IoT Stream</div>
            <div style={{fontSize:12,color:'#94a3b8',marginBottom:16,lineHeight:1.6}}>
              Samples K readings from a continuous IoT sensor stream of unknown length. Each reading has exactly K/N probability of being selected — uniform sampling without storing the entire stream.
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                {l:'Stream Size', v:data.reservoirSample.streamSize, c:'#38bdf8'},
                {l:'Sample Size (K)', v:data.reservoirSample.sampleSize, c:'#22c55e'},
                {l:'Sampling Prob.', v:`${(data.reservoirSample.sampleSize/data.reservoirSample.streamSize*100).toFixed(1)}%`, c:'#f59e0b'},
                {l:'Algorithm', v:'Reservoir (Alg R)', c:'#8b5cf6'},
              ].map(s => (
                <div key={s.l} style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'10px 12px'}}>
                  <div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:10,color:'#4b5563',marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:11,color:'#4b5563',fontWeight:600,marginBottom:8}}>SAMPLED IoT READINGS (Temperature °C)</div>
              <div className="flex flex-wrap gap-2">
                {data.reservoirSample.sample.map((v: number, i: number) => (
                  <span key={i} style={{padding:'6px 14px',borderRadius:8,fontSize:14,fontWeight:700,
                    background:v>70?'rgba(239,68,68,0.15)':v>50?'rgba(245,158,11,0.15)':'rgba(34,197,94,0.15)',
                    color:v>70?'#ef4444':v>50?'#f59e0b':'#22c55e'}}>
                    {v}°
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div style={{fontSize:13,fontWeight:600,color:'#f8fafc',marginBottom:12}}>Sample Distribution</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.reservoirSample.sample.map((v:number,i:number)=>({sensor:`S${i+1}`,value:v}))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="sensor" tick={{fill:'#4b5563',fontSize:10}}/>
                <YAxis tick={{fill:'#4b5563',fontSize:10}}/>
                <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f8fafc',fontSize:12}}/>
                <Bar dataKey="value" fill="#38bdf8" radius={[2,2,0,0]} name="Reading"/>
              </BarChart>
            </ResponsiveContainer>
            <div style={{marginTop:12,padding:'10px',borderRadius:8,background:'rgba(56,189,248,0.06)',border:'1px solid rgba(56,189,248,0.1)',fontSize:11,color:'#94a3b8',lineHeight:1.7}}>
              <b style={{color:'#38bdf8'}}>Key property:</b> Each of the 500 stream elements has equal 10/500 = 2% probability of being in the sample. Proven mathematically uniform.
            </div>
          </div>
        </div>
      )}

      {/* Miller-Rabin */}
      {activeTab==='miller' && data?.millerRabin && (
        <div className="glass-card p-5">
          <div style={{fontSize:14,fontWeight:700,color:'#f8fafc',marginBottom:4}}>Miller-Rabin Primality Test</div>
          <div style={{fontSize:12,color:'#94a3b8',marginBottom:16,lineHeight:1.6}}>
            Probabilistic primality test used to verify large city IDs, sensor serial numbers, and cryptographic keys. 10 rounds give error probability &lt; 4^(-10) ≈ one in a million.
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                  {['Number','Digits','Result','City Application'].map(h=>(
                    <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:11,color:'#4b5563',fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.millerRabin.results.map((r: any, i: number) => (
                  <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <td style={{padding:'12px 16px',fontFamily:'monospace',fontSize:14,fontWeight:700,color:'#e2e8f0'}}>{r.number.toLocaleString()}</td>
                    <td style={{padding:'12px 16px',fontSize:12,color:'#94a3b8'}}>{r.number.toString().length} digits</td>
                    <td style={{padding:'12px 16px'}}>
                      <span style={{padding:'4px 12px',borderRadius:6,fontSize:12,fontWeight:700,
                        background:r.isPrime?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)',
                        color:r.isPrime?'#22c55e':'#ef4444'}}>
                        {r.isPrime ? '✓ PRIME' : '✗ COMPOSITE'}
                      </span>
                    </td>
                    <td style={{padding:'12px 16px',fontSize:12,color:'#94a3b8'}}>
                      {r.isPrime ? 'Valid sensor/device ID' : 'Invalid — reject this ID'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{marginTop:16,padding:'12px',borderRadius:8,background:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.15)',fontSize:11,color:'#94a3b8',lineHeight:1.7}}>
            <b style={{color:'#a78bfa'}}>Algorithm:</b> {data.millerRabin.algorithm} &nbsp;|&nbsp; Rounds: {data.millerRabin.rounds} &nbsp;|&nbsp; Error probability per round: 1/4 &nbsp;|&nbsp; Total error: 4^(-10) ≈ 0.000001%
          </div>
        </div>
      )}

      {/* Parallel Reduce */}
      {activeTab==='parallel' && data?.parallelReduce && (
        <div className="grid gap-5" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="glass-card p-5">
            <div style={{fontSize:14,fontWeight:700,color:'#f8fafc',marginBottom:4}}>Parallel Reduce — City Statistics</div>
            <div style={{fontSize:12,color:'#94a3b8',marginBottom:16,lineHeight:1.6}}>
              Aggregates sensor readings from all city zones in parallel using divide-and-conquer. With P processors, reduces time from O(N) to O(N/P + log P).
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                {l:'Data Points', v:data.parallelReduce.dataSize, c:'#22c55e'},
                {l:'Aggregated Sum', v:data.parallelReduce.sum, c:'#38bdf8'},
                {l:'Algorithm', v:'ForkJoin Parallel', c:'#f59e0b'},
                {l:'Complexity', v:data.parallelReduce.complexity, c:'#8b5cf6'},
              ].map(s => (
                <div key={s.l} style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'12px'}}>
                  <div style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:10,color:'#4b5563',marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{padding:'12px',borderRadius:8,background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.15)',fontSize:11,color:'#94a3b8',lineHeight:1.8}}>
              <b style={{color:'#22c55e'}}>Brent's Theorem:</b> T_P ≤ T₁/P + T∞<br/>
              Where T₁ = serial work, T∞ = critical path length<br/>
              Parallelism = T₁/T∞ = theoretical max speedup
            </div>
          </div>
          <div className="glass-card p-5">
            <div style={{fontSize:13,fontWeight:600,color:'#f8fafc',marginBottom:12}}>Parallel vs Sequential Speedup</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[1,2,4,8,16,32].map(p=>({processors:p,time:Math.round(data.parallelReduce.dataSize/p+Math.log2(p)*5),sequential:data.parallelReduce.dataSize}))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="processors" tick={{fill:'#4b5563',fontSize:10}} label={{value:'Processors',position:'bottom',fill:'#4b5563',fontSize:10}}/>
                <YAxis tick={{fill:'#4b5563',fontSize:10}}/>
                <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f8fafc',fontSize:12}}/>
                <Line type="monotone" dataKey="time" stroke="#22c55e" strokeWidth={2} name="Parallel Time" dot/>
                <Line type="monotone" dataKey="sequential" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Sequential" dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Blelloch Scan */}
      {activeTab==='blelloch' && data?.blellochScan && (
        <div className="glass-card p-5">
          <div style={{fontSize:14,fontWeight:700,color:'#f8fafc',marginBottom:4}}>Blelloch Prefix Scan — Cumulative Zone Energy</div>
          <div style={{fontSize:12,color:'#94a3b8',marginBottom:16,lineHeight:1.6}}>
            Computes prefix sums (cumulative totals) across city zones in O(log N) parallel steps instead of O(N) sequential. Useful for detecting at which zone cumulative grid load exceeds capacity.
          </div>
          <div style={{overflowX:'auto',marginBottom:16}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                  {['Zone','Energy Load (MW)','Cumulative Load','Status'].map(h=>(
                    <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,color:'#4b5563',fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.blellochScan.zones.map((z: any, i: number) => {
                  const pct = z.cumulative/985*100;
                  return (
                    <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <td style={{padding:'10px 14px',fontWeight:600,color:'#e2e8f0',fontSize:13}}>{z.zone}</td>
                      <td style={{padding:'10px 14px',fontSize:13,color:'#f59e0b',fontWeight:600}}>{z.load} MW</td>
                      <td style={{padding:'10px 14px'}}>
                        <div className="flex items-center gap-2">
                          <div style={{width:80,height:6,background:'rgba(255,255,255,0.08)',borderRadius:3}}>
                            <div style={{height:'100%',borderRadius:3,background:pct>80?'#ef4444':pct>60?'#f59e0b':'#22c55e',width:`${Math.min(pct,100)}%`}}/>
                          </div>
                          <span style={{fontSize:12,fontWeight:700,color:pct>80?'#ef4444':pct>60?'#f59e0b':'#22c55e'}}>{z.cumulative} MW</span>
                        </div>
                      </td>
                      <td style={{padding:'10px 14px'}}>
                        <span style={{fontSize:11,fontWeight:600,color:pct>80?'#ef4444':pct>60?'#f59e0b':'#22c55e'}}>
                          {pct>80?'⚠ Near Capacity':pct>60?'⚡ High Load':'✓ Normal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{padding:'12px',borderRadius:8,background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.15)',fontSize:11,color:'#94a3b8',lineHeight:1.7}}>
            <b style={{color:'#f59e0b'}}>Algorithm:</b> {data.blellochScan.algorithm} &nbsp;|&nbsp;
            <b style={{color:'#f59e0b'}}>Complexity:</b> {data.blellochScan.complexity}<br/>
            Up-sweep builds partial sums in O(log N) steps. Down-sweep propagates prefix sums in O(log N) steps. Total: O(log N) parallel vs O(N) sequential.
          </div>
        </div>
      )}
    </div>
  );
}
