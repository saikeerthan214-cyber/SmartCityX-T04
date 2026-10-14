import { useState } from 'react';
import { Search, MapPin, Plus, X, Server, CheckCircle } from 'lucide-react';
import { citizenReports, CitizenReport } from '../data/reports';
import { javaSearch } from '../api/javaApi';

const catColors: Record<string,string> = {
  Water:'#38bdf8', Traffic:'#f59e0b', Infrastructure:'#8b5cf6',
  Emergency:'#ef4444', Other:'#94a3b8'
};
const priColors: Record<string,string> = { High:'#ef4444', Medium:'#f59e0b', Low:'#22c55e' };
const statColors: Record<string,string> = { Open:'#f59e0b', Investigating:'#38bdf8', Resolved:'#22c55e' };

// Keyword → category mapping (used by Java KMP scan)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Water:          ['water','pipe','leak','drainage','flood','supply','pressure','sewage','tank'],
  Traffic:        ['traffic','road','pothole','signal','accident','vehicle','highway','junction','congestion'],
  Infrastructure: ['bridge','building','electric','power','street light','footpath','wall','pole','cable'],
  Emergency:      ['fire','explosion','gas','chemical','collapse','injury','ambulance','danger','hazard'],
};

interface NewReport {
  name: string; phone: string; location: string;
  issue: string; description: string;
  priority: 'High'|'Medium'|'Low';
}

