import { useState } from 'react';
import { sensors } from '../data/sensors';

const statusColor: Record<string,string> = { Normal:'#22c55e', Warning:'#f59e0b', Critical:'#ef4444', Offline:'#4b5563' };
const typeIcon: Record<string,string> = {
  'Temperature':'🌡️','Water Pressure':'💧','Water Flow':'🚿','Energy Load':'⚡',
  'Air Quality':'💨','Traffic Density':'🚗','Humidity':'💦','Noise Level':'🔊'
};

export default function IoTSensors() {
  const [filter, setFilter] = useState('All');
  const types = ['All','Normal','Warning','Critical','Offline'];
  const filtered = filter==='All' ? sensors : sensors.filter(s=>s.status===filter);

  return (
    <div className="fade-in">
      {/* Status summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {label:'Normal',  value:sensors.filter(s=>s.status==='Normal').length,   color:'#22c55e'},
          {label:'Warning', value:sensors.filter(s=>s.status==='Warning').length,  color:'#f59e0b'},
          {label:'Critical',value:sensors.filter(s=>s.status==='Critical').length, color:'#ef4444'},
          {label:'Offline', value:sensors.filter(s=>s.status==='Offline').length,  color:'#4b5563'},
        ].map(s=>(
          <div key={s.label} className="glass-card p-4 text-center">
            <div style={{fontSize:28,fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{fontSize:12,color:'#94a3b8',marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {types.map(t=>(
          <button key={t} onClick={()=>setFilter(t)}
            style={{padding:'6px 14px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',
              background:filter===t?statusColor[t]||'#3b82f6':'rgba(255,255,255,0.04)',
              color:filter===t?'#fff':'#94a3b8',
              border:`1px solid ${filter===t?statusColor[t]||'#3b82f6':'rgba(255,255,255,0.06)'}`,
              transition:'all 0.15s'}}>
            {t}
          </button>
        ))}
      </div>

      {/* Sensor Cards */}
      <div className="grid gap-4 mb-6" style={{gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))'}}>
        {filtered.map(s=>(
          <div key={s.id} className="glass-card p-4" style={{borderTop:`2px solid ${statusColor[s.status]}`}}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span style={{fontSize:20}}>{typeIcon[s.type]||'📡'}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0'}}>{s.name}</div>
                  <div style={{fontSize:10,color:'#4b5563'}}>{s.id}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="status-pulse" style={{background:statusColor[s.status]}}/>
                <span style={{fontSize:11,color:statusColor[s.status],fontWeight:600}}>{s.status}</span>
              </div>
            </div>

            <div className="flex items-end justify-between mb-3">
              <div>
                <div style={{fontSize:28,fontWeight:700,color:statusColor[s.status],lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:11,color:'#4b5563'}}>{s.unit}</div>
              </div>
              {/* Mini sparkline */}
              <div className="flex items-end gap-0.5" style={{height:32}}>
                {s.history.map((v,i)=>{
                  const max = Math.max(...s.history)||1;
                  return <div key={i} style={{width:8,borderRadius:2,background:`${statusColor[s.status]}60`,height:`${(v/max)*100}%`,minHeight:2}}/>;
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span style={{fontSize:11,color:'#4b5563'}}>{s.location}</span>
              <span style={{fontSize:10,color:'#4b5563'}}>Updated {s.lastUpdate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Table */}
      <div className="glass-card overflow-hidden">
        <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontWeight:600,color:'#f8fafc',fontSize:14}}>
          All Sensors – Detailed View
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                {['Sensor ID','Name','Type','Location','Value','Status','Last Updated'].map(h=>(
                  <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:11,color:'#4b5563',fontWeight:600,letterSpacing:'0.5px',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensors.map((s,i)=>(
                <tr key={s.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                  <td style={{padding:'11px 16px',fontSize:12,color:'#38bdf8',fontWeight:600}}>{s.id}</td>
                  <td style={{padding:'11px 16px',fontSize:12,color:'#e2e8f0'}}>{s.name}</td>
                  <td style={{padding:'11px 16px',fontSize:12,color:'#94a3b8'}}>{typeIcon[s.type]} {s.type}</td>
                  <td style={{padding:'11px 16px',fontSize:12,color:'#94a3b8'}}>{s.location}</td>
                  <td style={{padding:'11px 16px',fontSize:13,fontWeight:700,color:statusColor[s.status]}}>{s.value} {s.unit}</td>
                  <td style={{padding:'11px 16px'}}>
                    <div className="flex items-center gap-1.5">
                      <span className="status-pulse" style={{background:statusColor[s.status]}}/>
                      <span style={{fontSize:12,color:statusColor[s.status],fontWeight:500}}>{s.status}</span>
                    </div>
                  </td>
                  <td style={{padding:'11px 16px',fontSize:12,color:'#4b5563'}}>{s.lastUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
