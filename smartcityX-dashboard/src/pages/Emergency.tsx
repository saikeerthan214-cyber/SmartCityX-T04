import { useState } from 'react';
import { AlertTriangle, MapPin, Clock, Users, X, Flame, Droplets, Zap, Car, Wind, Building2, ScanSearch, Server } from 'lucide-react';
import { emergencies, Emergency } from '../data/emergencies';
import { javaSearch } from '../api/javaApi';

const typeIcon = (t: string) => {
  switch(t) {
    case 'Fire': return <Flame size={14} color="#ef4444"/>;
    case 'Flood': return <Droplets size={14} color="#38bdf8"/>;
    case 'Power Failure': return <Zap size={14} color="#f59e0b"/>;
    case 'Accident': return <Car size={14} color="#f97316"/>;
    case 'Gas Leak': return <Wind size={14} color="#a78bfa"/>;
    case 'Structural': return <Building2 size={14} color="#fb923c"/>;
    default: return <AlertTriangle size={14} color="#ef4444"/>;
  }
};
const pColor=(p:string)=>p==='HIGH'?'#ef4444':p==='MEDIUM'?'#f59e0b':'#22c55e';
const sColor=(s:string)=>s==='Active'?'#ef4444':s==='Responding'?'#f59e0b':s==='Contained'?'#38bdf8':'#22c55e';

