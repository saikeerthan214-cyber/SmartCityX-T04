const algorithms = [
  { name:'KMP',                module:'M1',  co:'CO1', purpose:'Fast pattern matching',            app:'Citizen report keyword search',   status:'Active', searches:1284, color:'#3b82f6', complexity:'O(N+M)',    space:'O(M)' },
  { name:'Rabin-Karp',         module:'M1',  co:'CO1', purpose:'Rolling hash search',              app:'Infrastructure identifier search', status:'Active', searches:892,  color:'#38bdf8', complexity:'O(N+M) avg',space:'O(1)' },
  { name:'Z-Function',         module:'M1',  co:'CO1', purpose:'Repeated pattern detection',       app:'City report duplicate detection',  status:'Active', searches:445,  color:'#06b6d4', complexity:'O(N+M)',    space:'O(N+M)' },
  { name:'Aho-Corasick',       module:'M1',  co:'CO1', purpose:'Multi-keyword detection',          app:'Emergency keyword alerting',       status:'Active', searches:2130, color:'#ef4444', complexity:'O(N+M+Z)', space:'O(M×Σ)' },
  { name:'Suffix Array',       module:'M2',  co:'CO2', purpose:'Document substring indexing',      app:'City document search engine',      status:'Active', searches:678,  color:'#8b5cf6', complexity:'O(N log N)',space:'O(N)' },
  { name:'SA-IS',              module:'M2',  co:'CO2', purpose:'Linear suffix array build',         app:'Large infrastructure doc indexing', status:'Active', searches:234,  color:'#a78bfa', complexity:'O(N)',       space:'O(N)' },
  { name:'LCP / Kasai',        module:'M2',  co:'CO2', purpose:'Document similarity measure',      app:'Report & document similarity',     status:'Active', searches:567,  color:'#7c3aed', complexity:'O(N)',       space:'O(N)' },
  { name:'Suffix Automaton',   module:'M2',  co:'CO2', purpose:'Substring existence queries',      app:'City data substring queries',      status:'Active', searches:312,  color:'#6d28d9', complexity:'O(N)',       space:'O(N)' },
  { name:'Levenshtein',        module:'M3',  co:'CO3', purpose:'Edit distance calculation',         app:'Citizen query autocorrection',     status:'Active', searches:3421, color:'#f59e0b', complexity:'O(N×M)',    space:'O(N×M)' },
  { name:'Damerau-Levenshtein',module:'M3',  co:'CO3', purpose:'Transposition-aware edit distance', app:'Smart search spelling correction', status:'Active', searches:2891, color:'#fb923c', complexity:'O(N×M)',    space:'O(N×M)' },
  { name:'Bitmask DP',         module:'M3',  co:'CO3', purpose:'Subset combination optimization',  app:'Emergency resource allocation',    status:'Active', searches:189,  color:'#22c55e', complexity:'O(2ᴺ × N)', space:'O(2ᴺ)' },
  { name:'Subset / SOS DP',    module:'M3',  co:'CO3', purpose:'Sum over subsets aggregation',     app:'IoT sensor zone aggregation',      status:'Active', searches:143,  color:'#16a34a', complexity:'O(N × 2ᴺ)', space:'O(2ᴺ)' },
  { name:'Matrix-Chain DP',    module:'M3',  co:'CO3', purpose:'Optimal operation sequencing',      app:'Analytics pipeline optimization',  status:'Active', searches:87,   color:'#4ade80', complexity:'O(N³)',      space:'O(N²)' },
];

const moduleColors: Record<string,string> = { M1:'#3b82f6', M2:'#8b5cf6', M3:'#22c55e' };
const moduleLabels: Record<string,string> = { M1:'String Algorithms', M2:'Suffix Structures', M3:'Advanced DP' };

