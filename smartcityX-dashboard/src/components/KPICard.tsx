import { TrendingUp, TrendingDown } from 'lucide-react';
import { ReactNode } from 'react';

interface Props {
  icon: ReactNode; label: string; value: string|number;
  change?: string; changeType?: 'up'|'down'|'neutral';
  status?: string; statusColor?: string; color?: string;
  sparkline?: number[];
}

export default function KPICard({ icon, label, value, change, changeType, status, statusColor='#22c55e', color='#3b82f6', sparkline }: Props) {
  const maxS = sparkline ? Math.max(...sparkline) : 1;
  return (
    <div className="glass-card p-5 fade-in" style={{cursor:'default'}}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center justify-center rounded-xl" style={{width:40,height:40,background:`${color}20`}}>
          <span style={{color}}>{icon}</span>
        </div>
        {change && (
          <div className="flex items-center gap-1" style={{color:changeType==='up'?'#22c55e':changeType==='down'?'#ef4444':'#94a3b8',fontSize:12,fontWeight:600}}>
            {changeType==='up'?<TrendingUp size={13}/>:changeType==='down'?<TrendingDown size={13}/>:null}
            {change}
          </div>
        )}
      </div>
      <div style={{fontSize:26,fontWeight:700,color:'#f8fafc',lineHeight:1}}>{value}</div>
      <div style={{fontSize:12,color:'#94a3b8',marginTop:4}}>{label}</div>
      {status && (
        <div className="flex items-center gap-2 mt-3">
          <span className="status-pulse" style={{background:statusColor}}/>
          <span style={{fontSize:11,color:statusColor,fontWeight:600}}>{status}</span>
        </div>
      )}
      {sparkline && (
        <div className="flex items-end gap-0.5 mt-3" style={{height:28}}>
          {sparkline.map((v,i)=>(
            <div key={i} style={{flex:1,background:`${color}40`,borderRadius:2,height:`${(v/maxS)*100}%`,minHeight:2,transition:'height 0.3s'}}/>
          ))}
        </div>
      )}
    </div>
  );
}
