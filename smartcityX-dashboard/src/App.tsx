import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Traffic from './pages/Traffic';
import WaterEnergy from './pages/WaterEnergy';
import EmergencyPage from './pages/Emergency';
import CitizenReports from './pages/CitizenReports';
import Documents from './pages/Documents';
import IoTSensors from './pages/IoTSensors';
import Resources from './pages/Resources';
import DSAAnalytics from './pages/DSAAnalytics';
import SmartSearch from './pages/SmartSearch';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'traffic':   return <Traffic />;
      case 'water':     return <WaterEnergy />;
      case 'emergency': return <EmergencyPage />;
      case 'reports':   return <CitizenReports />;
      case 'documents': return <Documents />;
      case 'iot':       return <IoTSensors />;
      case 'resources': return <Resources />;
      case 'dsa':       return <DSAAnalytics />;
      case 'search':    return <SmartSearch />;
      case 'settings':  return (
        <div className="fade-in glass-card p-8 text-center">
          <div style={{fontSize:18,color:'#f8fafc',fontWeight:600,marginBottom:8}}>Settings</div>
          <div style={{color:'#94a3b8',fontSize:13}}>System configuration and preferences panel — coming soon.</div>
        </div>
      );
      default: return <Dashboard />;
    }
  };

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg-primary)'}}>
      <Sidebar active={page} onNavigate={setPage} mobileOpen={mobileOpen} onClose={()=>setMobileOpen(false)}/>
      <div style={{marginLeft:240,flex:1,display:'flex',flexDirection:'column',minWidth:0}} className="md-main">
        <Header page={page} onMenuClick={()=>setMobileOpen(true)} onSearch={()=>{}}/>
        <main style={{padding:'80px 28px 28px',flex:1}}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