export default function DSAAnalytics() {
  const totalSearches = algorithms.reduce((s,a)=>s+a.searches,0);

  return (
    <div className="fade-in">
      {/* Module overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {['M1','M2','M3'].map(m=>(
          <div key={m} className="glass-card p-5" style={{borderTop:`2px solid ${moduleColors[m]}`}}>
            <div style={{fontSize:11,fontWeight:700,color:moduleColors[m],letterSpacing:'1px',marginBottom:6}}>{m} — {moduleLabels[m]}</div>
            <div style={{fontSize:28,fontWeight:700,color:'#f8fafc'}}>{algorithms.filter(a=>a.module===m).length}</div>
            <div style={{fontSize:12,color:'#94a3b8',marginTop:2}}>Algorithms active</div>
            <div style={{fontSize:12,color:moduleColors[m],marginTop:4,fontWeight:600}}>
              {algorithms.filter(a=>a.module===m).reduce((s,a)=>s+a.searches,0).toLocaleString()} searches today
            </div>
          </div>
        ))}
      </div>

      {/* Algorithm Cards */}
      {['M1','M2','M3'].map(m=>(
        <div key={m} className="mb-6">
          <div style={{fontSize:13,fontWeight:700,color:moduleColors[m],marginBottom:12,letterSpacing:'0.5px',
            paddingLeft:12,borderLeft:`3px solid ${moduleColors[m]}`}}>
            {m} — {moduleLabels[m]}
          </div>
          <div className="grid gap-4" style={{gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))'}}>
            {algorithms.filter(a=>a.module===m).map(a=>(
              <div key={a.name} className="glass-card p-4" style={{borderTop:`2px solid ${a.color}`}}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:'#f8fafc'}}>{a.name}</div>
                    <div style={{fontSize:11,color:'#4b5563',marginTop:2}}>{a.co}</div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)'}}>
                    <span className="status-pulse" style={{background:'#22c55e'}}/>
                    <span style={{fontSize:10,color:'#22c55e',fontWeight:600}}>Active</span>
                  </div>
                </div>

                <div style={{fontSize:12,color:'#94a3b8',marginBottom:8,lineHeight:1.5}}>
                  <span style={{color:'#e2e8f0',fontWeight:500}}>{a.purpose}</span>
                </div>

                <div style={{background:'rgba(255,255,255,0.03)',borderRadius:6,padding:'8px 10px',marginBottom:10}}>
                  <div style={{fontSize:10,color:'#4b5563',marginBottom:3}}>CITY APPLICATION</div>
                  <div style={{fontSize:11,color:`${a.color}`,fontWeight:500}}>{a.app}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div style={{background:'rgba(255,255,255,0.03)',borderRadius:6,padding:'6px 8px'}}>
                    <div style={{fontSize:10,color:'#4b5563'}}>Time</div>
                    <div style={{fontSize:11,color:a.color,fontWeight:600,marginTop:1}}>{a.complexity}</div>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.03)',borderRadius:6,padding:'6px 8px'}}>
                    <div style={{fontSize:10,color:'#4b5563'}}>Space</div>
                    <div style={{fontSize:11,color:a.color,fontWeight:600,marginTop:1}}>{a.space}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div style={{fontSize:11,color:'#4b5563'}}>Searches today</div>
                  <div style={{fontSize:14,fontWeight:700,color:a.color}}>{a.searches.toLocaleString()}</div>
                </div>
                <div style={{marginTop:6,height:4,background:'rgba(255,255,255,0.06)',borderRadius:2}}>
                  <div style={{height:'100%',borderRadius:2,background:a.color,width:`${(a.searches/3500)*100}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Summary table */}
      <div className="glass-card overflow-hidden">
        <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontWeight:600,color:'#f8fafc',fontSize:14}}>
          Complexity Summary — All 13 Algorithms
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                {['Algorithm','Module','Time Complexity','Space Complexity','SmartCityX Application','Searches Today'].map(h=>(
                  <th key={h} style={{padding:'11px 14px',textAlign:'left',fontSize:11,color:'#4b5563',fontWeight:600,letterSpacing:'0.5px',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {algorithms.map((a,i)=>(
                <tr key={a.name} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                  <td style={{padding:'10px 14px',fontWeight:600,color:'#e2e8f0',fontSize:12}}>{a.name}</td>
                  <td style={{padding:'10px 14px'}}><span className="badge" style={{background:`${moduleColors[a.module]}15`,color:moduleColors[a.module],fontSize:10}}>{a.module}</span></td>
                  <td style={{padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:a.color}}>{a.complexity}</td>
                  <td style={{padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:'#94a3b8'}}>{a.space}</td>
                  <td style={{padding:'10px 14px',fontSize:12,color:'#94a3b8'}}>{a.app}</td>
                  <td style={{padding:'10px 14px',fontSize:13,fontWeight:700,color:a.color}}>{a.searches.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{background:'rgba(255,255,255,0.03)'}}>
                <td colSpan={5} style={{padding:'11px 14px',fontSize:12,color:'#94a3b8',fontWeight:600}}>Total algorithm executions today</td>
                <td style={{padding:'11px 14px',fontSize:14,fontWeight:700,color:'#38bdf8'}}>{totalSearches.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
