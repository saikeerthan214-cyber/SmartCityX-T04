import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, LineChart, Line } from 'recharts';
import { trafficData24h } from '../data/resources';

const zones = [
  { zone:'Zone A', status:'HIGH',     speed:18, congestion:88, incidents:5, color:'#ef4444' },
  { zone:'Zone B', status:'HIGH',     speed:21, congestion:82, incidents:4, color:'#ef4444' },
  { zone:'Zone C', status:'MODERATE', speed:32, congestion:55, incidents:2, color:'#f59e0b' },
  { zone:'Zone D', status:'MODERATE', speed:29, congestion:61, incidents:3, color:'#f59e0b' },
  { zone:'Zone E', status:'LOW',      speed:45, congestion:28, incidents:1, color:'#22c55e' },
];

export default function Traffic() {
  return (
    <div className="fade-in">
      {/* KPIs */}
      <div className="grid gap-4 mb-6" style={{gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))'}}>
        {[
          {label:'Avg Speed',       value:'29 km/h',  color:'#38bdf8'},
          {label:'Congestion',      value:'63%',       color:'#ef4444'},
          {label:'Active Incidents',value:'15',        color:'#f59e0b'},
          {label:'Signals Online',  value:'142/147',   color:'#22c55e'},
          {label:'Peak Hour',       value:'18:00–19:00',color:'#8b5cf6'},
        ].map(k=>(
          <div key={k.label} className="glass-card p-4">
            <div style={{fontSize:22,fontWeight:700,color:k.color}}>{k.value}</div>
            <div style={{fontSize:12,color:'#94a3b8',marginTop:3}}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 mb-6" style={{gridTemplateColumns:'2fr 1fr'}}>
        <div className="glass-card p-5">
          <div style={{fontWeight:600,color:'#f8fafc',marginBottom:16,fontSize:14}}>Traffic Volume – All Zones (24h)</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trafficData24h}>
              <defs>
                {['#ef4444','#f59e0b','#38bdf8','#22c55e','#8b5cf6'].map((c,i)=>(
                  <linearGradient key={i} id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="time" tick={{fill:'#4b5563',fontSize:10}} interval={3}/>
              <YAxis tick={{fill:'#4b5563',fontSize:10}}/>
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f8fafc',fontSize:12}}/>
              <Area type="monotone" dataKey="zoneA" stroke="#ef4444" fill="url(#g0)" strokeWidth={1.5} name="Zone A"/>
              <Area type="monotone" dataKey="zoneB" stroke="#f59e0b" fill="url(#g1)" strokeWidth={1.5} name="Zone B"/>
              <Area type="monotone" dataKey="zoneC" stroke="#38bdf8" fill="url(#g2)" strokeWidth={1.5} name="Zone C"/>
              <Area type="monotone" dataKey="zoneD" stroke="#22c55e" fill="url(#g3)" strokeWidth={1.5} name="Zone D"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <div style={{fontWeight:600,color:'#f8fafc',marginBottom:16,fontSize:14}}>Congestion by Zone</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={zones} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis type="number" tick={{fill:'#4b5563',fontSize:10}} domain={[0,100]}/>
              <YAxis dataKey="zone" type="category" tick={{fill:'#94a3b8',fontSize:11}} width={50}/>
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f8fafc',fontSize:12}}/>
              <Bar dataKey="congestion" radius={[0,4,4,0]} name="Congestion %"
                fill="#3b82f6" label={{position:'right',fill:'#94a3b8',fontSize:10}}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Zone Table */}
      <div className="glass-card overflow-hidden">
        <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontWeight:600,color:'#f8fafc',fontSize:14}}>
          Zone-by-Zone Traffic Status
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              {['Zone','Status','Avg Speed','Congestion','Active Incidents','Trend'].map(h=>(
                <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:11,color:'#4b5563',fontWeight:600,letterSpacing:'0.5px'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((z,i)=>(
              <tr key={z.zone} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                <td style={{padding:'14px 16px',fontWeight:600,color:'#e2e8f0',fontSize:13}}>{z.zone}</td>
                <td style={{padding:'14px 16px'}}>
                  <span className="badge" style={{background:`${z.color}15`,color:z.color}}>{z.status}</span>
                </td>
                <td style={{padding:'14px 16px',fontSize:13,color:'#94a3b8'}}>{z.speed} km/h</td>
                <td style={{padding:'14px 16px'}}>
                  <div className="flex items-center gap-2">
                    <div style={{flex:1,height:6,background:'rgba(255,255,255,0.08)',borderRadius:3,maxWidth:80}}>
                      <div style={{height:'100%',borderRadius:3,background:z.color,width:`${z.congestion}%`}}/>
                    </div>
                    <span style={{fontSize:12,color:'#94a3b8'}}>{z.congestion}%</span>
                  </div>
                </td>
                <td style={{padding:'14px 16px',fontSize:13,color:'#94a3b8'}}>{z.incidents}</td>
                <td style={{padding:'14px 16px',fontSize:12,color:z.congestion>70?'#ef4444':z.congestion>50?'#f59e0b':'#22c55e'}}>
                  {z.congestion>70?'▲ Increasing':z.congestion>50?'→ Stable':'▼ Decreasing'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