export default function EmergencyPage() {
  const [selected, setSelected] = useState<Emergency|null>(null);
  const [filter, setFilter]     = useState('All');

  // Aho-Corasick scanner
  const [scanText, setScanText]     = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanning, setScanning]     = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const EMERGENCY_KEYWORDS = 'fire,flood,accident,gas leak,explosion,injured,ambulance,emergency,danger,critical,blackout,collapse,leak,smoke,trapped,casualties';

  const runScan = async () => {
    if (!scanText.trim()) return;
    setScanning(true); setScanResult(null);
    try {
      const result = await javaSearch([scanText], EMERGENCY_KEYWORDS, 'aho-corasick');
      setScanResult(result);
    } catch {
      setScanResult({ error: 'Java server offline. Run: java -cp out SmartCityXServer' });
    } finally { setScanning(false); }
  };

  const types   = ['All','Fire','Flood','Medical','Accident','Gas Leak','Power Failure','Structural'];
  const filtered = filter==='All' ? emergencies : emergencies.filter(e=>e.type===filter);

  return (
    <div className="fade-in">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {label:'Active',value:emergencies.filter(e=>e.status==='Active').length,color:'#ef4444'},
          {label:'Responding',value:emergencies.filter(e=>e.status==='Responding').length,color:'#f59e0b'},
          {label:'Contained',value:emergencies.filter(e=>e.status==='Contained').length,color:'#38bdf8'},
          {label:'Resolved',value:emergencies.filter(e=>e.status==='Resolved').length,color:'#22c55e'},
        ].map(s=>(
          <div key={s.label} className="glass-card p-4 text-center">
            <div style={{fontSize:28,fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{fontSize:12,color:'#94a3b8',marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Aho-Corasick Emergency Scanner */}
      <div className="glass-card p-5 mb-6" style={{border:'1px solid rgba(239,68,68,0.2)'}}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <ScanSearch size={15} style={{color:'#ef4444'}}/>
              <span style={{fontWeight:700,color:'#f8fafc',fontSize:14}}>Emergency Text Scanner</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Server size={11} style={{color:'#38bdf8'}}/>
              <span style={{fontSize:11,color:'#4b5563'}}>Java Aho-Corasick detects emergency keywords in any text</span>
            </div>
          </div>
          <button onClick={()=>setShowScanner(!showScanner)}
            style={{fontSize:11,color:'#38bdf8',cursor:'pointer',background:'rgba(56,189,248,0.08)',padding:'5px 12px',borderRadius:6,border:'1px solid rgba(56,189,248,0.2)'}}>
            {showScanner ? 'Hide' : 'Open Scanner'}
          </button>
        </div>

        {showScanner && (
          <div className="fade-in">
            <textarea value={scanText} onChange={e=>setScanText(e.target.value)}
              placeholder={'Paste any text to scan for emergency keywords...\n\nExample: "There is a fire near the metro station. Several people are injured. Gas leak detected. Ambulance required immediately."'}
              rows={4}
              style={{width:'100%',background:'#0b1120',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'10px 12px',color:'#f8fafc',fontSize:13,outline:'none',resize:'vertical',marginBottom:10}}/>
            <button onClick={runScan} disabled={scanning||!scanText.trim()}
              style={{padding:'9px 20px',borderRadius:8,background:scanning||!scanText.trim()?'#1e3a5f':'#ef4444',color:scanning||!scanText.trim()?'#4b5563':'#fff',fontWeight:700,fontSize:13,cursor:'pointer',border:'none',marginBottom:12}}>
              {scanning ? 'Java Scanning...' : 'Scan for Emergencies (Java Aho-Corasick)'}
            </button>

            {/* Scan results */}
            {scanResult && !scanResult.error && (
              <div className="fade-in">
                <div className="grid grid-cols-3 gap-3 mb-4" style={{gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))'}}>
                  {[
                    {l:'Keywords Found',  v:scanResult.totalMatches,                      c:'#ef4444'},
                    {l:'States Visited',  v:scanResult.statesVisited ?? scanResult.comparisons ?? 0, c:'#8b5cf6'},
                    {l:'Exec Time',       v:`${scanResult.executionTimeMs?.toFixed(3)} ms`, c:'#f59e0b'},
                  ].map(s=>(
                    <div key={s.l} style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'10px',textAlign:'center'}}>
                      <div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
                      <div style={{fontSize:10,color:'#4b5563',marginTop:2}}>{s.l}</div>
                    </div>
                  ))}
                </div>

                {scanResult.totalMatches === 0 ? (
                  <div style={{padding:'12px',borderRadius:8,background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',fontSize:13,color:'#22c55e'}}>
                    ✅ No emergency keywords detected. Text appears safe.
                  </div>
                ) : (
                  <>
                    <div style={{fontSize:11,color:'#4b5563',fontWeight:600,marginBottom:8}}>DETECTED KEYWORDS (Java Aho-Corasick)</div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(scanResult.matches||[]).map((m:any,i:number)=>(
                        <span key={i} className="badge badge-danger">
                          🔴 {m.keyword.toUpperCase()} @ pos {m.position}
                        </span>
                      ))}
                    </div>
                    <div style={{padding:'10px 14px',borderRadius:8,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)'}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#ef4444',marginBottom:4}}>
                        ⚡ Emergency Level: {scanResult.totalMatches >= 3 ? 'CRITICAL' : scanResult.totalMatches >= 2 ? 'HIGH' : 'MEDIUM'}
                      </div>
                      <div style={{fontSize:12,color:'#fca5a5'}}>
                        Recommended: Dispatch emergency response team. {scanResult.totalMatches} keyword(s) detected by Java Aho-Corasick multi-pattern matching.
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {scanResult?.error && (
              <div style={{padding:'10px',borderRadius:8,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',fontSize:12,color:'#ef4444'}}>
                {scanResult.error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {types.map(t=>(
          <button key={t} onClick={()=>setFilter(t)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{background:filter===t?'#3b82f6':'rgba(59,130,246,0.08)',color:filter===t?'#fff':'#94a3b8',border:`1px solid ${filter===t?'#3b82f6':'rgba(255,255,255,0.06)'}`,cursor:'pointer'}}>
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              {['ID','Type','Location','Priority','Response Time','Team','Status','Action'].map(h=>(
                <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:11,color:'#4b5563',fontWeight:600,letterSpacing:'0.5px',whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e,i)=>(
              <tr key={e.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                <td style={{padding:'12px 16px',fontSize:12,color:'#38bdf8',fontWeight:600}}>{e.id}</td>
                <td style={{padding:'12px 16px'}}>
                  <div className="flex items-center gap-2" style={{fontSize:12,color:'#e2e8f0'}}>
                    {typeIcon(e.type)}{e.type}
                  </div>
                </td>
                <td style={{padding:'12px 16px'}}>
                  <div className="flex items-center gap-1" style={{fontSize:12,color:'#94a3b8'}}>
                    <MapPin size={10}/>{e.location}
                  </div>
                </td>
                <td style={{padding:'12px 16px'}}>
                  <span className="badge" style={{background:`${pColor(e.priority)}15`,color:pColor(e.priority)}}>{e.priority}</span>
                </td>
                <td style={{padding:'12px 16px'}}>
                  <div className="flex items-center gap-1" style={{fontSize:12,color:'#94a3b8'}}>
                    <Clock size={10}/>{e.responseTime}
                  </div>
                </td>
                <td style={{padding:'12px 16px',fontSize:12,color:'#94a3b8'}}>{e.team}</td>
                <td style={{padding:'12px 16px'}}>
                  <div className="flex items-center gap-1.5">
                    <span className="status-pulse" style={{background:sColor(e.status)}}/>
                    <span style={{fontSize:12,color:sColor(e.status),fontWeight:500}}>{e.status}</span>
                  </div>
                </td>
                <td style={{padding:'12px 16px'}}>
                  <button onClick={()=>setSelected(e)} style={{fontSize:11,color:'#38bdf8',cursor:'pointer',padding:'4px 10px',borderRadius:6,border:'1px solid rgba(56,189,248,0.2)',background:'rgba(56,189,248,0.06)'}}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selected&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.7)'}}>
          <div className="glass-card fade-in" style={{width:'100%',maxWidth:520,padding:24}}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {typeIcon(selected.type)}
                <span style={{fontWeight:700,color:'#f8fafc',fontSize:16}}>{selected.type} Emergency</span>
              </div>
              <button onClick={()=>setSelected(null)} style={{color:'#94a3b8',cursor:'pointer'}}><X size={18}/></button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                {label:'Incident ID',value:selected.id},
                {label:'Zone',value:selected.zone},
                {label:'Priority',value:selected.priority,color:pColor(selected.priority)},
                {label:'Status',value:selected.status,color:sColor(selected.status)},
                {label:'Reported At',value:selected.reportedAt},
                {label:'Response Time',value:selected.responseTime},
              ].map(f=>(
                <div key={f.label} style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'10px 12px'}}>
                  <div style={{fontSize:10,color:'#4b5563',fontWeight:600,letterSpacing:'0.5px',marginBottom:4}}>{f.label}</div>
                  <div style={{fontSize:13,color:f.color||'#e2e8f0',fontWeight:600}}>{f.value}</div>
                </div>
              ))}
            </div>

            <div style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'12px',marginBottom:12}}>
              <div style={{fontSize:10,color:'#4b5563',fontWeight:600,letterSpacing:'0.5px',marginBottom:6}}>LOCATION</div>
              <div className="flex items-center gap-2" style={{fontSize:13,color:'#e2e8f0'}}>
                <MapPin size={13} color="#38bdf8"/>{selected.location}
              </div>
            </div>

            <div style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'12px',marginBottom:12}}>
              <div style={{fontSize:10,color:'#4b5563',fontWeight:600,letterSpacing:'0.5px',marginBottom:6}}>DESCRIPTION</div>
              <p style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>{selected.description}</p>
            </div>

            <div style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'12px',marginBottom:16}}>
              <div style={{fontSize:10,color:'#4b5563',fontWeight:600,letterSpacing:'0.5px',marginBottom:6}}>ASSIGNED TEAM</div>
              <div className="flex items-center gap-2" style={{fontSize:13,color:'#e2e8f0'}}>
                <Users size={13} color="#38bdf8"/>{selected.team}
              </div>
            </div>

            <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'12px',marginBottom:16}}>
              <div style={{fontSize:11,color:'#ef4444',fontWeight:600,marginBottom:4}}>⚡ Recommended Action</div>
              <p style={{fontSize:12,color:'#fca5a5',lineHeight:1.5}}>
                {selected.priority==='HIGH'
                  ?`Immediate dispatch required. Contact ${selected.team} and mobilize backup units.`
                  :`Monitor situation. ${selected.team} responding. Await status update.`}
              </p>
            </div>

            <div className="flex gap-2">
              <button style={{flex:1,padding:'10px',borderRadius:8,background:'#ef4444',color:'#fff',fontWeight:600,fontSize:13,cursor:'pointer',border:'none'}}>Escalate</button>
              <button style={{flex:1,padding:'10px',borderRadius:8,background:'rgba(34,197,94,0.15)',color:'#22c55e',fontWeight:600,fontSize:13,cursor:'pointer',border:'1px solid rgba(34,197,94,0.3)'}}>Mark Resolved</button>
              <button onClick={()=>setSelected(null)} style={{flex:1,padding:'10px',borderRadius:8,background:'rgba(255,255,255,0.05)',color:'#94a3b8',fontWeight:600,fontSize:13,cursor:'pointer',border:'1px solid rgba(255,255,255,0.08)'}}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