export default function CitizenReports() {
  const [search, setSearch] = useState('');
  const [cat, setCat]       = useState('All');
  const [pri, setPri]       = useState('All');
  const [selected, setSelected] = useState<CitizenReport|null>(null);

  // Submit form state
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState<NewReport>({ name:'', phone:'', location:'', issue:'', description:'', priority:'Medium' });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [allReports, setAllReports]     = useState<CitizenReport[]>(citizenReports);

  const cats = ['All','Water','Traffic','Infrastructure','Emergency','Other'];
  const pris = ['All','High','Medium','Low'];

  const filtered = allReports.filter(r => {
    const matchSearch = !search || r.issue.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'All' || r.category === cat;
    const matchPri = pri === 'All' || r.priority === pri;
    return matchSearch && matchCat && matchPri;
  });

  // Submit new report → Java KMP scans description to auto-detect category
  const handleSubmit = async () => {
    if (!form.issue.trim() || !form.location.trim() || !form.description.trim()) return;
    setSubmitting(true);

    try {
      // Run Java KMP on description for each category's keywords
      const text = (form.issue + ' ' + form.description).toLowerCase();
      const allKeywords = Object.values(CATEGORY_KEYWORDS).flat();
      const searchResult = await javaSearch([text], allKeywords.join(','), 'aho-corasick');

      // Detect category from matches
      let detectedCat: CitizenReport['category'] = 'Other';
      let maxMatches = 0;
      const matchedKeywords: string[] = (searchResult.matches || []).map((m: any) => m.keyword);

      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        const count = keywords.filter(k => matchedKeywords.includes(k)).length;
        if (count > maxMatches) { maxMatches = count; detectedCat = category as CitizenReport['category']; }
      }

      // Create new report
      const newId = `CR-${1072 + allReports.length - citizenReports.length}`;
      const newReport: CitizenReport = {
        id: newId, citizen: form.name || 'Anonymous',
        issue: form.issue, location: form.location,
        category: detectedCat, priority: form.priority,
        date: new Date().toISOString().split('T')[0],
        status: 'Open', description: form.description,
      };

      setAllReports(prev => [newReport, ...prev]);
      setSubmitResult({
        id: newId, detectedCategory: detectedCat,
        matchedKeywords, comparisons: searchResult.comparisons ?? 0,
        execTime: searchResult.executionTimeMs?.toFixed(3),
        totalMatches: searchResult.totalMatches,
      });
      setForm({ name:'', phone:'', location:'', issue:'', description:'', priority:'Medium' });
    } catch {
      setSubmitResult({ error: 'Java server offline. Run: java -cp out SmartCityXServer' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in">

      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div className="grid gap-4" style={{gridTemplateColumns:'repeat(5,auto)',display:'flex',flexWrap:'wrap',gap:12}}>
          {[
            {label:'Total', value:allReports.length, color:'#38bdf8'},
            {label:'Open', value:allReports.filter(r=>r.status==='Open').length, color:'#f59e0b'},
            {label:'Investigating', value:allReports.filter(r=>r.status==='Investigating').length, color:'#8b5cf6'},
            {label:'Resolved', value:allReports.filter(r=>r.status==='Resolved').length, color:'#22c55e'},
            {label:'High Priority', value:allReports.filter(r=>r.priority==='High').length, color:'#ef4444'},
          ].map(s=>(
            <div key={s.label} className="glass-card p-4" style={{minWidth:110}}>
              <div style={{fontSize:24,fontWeight:700,color:s.color}}>{s.value}</div>
              <div style={{fontSize:11,color:'#94a3b8',marginTop:3}}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>{setShowForm(true);setSubmitResult(null);}}
          className="flex items-center gap-2"
          style={{padding:'10px 18px',borderRadius:10,background:'linear-gradient(135deg,#3b82f6,#38bdf8)',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',border:'none',whiteSpace:'nowrap'}}>
          <Plus size={15}/> Submit Report
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 flex-1" style={{background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,height:38,minWidth:200}}>
          <Search size={14} style={{color:'#4b5563'}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search reports, locations, IDs..."
            style={{background:'transparent',border:'none',outline:'none',color:'#f8fafc',fontSize:13,width:'100%'}}/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {cats.map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              style={{padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',
                background:cat===c?catColors[c]||'#3b82f6':'rgba(255,255,255,0.04)',
                color:cat===c?'#fff':'#94a3b8',border:`1px solid ${cat===c?catColors[c]||'#3b82f6':'rgba(255,255,255,0.06)'}`,transition:'all 0.15s'}}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {pris.map(p=>(
            <button key={p} onClick={()=>setPri(p)}
              style={{padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',
                background:pri===p?priColors[p]||'#3b82f6':'rgba(255,255,255,0.04)',
                color:pri===p?'#fff':'#94a3b8',border:`1px solid ${pri===p?priColors[p]||'#3b82f6':'rgba(255,255,255,0.06)'}`,transition:'all 0.15s'}}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{fontSize:12,color:'#4b5563',marginBottom:12}}>{filtered.length} reports found</div>

      {/* Report Cards */}
      <div className="grid gap-3" style={{gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))'}}>
        {filtered.map(r=>(
          <div key={r.id} className="glass-card p-4 cursor-pointer" onClick={()=>setSelected(r)}
            style={{borderLeft:`3px solid ${priColors[r.priority]}`}}>
            <div className="flex items-center justify-between mb-2">
              <span style={{fontSize:11,color:'#38bdf8',fontWeight:700}}>{r.id}</span>
              <span className="badge" style={{background:`${priColors[r.priority]}15`,color:priColors[r.priority],fontSize:10}}>{r.priority}</span>
            </div>
            <div style={{fontSize:13,color:'#e2e8f0',fontWeight:500,marginBottom:8,lineHeight:1.4}}>{r.issue}</div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1" style={{fontSize:11,color:'#4b5563'}}>
                <MapPin size={10}/>{r.location}
              </span>
              <span className="badge" style={{background:`${catColors[r.category]}15`,color:catColors[r.category],fontSize:10}}>{r.category}</span>
              <span style={{fontSize:11,color:statColors[r.status],fontWeight:600,marginLeft:'auto'}}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── SUBMIT REPORT MODAL ──────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.75)'}}>
          <div className="glass-card fade-in p-6" style={{width:'100%',maxWidth:560,maxHeight:'90vh',overflowY:'auto'}}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <div style={{fontSize:16,fontWeight:700,color:'#f8fafc'}}>Submit Citizen Report</div>
                <div className="flex items-center gap-1 mt-1">
                  <Server size={11} style={{color:'#38bdf8'}}/>
                  <span style={{fontSize:11,color:'#4b5563'}}>Java Aho-Corasick auto-detects category from your description</span>
                </div>
              </div>
              <button onClick={()=>{setShowForm(false);setSubmitResult(null);}} style={{color:'#94a3b8',cursor:'pointer'}}><X size={18}/></button>
            </div>

            {/* Success result */}
            {submitResult && !submitResult.error && (
              <div className="mb-5 fade-in" style={{background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:10,padding:16}}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={15} style={{color:'#22c55e'}}/>
                  <span style={{fontWeight:700,color:'#22c55e',fontSize:13}}>Report {submitResult.id} submitted successfully!</span>
                </div>
                <div style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:12,marginBottom:10}}>
                  <div style={{fontSize:11,color:'#4b5563',fontWeight:600,marginBottom:6}}>JAVA AHO-CORASICK ANALYSIS</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {l:'Detected Category', v:submitResult.detectedCategory, c:catColors[submitResult.detectedCategory]||'#94a3b8'},
                      {l:'Keywords Matched',  v:submitResult.totalMatches,      c:'#22c55e'},
                      {l:'States Visited',    v:submitResult.comparisons,       c:'#8b5cf6'},
                      {l:'Execution Time',    v:`${submitResult.execTime} ms`,  c:'#f59e0b'},
                    ].map(s=>(
                      <div key={s.l} style={{background:'rgba(255,255,255,0.03)',borderRadius:6,padding:'8px 10px'}}>
                        <div style={{fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:10,color:'#4b5563'}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  {submitResult.matchedKeywords?.length > 0 && (
                    <div style={{marginTop:10}}>
                      <div style={{fontSize:10,color:'#4b5563',fontWeight:600,marginBottom:6}}>MATCHED KEYWORDS (Java detected)</div>
                      <div className="flex flex-wrap gap-1">
                        {submitResult.matchedKeywords.slice(0,10).map((k:string,i:number)=>(
                          <span key={i} className="badge badge-cyan" style={{fontSize:10}}>{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={()=>setSubmitResult(null)} style={{fontSize:12,color:'#38bdf8',cursor:'pointer',background:'none',border:'none'}}>
                  Submit another report →
                </button>
              </div>
            )}

            {submitResult?.error && (
              <div className="mb-4 px-3 py-2 rounded-lg" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)'}}>
                <div style={{fontSize:12,color:'#ef4444'}}>{submitResult.error}</div>
              </div>
            )}

            {!submitResult && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{fontSize:11,color:'#94a3b8',fontWeight:600,display:'block',marginBottom:6}}>YOUR NAME</label>
                    <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                      placeholder="e.g. Arjun Mehta"
                      style={{width:'100%',background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'9px 12px',color:'#f8fafc',fontSize:13,outline:'none'}}/>
                  </div>
                  <div>
                    <label style={{fontSize:11,color:'#94a3b8',fontWeight:600,display:'block',marginBottom:6}}>PHONE</label>
                    <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}
                      placeholder="e.g. 98765 43210"
                      style={{width:'100%',background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'9px 12px',color:'#f8fafc',fontSize:13,outline:'none'}}/>
                  </div>
                </div>

                <div>
                  <label style={{fontSize:11,color:'#94a3b8',fontWeight:600,display:'block',marginBottom:6}}>LOCATION *</label>
                  <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}
                    placeholder="e.g. Sector 12, Zone A"
                    style={{width:'100%',background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'9px 12px',color:'#f8fafc',fontSize:13,outline:'none'}}/>
                </div>

                <div>
                  <label style={{fontSize:11,color:'#94a3b8',fontWeight:600,display:'block',marginBottom:6}}>ISSUE TITLE *</label>
                  <input value={form.issue} onChange={e=>setForm(f=>({...f,issue:e.target.value}))}
                    placeholder="e.g. Water leakage near main road"
                    style={{width:'100%',background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'9px 12px',color:'#f8fafc',fontSize:13,outline:'none'}}/>
                </div>

                <div>
                  <label style={{fontSize:11,color:'#94a3b8',fontWeight:600,display:'block',marginBottom:6}}>
                    DESCRIPTION * &nbsp;
                    <span style={{color:'#38bdf8',fontWeight:400}}>← Java Aho-Corasick scans this to detect category</span>
                  </label>
                  <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                    placeholder="Describe the issue in detail... e.g. Large water leak from underground pipe flooding the road near sector 12 junction."
                    rows={4}
                    style={{width:'100%',background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'9px 12px',color:'#f8fafc',fontSize:13,outline:'none',resize:'vertical'}}/>
                </div>

                <div>
                  <label style={{fontSize:11,color:'#94a3b8',fontWeight:600,display:'block',marginBottom:6}}>PRIORITY</label>
                  <div className="flex gap-2">
                    {(['High','Medium','Low'] as const).map(p=>(
                      <button key={p} onClick={()=>setForm(f=>({...f,priority:p}))}
                        style={{padding:'7px 16px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',
                          background:form.priority===p?`${priColors[p]}20`:'rgba(255,255,255,0.04)',
                          color:form.priority===p?priColors[p]:'#94a3b8',
                          border:`1px solid ${form.priority===p?priColors[p]:'rgba(255,255,255,0.06)'}`,transition:'all 0.15s'}}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button onClick={handleSubmit} disabled={submitting||!form.issue||!form.location||!form.description}
                    style={{flex:1,padding:'11px',borderRadius:10,fontWeight:700,fontSize:13,cursor:'pointer',border:'none',
                      background:submitting||!form.issue||!form.location||!form.description?'#1e3a5f':'linear-gradient(135deg,#3b82f6,#38bdf8)',
                      color:submitting||!form.issue||!form.location||!form.description?'#4b5563':'#fff'}}>
                    {submitting ? 'Java Analyzing...' : 'Submit & Auto-Detect Category (Java)'}
                  </button>
                  <button onClick={()=>setShowForm(false)}
                    style={{padding:'11px 20px',borderRadius:10,background:'rgba(255,255,255,0.05)',color:'#94a3b8',fontWeight:600,fontSize:13,cursor:'pointer',border:'1px solid rgba(255,255,255,0.08)'}}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.7)'}}>
          <div className="glass-card fade-in p-6" style={{width:'100%',maxWidth:480}}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div style={{fontSize:11,color:'#38bdf8',fontWeight:700,marginBottom:4}}>{selected.id}</div>
                <div style={{fontSize:16,fontWeight:700,color:'#f8fafc'}}>{selected.issue}</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{color:'#94a3b8',cursor:'pointer',fontSize:20,lineHeight:1}}>×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                {l:'Category', v:selected.category, c:catColors[selected.category]},
                {l:'Priority',  v:selected.priority,  c:priColors[selected.priority]},
                {l:'Status',    v:selected.status,    c:statColors[selected.status]},
                {l:'Date',      v:selected.date,      c:'#e2e8f0'},
              ].map(f=>(
                <div key={f.l} style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'10px 12px'}}>
                  <div style={{fontSize:10,color:'#4b5563',fontWeight:600,marginBottom:4}}>{f.l.toUpperCase()}</div>
                  <div style={{fontSize:13,color:f.c,fontWeight:600}}>{f.v}</div>
                </div>
              ))}
            </div>
            <div style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:12,marginBottom:12}}>
              <div style={{fontSize:10,color:'#4b5563',fontWeight:600,marginBottom:6}}>LOCATION</div>
              <div className="flex items-center gap-2" style={{fontSize:13,color:'#e2e8f0'}}><MapPin size={12} color="#38bdf8"/>{selected.location}</div>
            </div>
            <div style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:12,marginBottom:12}}>
              <div style={{fontSize:10,color:'#4b5563',fontWeight:600,marginBottom:6}}>REPORTED BY</div>
              <div style={{fontSize:13,color:'#e2e8f0'}}>{selected.citizen}</div>
            </div>
            <div style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:12,marginBottom:16}}>
              <div style={{fontSize:10,color:'#4b5563',fontWeight:600,marginBottom:6}}>DESCRIPTION</div>
              <p style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>{selected.description}</p>
            </div>
            <div className="flex gap-2">
              <button style={{flex:1,padding:'9px',borderRadius:8,background:'#3b82f6',color:'#fff',fontWeight:600,fontSize:12,cursor:'pointer',border:'none'}}>Assign Team</button>
              <button style={{flex:1,padding:'9px',borderRadius:8,background:'rgba(34,197,94,0.15)',color:'#22c55e',fontWeight:600,fontSize:12,cursor:'pointer',border:'1px solid rgba(34,197,94,0.2)'}}>Mark Resolved</button>
              <button onClick={()=>setSelected(null)} style={{padding:'9px 16px',borderRadius:8,background:'rgba(255,255,255,0.05)',color:'#94a3b8',fontWeight:600,fontSize:12,cursor:'pointer',border:'1px solid rgba(255,255,255,0.08)'}}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
