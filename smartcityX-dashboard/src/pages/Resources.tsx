import { useState } from 'react';
import { Server } from 'lucide-react';
import { cityResources } from '../data/resources';
import { javaOptimizeResources, ResourceOptResult } from '../api/javaApi';

export default function Resources() {
  const [budget, setBudget] = useState(80000);
  const [result, setResult] = useState<ResourceOptResult | null>(null);
  const [ran, setRan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [javaError, setJavaError] = useState('');

  const run = async () => {
    setLoading(true); setJavaError('');
    try {
      const res = await javaOptimizeResources(
        cityResources.map(r => ({ id: r.id, cost: r.cost, serviceValue: r.serviceValue })),
        budget
      );
      setResult(res); setRan(true);
    } catch {
      setJavaError('Java server offline — run: java -cp out SmartCityXServer');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      {/* Resources Grid */}
      <div style={{fontWeight:600,color:'#f8fafc',fontSize:15,marginBottom:16}}>Available City Resources</div>
      <div className="grid gap-4 mb-6" style={{gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))'}}>
        {cityResources.map(r=>{
          const isSelected = result?.selectedIds?.includes(r.id);
          return (
            <div key={r.id} className="glass-card p-4" style={{border:`1px solid ${isSelected?'rgba(34,197,94,0.4)':'rgba(255,255,255,0.07)'}`,transition:'border 0.3s'}}>
              <div className="flex items-center justify-between mb-3">
                <span style={{fontSize:28}}>{r.icon}</span>
                {isSelected && <span className="badge badge-success">✓ Selected</span>}
              </div>
              <div style={{fontSize:14,fontWeight:600,color:'#e2e8f0',marginBottom:4}}>{r.name}</div>
              <div style={{fontSize:11,color:'#4b5563',marginBottom:10}}>{r.type}</div>
              <div className="flex justify-between text-xs" style={{color:'#94a3b8'}}>
                <div><div style={{color:'#38bdf8',fontWeight:600}}>₹{r.cost.toLocaleString()}</div><div>Cost</div></div>
                <div><div style={{color:'#22c55e',fontWeight:600}}>{r.available}/{r.total}</div><div>Available</div></div>
                <div><div style={{color:'#f59e0b',fontWeight:600}}>{r.serviceValue}</div><div>Value</div></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optimizer */}
      <div className="grid gap-6" style={{gridTemplateColumns:'1fr 380px'}}>
        <div className="glass-card p-6">
          <div style={{fontWeight:600,color:'#f8fafc',fontSize:15,marginBottom:4}}>⚡ Resource Optimizer</div>
          <div className="flex items-center gap-2 mb-5">
            <Server size={12} style={{color:'#38bdf8'}}/>
            <span style={{fontSize:12,color:'#4b5563'}}>Algorithm: Bitmask DP in Java · O(2ᴺ × N) · Port 6789</span>
          </div>
          {javaError && (
            <div className="mb-4 px-3 py-2 rounded-lg" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)'}}>
              <div style={{fontSize:11,color:'#ef4444'}}>{javaError}</div>
            </div>
          )}

          <div style={{marginBottom:20}}>
            <label style={{fontSize:12,color:'#94a3b8',display:'block',marginBottom:8}}>Deployment Budget</label>
            <div className="flex items-center gap-3">
              <input type="range" min={20000} max={200000} step={5000} value={budget}
                onChange={e=>setBudget(+e.target.value)} style={{flex:1,accentColor:'#3b82f6'}}/>
              <div style={{background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'6px 14px',fontSize:14,fontWeight:700,color:'#38bdf8',minWidth:110,textAlign:'center'}}>
                ₹{budget.toLocaleString()}
              </div>
            </div>
          </div>

          <button onClick={run} disabled={loading}
            style={{width:'100%',padding:'12px',borderRadius:10,background:loading?'#1e3a5f':'linear-gradient(135deg,#3b82f6,#38bdf8)',color:'#fff',fontWeight:700,fontSize:14,cursor:loading?'not-allowed':'pointer',border:'none',letterSpacing:'0.3px'}}>
            {loading ? 'Java Computing...' : 'Optimize Resources (Java Bitmask DP)'}
          </button>

          {ran && result && (
            <div className="mt-5 fade-in">
              <div style={{fontWeight:600,color:'#22c55e',fontSize:14,marginBottom:12}}>✅ Optimal Resource Allocation</div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  {l:'Resources Selected',  v:result.selectedIds.length,                   c:'#38bdf8'},
                  {l:'Total Cost',           v:`₹${result.totalCost.toLocaleString()}`,     c:'#f59e0b'},
                  {l:'Coverage Score',       v:`${result.coverageScore}%`,                  c:'#22c55e'},
                  {l:'Combinations Tested',  v:result.combinationsEvaluated.toLocaleString(),c:'#8b5cf6'},
                ].map(s=>(
                  <div key={s.l} style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'12px'}}>
                    <div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:11,color:'#4b5563',marginTop:2}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{fontSize:11,color:'#4b5563',fontWeight:600,marginBottom:8}}>SELECTED RESOURCES</div>
                {result.selectedIds.map((id:string)=>{
                  const r = cityResources.find(x=>x.id===id);
                  return r ? (
                    <div key={id} className="flex items-center gap-3 py-2" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <span>{r.icon}</span>
                      <span style={{fontSize:13,color:'#e2e8f0',flex:1}}>{r.name}</span>
                      <span style={{fontSize:12,color:'#38bdf8'}}>₹{r.cost.toLocaleString()}</span>
                      <span style={{fontSize:12,color:'#22c55e'}}>+{r.serviceValue} pts</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="glass-card p-5">
          <div style={{fontWeight:600,color:'#f8fafc',fontSize:14,marginBottom:12}}>How Bitmask DP Works</div>
          <div style={{fontSize:12,color:'#94a3b8',lineHeight:1.8,marginBottom:16}}>
            Each subset of N resources is represented as a binary bitmask. The algorithm evaluates all 2ᴺ combinations to find the one that maximises service value within the budget constraint.
          </div>
          <div className="algo-highlight mb-4">
            for mask in 0 to 2^N - 1:<br/>
            &nbsp;&nbsp;totalCost = sum(cost[i] if mask&(1&lt;&lt;i))<br/>
            &nbsp;&nbsp;totalValue = sum(val[i] if mask&(1&lt;&lt;i))<br/>
            &nbsp;&nbsp;if totalCost &lt;= budget:<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;update best
          </div>
          <div style={{fontSize:11,color:'#4b5563',fontWeight:600,marginBottom:8}}>COMPLEXITY</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              {l:'Time',  v:'O(2ᴺ × N)', c:'#38bdf8'},
              {l:'Space', v:'O(2ᴺ)',      c:'#8b5cf6'},
              {l:'N (resources)', v:`${cityResources.length}`, c:'#f59e0b'},
              {l:'Total subsets', v:`${Math.pow(2,cityResources.length)}`, c:'#22c55e'},
            ].map(s=>(
              <div key={s.l} style={{background:'rgba(255,255,255,0.03)',borderRadius:6,padding:'8px 10px'}}>
                <div style={{fontSize:13,fontWeight:700,color:s.c}}>{s.v}</div>
                <div style={{fontSize:10,color:'#4b5563'}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
