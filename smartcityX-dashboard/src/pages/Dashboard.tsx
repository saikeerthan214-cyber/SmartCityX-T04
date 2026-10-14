import { AlertTriangle, FileText, Radio, Wrench, Droplets, Zap, MapPin, Clock } from 'lucide-react';
import KPICard from '../components/KPICard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { trafficData24h, energyData24h, waterData24h } from '../data/resources';
import { emergencies } from '../data/emergencies';
import { citizenReports } from '../data/reports';

export default function Dashboard() {
  const hour = new Date().getHours();
  const greeting = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
  const activeEmg = emergencies.filter(e=>e.status==='Active'||e.status==='Responding').length;
  const openReports = citizenReports.filter(r=>r.status!=='Resolved').length;

  const recentEmg = emergencies.filter(e=>e.status==='Active'||e.status==='Responding').slice(0,5);
  const recentReports = citizenReports.filter(r=>r.status==='Open').slice(0,5);

  const priorityColor = (p:string) => p==='HIGH'?'#ef4444':p==='MEDIUM'?'#f59e0b':'#22c55e';

  return (
    <div className="fade-in">
      {/* Greeting */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:'#f8fafc'}}>{greeting}, Administrator</h1>
          <p style={{color:'#94a3b8',fontSize:13,marginTop:4}}>Here's the current operational overview of SmartCityX.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)'}}>
          <span className="status-pulse" style={{background:'#22c55e'}}/>
          <span style={{fontSize:12,color:'#22c55e',fontWeight:600}}>System Operational</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6" style={{gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))'}}>
        <KPICard icon={<AlertTriangle size={18}/>} label="Active Emergencies" value={activeEmg}
          change="+2 from yesterday" changeType="up" status="Critical" statusColor="#ef4444" color="#ef4444"
          sparkline={[4,6,5,8,9,10,activeEmg]}/>
        <KPICard icon={<FileText size={18}/>} label="Citizen Requests" value={openReports}
          change="+12%" changeType="up" status="Active" statusColor="#f59e0b" color="#f59e0b"
          sparkline={[180,200,210,225,235,240,openReports]}/>
        <KPICard icon={<Radio size={18}/>} label="IoT Alerts" value={37}
          change="-5%" changeType="down" status="Monitoring" statusColor="#38bdf8" color="#38bdf8"
          sparkline={[45,42,40,39,38,37,37]}/>
        <KPICard icon={<Wrench size={18}/>} label="Infrastructure Issues" value={64}
          change="+8%" changeType="up" status="Attention" statusColor="#f59e0b" color="#8b5cf6"
          sparkline={[50,54,57,59,61,63,64]}/>
        <KPICard icon={<Droplets size={18}/>} label="Water Consumption" value="72%"
          status="Normal" statusColor="#22c55e" color="#06b6d4"
          sparkline={[65,68,70,71,72,72,72]}/>
        <KPICard icon={<Zap size={18}/>} label="Energy Consumption" value="81%"
          status="High" statusColor="#f59e0b" color="#eab308"
          sparkline={[70,73,76,78,79,80,81]}/>
      </div>

      {/* Charts */}
      <div className="grid gap-4 mb-6" style={{gridTemplateColumns:'2fr 1fr'}}>
        <div className="glass-card p-5">
          <div style={{fontWeight:600,color:'#f8fafc',marginBottom:16,fontSize:14}}>Traffic Volume – Last 24 Hours</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trafficData24h.slice(0,24)}>
              <defs>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/><stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="time" tick={{fill:'#4b5563',fontSize:10}} interval={3}/>
              <YAxis tick={{fill:'#4b5563',fontSize:10}}/>
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f8fafc',fontSize:12}}/>
              <Area type="monotone" dataKey="zoneA" stroke="#3b82f6" fill="url(#gA)" strokeWidth={2} name="Zone A"/>
              <Area type="monotone" dataKey="zoneB" stroke="#38bdf8" fill="url(#gB)" strokeWidth={2} name="Zone B"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <div style={{fontWeight:600,color:'#f8fafc',marginBottom:16,fontSize:14}}>Energy Load by Zone</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              {zone:'Zone A',load:87},{zone:'Zone B',load:72},{zone:'Zone C',load:65},{zone:'Zone D',load:54},{zone:'Zone E',load:44}
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="zone" tick={{fill:'#4b5563',fontSize:10}}/>
              <YAxis tick={{fill:'#4b5563',fontSize:10}}/>
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f8fafc',fontSize:12}}/>
              <Bar dataKey="load" fill="#f59e0b" radius={[4,4,0,0]} name="Load %"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4" style={{gridTemplateColumns:'1fr 1fr'}}>
        {/* Active Emergencies */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span style={{fontWeight:600,color:'#f8fafc',fontSize:14}}>Active Emergencies</span>
            <span className="badge badge-danger">{activeEmg} Active</span>
          </div>
          {recentEmg.map(e=>(
            <div key={e.id} className="flex items-center gap-3 py-2" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:priorityColor(e.priority),flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,color:'#e2e8f0',fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.type} – {e.location}</div>
                <div style={{fontSize:11,color:'#4b5563'}}>{e.team}</div>
              </div>
              <span className="badge" style={{background:`${priorityColor(e.priority)}15`,color:priorityColor(e.priority),fontSize:10}}>{e.priority}</span>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span style={{fontWeight:600,color:'#f8fafc',fontSize:14}}>Recent Reports</span>
            <span className="badge badge-warning">{openReports} Open</span>
          </div>
          {recentReports.map(r=>(
            <div key={r.id} className="flex items-center gap-3 py-2" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,color:'#e2e8f0',fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.id} – {r.issue}</div>
                <div className="flex items-center gap-1" style={{fontSize:11,color:'#4b5563',marginTop:2}}>
                  <MapPin size={10}/>{r.location}
                </div>
              </div>
              <span className={`badge ${r.priority==='High'?'badge-danger':r.priority==='Medium'?'badge-warning':'badge-success'}`}>{r.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
