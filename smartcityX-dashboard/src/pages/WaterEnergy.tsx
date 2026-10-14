import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { waterData24h, energyData24h } from '../data/resources';

const waterZones = [
  { zone:'Zone A', consumption:85, pressure:42, status:'Normal',  color:'#22c55e' },
  { zone:'Zone B', consumption:72, pressure:38, status:'Normal',  color:'#22c55e' },
  { zone:'Zone C', consumption:94, pressure:12, status:'Warning', color:'#f59e0b' },
  { zone:'Zone D', consumption:31, pressure:0,  status:'Offline', color:'#ef4444' },
  { zone:'Zone E', consumption:60, pressure:40, status:'Normal',  color:'#22c55e' },
];

const energyZones = [
  { zone:'Zone A', load:87, demand:90, status:'High',    color:'#f59e0b' },
  { zone:'Zone B', load:72, demand:75, status:'Normal',  color:'#22c55e' },
  { zone:'Zone C', load:65, demand:68, status:'Normal',  color:'#22c55e' },
  { zone:'Zone D', load:54, demand:56, status:'Normal',  color:'#22c55e' },
  { zone:'Zone E', load:44, demand:45, status:'Low',     color:'#38bdf8' },
];

export default function WaterEnergy() {
  return (
    <div className="fade-in">
      {/* Alerts */}
      <div className="flex flex-col gap-2 mb-6">
        {[
          { icon:'⚠', color:'#f59e0b', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.2)', text:'High water consumption detected in Zone C – pressure dropping critically' },
          { icon:'⚡', color:'#ef4444', bg:'rgba(239,68,68,0.08)',   border:'rgba(239,68,68,0.2)',  text:'Energy demand approaching peak capacity in Zone A substation – load at 87%' },
          { icon:'🔴', color:'#ef4444', bg:'rgba(239,68,68,0.08)',   border:'rgba(239,68,68,0.2)',  text:'Zone D pump station P-4 offline – water supply affected in Sector 15–20' },
        ].map((a,i)=>(
          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{background:a.bg,border:`1px solid ${a.border}`}}>
            <span>{a.icon}</span>
            <span style={{fontSize:13,color:a.color}}>{a.text}</span>
          </div>
        ))}
      </div>

      {/* WATER Section */}
      <div style={{fontWeight:700,color:'#38bdf8',fontSize:15,marginBottom:16,letterSpacing:'0.3px'}}>💧 Water Resources</div>
      <div className="grid gap-4 mb-6" style={{gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))'}}>
        {[
          {label:'Total Consumption', value:'3,840 KL/hr', color:'#38bdf8'},
          {label:'Reservoir Level',   value:'68%',          color:'#22c55e'},
          {label:'Avg Pressure',      value:'32 PSI',       color:'#38bdf8'},
          {label:'Active Leaks',      value:'3',            color:'#ef4444'},
          {label:'Pump Stations',     value:'11/12',        color:'#f59e0b'},
        ].map(k=>(
          <div key={k.label} className="glass-card p-4">
            <div style={{fontSize:20,fontWeight:700,color:k.color}}>{k.value}</div>
            <div style={{fontSize:11,color:'#94a3b8',marginTop:3}}>{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 mb-8" style={{gridTemplateColumns:'2fr 1fr'}}>
        <div className="glass-card p-5">
          <div style={{fontWeight:600,color:'#f8fafc',marginBottom:16,fontSize:14}}>Water Consumption – 24 Hours</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={waterData24h}>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/><stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="time" tick={{fill:'#4b5563',fontSize:10}} interval={3}/>
              <YAxis tick={{fill:'#4b5563',fontSize:10}}/>
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f8fafc',fontSize:12}}/>
              <Area type="monotone" dataKey="consumption" stroke="#38bdf8" fill="url(#wg)" strokeWidth={2} name="KL/hr"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <div style={{fontWeight:600,color:'#f8fafc',marginBottom:16,fontSize:14}}>Zone Consumption</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={waterZones}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="zone" tick={{fill:'#4b5563',fontSize:10}}/>
              <YAxis tick={{fill:'#4b5563',fontSize:10}}/>
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f8fafc',fontSize:12}}/>
              <Bar dataKey="consumption" fill="#38bdf8" radius={[4,4,0,0]} name="%"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ENERGY Section */}
      <div style={{fontWeight:700,color:'#f59e0b',fontSize:15,marginBottom:16,letterSpacing:'0.3px'}}>⚡ Energy Resources</div>
      <div className="grid gap-4 mb-6" style={{gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))'}}>
        {[
          {label:'Total Load',     value:'324 MW',   color:'#f59e0b'},
          {label:'Peak Demand',    value:'380 MW',   color:'#ef4444'},
          {label:'Grid Status',    value:'Stable',   color:'#22c55e'},
          {label:'Energy Alerts',  value:'4',        color:'#f59e0b'},
          {label:'Substations',    value:'18/20',    color:'#22c55e'},
        ].map(k=>(
          <div key={k.label} className="glass-card p-4">
            <div style={{fontSize:20,fontWeight:700,color:k.color}}>{k.value}</div>
            <div style={{fontSize:11,color:'#94a3b8',marginTop:3}}>{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 mb-6" style={{gridTemplateColumns:'2fr 1fr'}}>
        <div className="glass-card p-5">
          <div style={{fontWeight:600,color:'#f8fafc',marginBottom:16,fontSize:14}}>Energy Load vs Demand – 24 Hours</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={energyData24h}>
              <defs>
                <linearGradient id="eg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                <linearGradient id="eg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="time" tick={{fill:'#4b5563',fontSize:10}} interval={3}/>
              <YAxis tick={{fill:'#4b5563',fontSize:10}}/>
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f8fafc',fontSize:12}}/>
              <Area type="monotone" dataKey="load" stroke="#f59e0b" fill="url(#eg1)" strokeWidth={2} name="Load %"/>
              <Area type="monotone" dataKey="demand" stroke="#ef4444" fill="url(#eg2)" strokeWidth={2} name="Demand %"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <div style={{fontWeight:600,color:'#f8fafc',marginBottom:12,fontSize:14}}>Zone Energy Status</div>
          {energyZones.map(z=>(
            <div key={z.zone} className="flex items-center gap-3 py-2" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <span style={{fontSize:12,color:'#94a3b8',width:50}}>{z.zone}</span>
              <div style={{flex:1,height:6,background:'rgba(255,255,255,0.08)',borderRadius:3}}>
                <div style={{height:'100%',borderRadius:3,background:z.color,width:`${z.load}%`,transition:'width 0.5s'}}/>
              </div>
              <span style={{fontSize:11,color:z.color,fontWeight:600,width:30}}>{z.load}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
