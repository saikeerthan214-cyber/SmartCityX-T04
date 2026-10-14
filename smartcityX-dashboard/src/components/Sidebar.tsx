import { LayoutDashboard, Car, Droplets, AlertTriangle, FileText, FolderOpen, Cpu, Boxes, BarChart3, Settings, Radio, Shield } from 'lucide-react';

const navItems = [
  { id:'dashboard',   label:'Dashboard',         icon:LayoutDashboard },
  { id:'traffic',     label:'Traffic',            icon:Car },
  { id:'water',       label:'Water & Energy',     icon:Droplets },
  { id:'emergency',   label:'Emergency',          icon:AlertTriangle },
  { id:'reports',     label:'Citizen Reports',    icon:FileText },
  { id:'documents',   label:'Documents',          icon:FolderOpen },
  { id:'iot',         label:'IoT Sensors',        icon:Radio },
  { id:'resources',   label:'Resource Allocation',icon:Boxes },
  { id:'dsa',         label:'DSA Analytics',      icon:BarChart3 },
  { id:'search',      label:'Smart Search',       icon:Cpu },
];

interface Props { active: string; onNavigate: (page:string)=>void; mobileOpen: boolean; onClose:()=>void; }

export default function Sidebar({ active, onNavigate, mobileOpen, onClose }: Props) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={onClose}/>}
      <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300
        ${mobileOpen?'translate-x-0':'-translate-x-full'} md:translate-x-0`}
        style={{width:240,background:'#0d1628',borderRight:'1px solid rgba(255,255,255,0.06)'}}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div className="flex items-center justify-center rounded-xl" style={{width:36,height:36,background:'linear-gradient(135deg,#3b82f6,#38bdf8)'}}>
            <Shield size={18} color="#fff"/>
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:'#f8fafc',letterSpacing:'0.3px'}}>SmartCityX</div>
            <div style={{fontSize:10,color:'#38bdf8',fontWeight:600,letterSpacing:'0.8px'}}>COMMAND CENTER</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto" style={{gap:2,display:'flex',flexDirection:'column'}}>
          <div style={{fontSize:10,color:'#4b5563',fontWeight:600,letterSpacing:'1px',padding:'8px 14px 6px'}}>NAVIGATION</div>
          {navItems.map(({id,label,icon:Icon})=>(
            <button key={id} className={`sidebar-link w-full text-left ${active===id?'active':''}`}
              onClick={()=>{ onNavigate(id); onClose(); }}>
              <Icon size={16}/> {label}
            </button>
          ))}
          <div style={{paddingTop:16,borderTop:'1px solid rgba(255,255,255,0.06)',marginTop:12}}>
            <button className={`sidebar-link w-full text-left ${active==='settings'?'active':''}`} onClick={()=>{onNavigate('settings');onClose();}}>
              <Settings size={16}/> Settings
            </button>
          </div>
        </nav>

        {/* Status */}
        <div className="px-4 py-4" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <div className="flex items-center gap-2">
            <span className="status-pulse" style={{background:'#22c55e'}}/>
            <span style={{fontSize:11,color:'#94a3b8'}}>System Operational</span>
          </div>
          <div style={{fontSize:10,color:'#4b5563',marginTop:4}}>All services running</div>
        </div>
      </aside>
    </>
  );
}
