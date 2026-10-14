export interface CityResource {
  id: string; name: string; type: string; cost: number;
  available: number; total: number; location: string;
  priority: number; serviceValue: number; icon: string;
}

export const cityResources: CityResource[] = [
  { id:'RES-001', name:'Fire Truck',       type:'Emergency',      cost:25000, available:4,  total:6,  location:'Fire Station Zone A', priority:1, serviceValue:90, icon:'🚒' },
  { id:'RES-002', name:'Ambulance',        type:'Medical',        cost:20000, available:6,  total:8,  location:'City Hospital',       priority:1, serviceValue:95, icon:'🚑' },
  { id:'RES-003', name:'Police Vehicle',   type:'Security',       cost:12000, available:10, total:12, location:'Police HQ Zone B',    priority:2, serviceValue:75, icon:'🚓' },
  { id:'RES-004', name:'Rescue Team',      type:'Emergency',      cost:18000, available:3,  total:4,  location:'Rescue Station',      priority:1, serviceValue:85, icon:'🦺' },
  { id:'RES-005', name:'Water Tanker',     type:'Water',          cost:15000, available:5,  total:7,  location:'Water Authority',     priority:2, serviceValue:70, icon:'🚰' },
  { id:'RES-006', name:'Repair Crew',      type:'Infrastructure', cost:8000,  available:8,  total:10, location:'Municipal Depot',     priority:3, serviceValue:60, icon:'🔧' },
  { id:'RES-007', name:'HazMat Unit',      type:'Emergency',      cost:30000, available:2,  total:3,  location:'Industrial Zone B',   priority:1, serviceValue:88, icon:'☣️' },
  { id:'RES-008', name:'Electric Unit',    type:'Energy',         cost:14000, available:4,  total:5,  location:'Power Substation',    priority:2, serviceValue:72, icon:'⚡' },
];

export const trafficData24h = Array.from({length:24},(_,i)=>({
  time:`${String(i).padStart(2,'0')}:00`,
  zoneA: Math.round(30+Math.sin(i/3.5)*20+Math.random()*10),
  zoneB: Math.round(35+Math.sin((i+1)/3.5)*22+Math.random()*10),
  zoneC: Math.round(25+Math.sin((i+2)/3.5)*18+Math.random()*8),
  zoneD: Math.round(20+Math.sin((i+3)/3.5)*15+Math.random()*8),
}));

export const waterData24h = Array.from({length:24},(_,i)=>({
  time:`${String(i).padStart(2,'0')}:00`,
  consumption: Math.round(400+Math.sin(i/4)*120+Math.random()*40),
  pressure: Math.round(40+Math.sin(i/6)*8+Math.random()*3),
}));

export const energyData24h = Array.from({length:24},(_,i)=>({
  time:`${String(i).padStart(2,'0')}:00`,
  load: Math.round(55+Math.sin(i/4)*25+Math.random()*10),
  demand: Math.round(60+Math.sin(i/4)*22+Math.random()*8),
}));
