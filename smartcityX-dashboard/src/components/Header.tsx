import { useState } from 'react';
import { Bell, Menu, Search, X, CheckCheck } from 'lucide-react';

const notifications = [
  { id:1, color:'#ef4444', text:'Emergency reported in Zone A – Metro Station fire', time:'2 min ago',  read:false },
  { id:2, color:'#f59e0b', text:'High energy usage detected in Zone B substation',  time:'8 min ago',  read:false },
  { id:3, color:'#3b82f6', text:'New citizen request CR-1071 received',              time:'12 min ago', read:false },
  { id:4, color:'#ef4444', text:'Gas leak suspected in Sector 3 Zone A',             time:'18 min ago', read:false },
  { id:5, color:'#22c55e', text:'EMG-009 resolved – patient transported safely',     time:'25 min ago', read:true  },
  { id:6, color:'#f59e0b', text:'IoT Sensor SNS-012 showing critical temperature',   time:'31 min ago', read:true  },
];

interface Props { page: string; onMenuClick: ()=>void; onSearch:(q:string)=>void; }

export default function Header({ page, onMenuClick, onSearch }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notes, setNotes] = useState(notifications);
  const [searchVal, setSearchVal] = useState('');
  const unread = notes.filter(n=>!n.read).length;

  const pageTitle: Record<string,string> = {
    dashboard:'Dashboard', traffic:'Traffic Analytics', water:'Water & Energy',
    emergency:'Emergency Management', reports:'Citizen Reports', documents:'City Documents',
    iot:'IoT Sensors', resources:'Resource Allocation', dsa:'DSA Analytics',
    search:'Smart Search Engine', settings:'Settings',
    flow:'Network Flow — M4 (CO4)',
    npc:'NP-Completeness — M5 (CO5)',
    randomized:'Randomized & Parallel — M6 (CO6)',
  };

  return (
    <header className="fixed top-0 right-0 z-20 flex items-center gap-3 px-5"
      style={{left:240,height:60,background:'#0d1628',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>

      <button className="md:hidden" onClick={onMenuClick} style={{color:'#94a3b8'}}>
        <Menu size={20}/>
      </button>

      <div style={{flex:1,fontWeight:600,color:'#f8fafc',fontSize:15}}>{pageTitle[page]||page}</div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 px-3" style={{background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,height:36,minWidth:240}}>
        <Search size={14} style={{color:'#4b5563'}}/>
        <input value={searchVal} onChange={e=>{setSearchVal(e.target.value);onSearch(e.target.value);}}
          placeholder="Search city data..."
          style={{background:'transparent',border:'none',outline:'none',color:'#f8fafc',fontSize:13,width:'100%'}}/>
        {searchVal&&<button onClick={()=>{setSearchVal('');onSearch('');}}><X size={12} style={{color:'#4b5563'}}/></button>}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button onClick={()=>setNotifOpen(!notifOpen)} style={{position:'relative',padding:8,borderRadius:10,background:'#111827',border:'1px solid rgba(255,255,255,0.08)',color:'#94a3b8',cursor:'pointer',display:'flex'}}>
          <Bell size={16}/>
          {unread>0&&<span style={{position:'absolute',top:4,right:4,width:8,height:8,borderRadius:'50%',background:'#ef4444'}}/>}
        </button>

        {notifOpen&&(
          <div className="absolute right-0 fade-in" style={{top:44,width:340,background:'#111827',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,overflow:'hidden',zIndex:100}}>
            <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              <span style={{fontWeight:600,color:'#f8fafc',fontSize:13}}>Notifications</span>
              <button onClick={()=>setNotes(n=>n.map(x=>({...x,read:true})))} style={{fontSize:11,color:'#38bdf8',cursor:'pointer',display:'flex',alignItems:'center',gap:4}}>
                <CheckCheck size={12}/> Mark all read
              </button>
            </div>
            {notes.map(n=>(
              <div key={n.id} onClick={()=>setNotes(ns=>ns.map(x=>x.id===n.id?{...x,read:true}:x))}
                className="flex items-start gap-3 px-4 py-3 cursor-pointer"
                style={{borderBottom:'1px solid rgba(255,255,255,0.04)',background:n.read?'transparent':'rgba(59,130,246,0.04)',transition:'background 0.2s'}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:n.color,marginTop:5,flexShrink:0}}/>
                <div>
                  <div style={{fontSize:12,color:n.read?'#64748b':'#e2e8f0',lineHeight:1.4}}>{n.text}</div>
                  <div style={{fontSize:10,color:'#4b5563',marginTop:3}}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin */}
      <div className="flex items-center gap-2" style={{padding:'6px 12px',background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10}}>
        <div style={{width:24,height:24,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#38bdf8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff'}}>A</div>
        <span style={{fontSize:12,color:'#94a3b8',display:'none'}} className="md:block">Admin</span>
      </div>
    </header>
  );
}
