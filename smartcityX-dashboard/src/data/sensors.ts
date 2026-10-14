export interface Sensor {
  id: string; name: string; type: 'Temperature'|'Water Pressure'|'Water Flow'|'Energy Load'|'Air Quality'|'Traffic Density'|'Humidity'|'Noise Level';
  location: string; zone: string; value: number; unit: string;
  status: 'Normal'|'Warning'|'Critical'|'Offline';
  lastUpdate: string; trend: 'up'|'down'|'stable'; history: number[];
}

export const sensors: Sensor[] = [
  { id:'SNS-001', name:'Temp Monitor Alpha',   type:'Temperature',    location:'Sector 12, Zone A',      zone:'Zone A', value:34.2, unit:'°C',    status:'Warning',  lastUpdate:'8 sec ago',  trend:'up',     history:[30,31,32,33,34,34.2] },
  { id:'SNS-002', name:'Water Press P-1',      type:'Water Pressure', location:'Central Reservoir',       zone:'Zone A', value:42,   unit:'PSI',   status:'Normal',   lastUpdate:'12 sec ago', trend:'stable', history:[41,42,42,43,42,42] },
  { id:'SNS-003', name:'Flow Meter F-3',       type:'Water Flow',     location:'Zone B Pipeline',         zone:'Zone B', value:128,  unit:'L/min', status:'Normal',   lastUpdate:'5 sec ago',  trend:'up',     history:[120,122,124,126,127,128] },
  { id:'SNS-004', name:'Grid Load G-1',        type:'Energy Load',    location:'Zone A Substation',       zone:'Zone A', value:87,   unit:'%',     status:'Warning',  lastUpdate:'3 sec ago',  trend:'up',     history:[75,78,81,84,85,87] },
  { id:'SNS-005', name:'Air Quality AQ-2',     type:'Air Quality',    location:'Industrial Zone B',       zone:'Zone B', value:142,  unit:'AQI',   status:'Warning',  lastUpdate:'20 sec ago', trend:'up',     history:[110,118,125,133,138,142] },
  { id:'SNS-006', name:'Traffic Cam T-7',      type:'Traffic Density',location:'Junction 4, Zone B',      zone:'Zone B', value:92,   unit:'%',     status:'Critical', lastUpdate:'2 sec ago',  trend:'up',     history:[60,68,75,82,88,92] },
  { id:'SNS-007', name:'Humidity H-4',         type:'Humidity',       location:'Zone C Reservoir Area',   zone:'Zone C', value:78,   unit:'%',     status:'Normal',   lastUpdate:'15 sec ago', trend:'stable', history:[75,76,77,78,78,78] },
  { id:'SNS-008', name:'Noise Monitor N-2',    type:'Noise Level',    location:'Zone E Construction',     zone:'Zone E', value:89,   unit:'dB',    status:'Warning',  lastUpdate:'10 sec ago', trend:'up',     history:[72,75,79,83,86,89] },
  { id:'SNS-009', name:'Water Press P-4',      type:'Water Pressure', location:'Zone D Pump Station',     zone:'Zone D', value:0,    unit:'PSI',   status:'Offline',  lastUpdate:'8 min ago',  trend:'down',   history:[40,35,28,18,8,0] },
  { id:'SNS-010', name:'Flow Meter F-7',       type:'Water Flow',     location:'Sector 9, Zone C',        zone:'Zone C', value:45,   unit:'L/min', status:'Warning',  lastUpdate:'6 sec ago',  trend:'down',   history:[98,85,72,60,52,45] },
  { id:'SNS-011', name:'Grid Load G-3',        type:'Energy Load',    location:'Zone C Substation',       zone:'Zone C', value:65,   unit:'%',     status:'Normal',   lastUpdate:'4 sec ago',  trend:'stable', history:[63,64,65,65,65,65] },
  { id:'SNS-012', name:'Temp Monitor Beta',    type:'Temperature',    location:'Metro Station, Zone A',   zone:'Zone A', value:48.5, unit:'°C',    status:'Critical', lastUpdate:'1 sec ago',  trend:'up',     history:[32,36,40,44,46,48.5] },
  { id:'SNS-013', name:'Traffic Cam T-9',      type:'Traffic Density',location:'Highway 7, Zone D',       zone:'Zone D', value:78,   unit:'%',     status:'Warning',  lastUpdate:'2 sec ago',  trend:'up',     history:[55,62,67,72,75,78] },
  { id:'SNS-014', name:'Air Quality AQ-5',     type:'Air Quality',    location:'Zone A City Center',      zone:'Zone A', value:68,   unit:'AQI',   status:'Normal',   lastUpdate:'25 sec ago', trend:'stable', history:[65,66,67,68,68,68] },
  { id:'SNS-015', name:'Water Press P-7',      type:'Water Pressure', location:'Sector 10, Zone C',       zone:'Zone C', value:12,   unit:'PSI',   status:'Critical', lastUpdate:'7 sec ago',  trend:'down',   history:[40,32,24,18,14,12] },
  { id:'SNS-016', name:'Flow Meter F-2',       type:'Water Flow',     location:'Zone A Distribution',     zone:'Zone A', value:210,  unit:'L/min', status:'Normal',   lastUpdate:'8 sec ago',  trend:'stable', history:[205,208,209,210,210,210] },
  { id:'SNS-017', name:'Grid Load G-5',        type:'Energy Load',    location:'Zone E Substation',       zone:'Zone E', value:44,   unit:'%',     status:'Normal',   lastUpdate:'5 sec ago',  trend:'down',   history:[52,50,48,47,45,44] },
  { id:'SNS-018', name:'Humidity H-8',         type:'Humidity',       location:'Zone D Low Area',         zone:'Zone D', value:95,   unit:'%',     status:'Critical', lastUpdate:'3 sec ago',  trend:'up',     history:[72,78,84,89,92,95] },
  { id:'SNS-019', name:'Noise Monitor N-5',    type:'Noise Level',    location:'Zone B Industrial',       zone:'Zone B', value:96,   unit:'dB',    status:'Critical', lastUpdate:'9 sec ago',  trend:'up',     history:[80,84,88,91,94,96] },
  { id:'SNS-020', name:'Traffic Cam T-3',      type:'Traffic Density',location:'Main Road, Zone A',       zone:'Zone A', value:55,   unit:'%',     status:'Normal',   lastUpdate:'2 sec ago',  trend:'stable', history:[50,52,53,55,55,55] },
];

export const generate24h = (base: number, variance: number): {time:string, value:number}[] =>
  Array.from({length:24}, (_,i) => ({
    time: `${String(i).padStart(2,'0')}:00`,
    value: Math.max(0, Math.round(base + (Math.sin(i/3)*variance) + (Math.random()-0.5)*variance*0.5))
  }));
