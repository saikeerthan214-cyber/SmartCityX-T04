import { useState } from 'react';
import { Search, Server, FileText, GitCompare, CheckCircle } from 'lucide-react';
import { cityDocuments, CityDocument } from '../data/documents';
import { javaSimilarity, SimilarityResult } from '../api/javaApi';

const catColors: Record<string,string> = {
  Infrastructure:'#8b5cf6', Water:'#38bdf8', Energy:'#f59e0b',
  Traffic:'#f97316', Emergency:'#ef4444', Environment:'#22c55e'
};

function SimilarityMeter({ score }: { score: number }) {
  const color = score > 70 ? '#22c55e' : score > 40 ? '#f59e0b' : '#ef4444';
  const label = score > 70 ? 'Highly Similar' : score > 40 ? 'Moderately Similar' : 'Low Similarity';
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, marginBottom: 14 }}>
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: 11, color: '#4b5563', fontWeight: 600 }}>SIMILARITY SCORE</span>
        <span style={{ fontSize: 11, color, fontWeight: 700 }}>{label}</span>
      </div>
      <div style={{ fontSize: 44, fontWeight: 800, color, lineHeight: 1, marginBottom: 10 }}>{score}%</div>
      <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 5 }}>
        <div style={{ height: '100%', borderRadius: 5, background: color, width: `${score}%`, transition: 'width 1s ease' }} />
      </div>
      <div className="flex justify-between mt-2" style={{ fontSize: 10, color: '#4b5563' }}>
        <span>0% — No match</span><span>50% — Moderate</span><span>100% — Identical</span>
      </div>
    </div>
  );
}

export default function Documents() {
  const [search, setSearch] = useState('');
  const [docA, setDocA] = useState<CityDocument|null>(null);
  const [docB, setDocB] = useState<CityDocument|null>(null);
  const [similarity, setSimilarity] = useState<SimilarityResult|null>(null);
  const [loading, setLoading] = useState(false);
  const [javaError, setJavaError] = useState('');

  const filtered = !search ? cityDocuments : cityDocuments.filter(d=>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.content.toLowerCase().includes(search.toLowerCase()) ||
    d.id.toLowerCase().includes(search.toLowerCase())
  );

  const runSimilarity = async () => {
    if (!docA || !docB) return;
    setLoading(true); setJavaError(''); setSimilarity(null);
    try {
      const res = await javaSimilarity(docA.content, docB.content);
      setSimilarity(res);
    } catch {
      setJavaError('Java server offline. Run: java -cp out SmartCityXServer');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      {/* Header info */}
      <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl" style={{background:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.15)',display:'inline-flex'}}>
        <Server size={13} style={{color:'#a78bfa'}}/>
        <span style={{fontSize:12,color:'#a78bfa',fontWeight:600}}>Module 2 — Suffix Structures</span>
        <span style={{fontSize:11,color:'#4b5563',marginLeft:4}}>Suffix Array O(N log N) + LCP/Kasai O(N) · Java Backend · Port 6789</span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 mb-5" style={{background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,height:44,maxWidth:500}}>
        <Search size={16} style={{color:'#4b5563'}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents by title, category, or ID..."
          style={{background:'transparent',border:'none',outline:'none',color:'#f8fafc',fontSize:13,width:'100%'}}/>
      </div>

      {/* Instruction banner */}
      {!docA && !docB && (
        <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl" style={{background:'rgba(56,189,248,0.05)',border:'1px solid rgba(56,189,248,0.15)'}}>
          <GitCompare size={14} style={{color:'#38bdf8'}}/>
          <span style={{fontSize:12,color:'#94a3b8'}}>
            Select any two city documents using <b style={{color:'#38bdf8'}}>Set A</b> and <b style={{color:'#a78bfa'}}>Set B</b> buttons, then click <b style={{color:'#fff'}}>Run Analysis</b> to compare them using Java Suffix Array + LCP.
          </span>
        </div>
      )}

      <div className="grid gap-6" style={{gridTemplateColumns:'1fr 420px'}}>

        {/* Document list */}
        <div>
          <div style={{fontSize:12,color:'#4b5563',marginBottom:12}}>{filtered.length} city infrastructure documents</div>
          <div className="flex flex-col gap-3">
            {filtered.map(d=>(
              <div key={d.id} className="glass-card p-4"
                style={{borderLeft:`3px solid ${catColors[d.category]}`,
                  outline: docA?.id===d.id ? '2px solid #38bdf8' : docB?.id===d.id ? '2px solid #a78bfa' : 'none',
                  transition:'outline 0.2s'}}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span style={{fontSize:11,color:'#38bdf8',fontWeight:700}}>{d.id}</span>
                    <span style={{margin:'0 8px',color:'#1e3a5f'}}>·</span>
                    <span style={{fontSize:11,color:'#4b5563'}}>{d.version}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="badge" style={{background:`${catColors[d.category]}15`,color:catColors[d.category],fontSize:10}}>{d.category}</span>
                    <span className="badge" style={{background:d.status==='Active'?'rgba(34,197,94,0.12)':'rgba(245,158,11,0.12)',color:d.status==='Active'?'#22c55e':'#f59e0b',fontSize:10}}>{d.status}</span>
                  </div>
                </div>
                <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0',marginBottom:6}}>{d.title}</div>
                <div style={{fontSize:11,color:'#4b5563',marginBottom:10}}>{d.author} · Updated {d.lastUpdated}</div>

                {/* Preview of content */}
                <div style={{fontSize:11,color:'#4b5563',lineHeight:1.5,marginBottom:10,
                  background:'rgba(255,255,255,0.02)',borderRadius:6,padding:'6px 10px',
                  fontStyle:'italic',overflow:'hidden',maxHeight:36}}>
                  "{d.content.substring(0,100)}..."
                </div>

                <div className="flex gap-2">
                  <button onClick={()=>setDocA(d)}
                    style={{flex:1,padding:'6px',borderRadius:6,cursor:'pointer',fontSize:11,fontWeight:600,
                      background:docA?.id===d.id?'rgba(56,189,248,0.2)':'rgba(255,255,255,0.04)',
                      color:docA?.id===d.id?'#38bdf8':'#94a3b8',
                      border:`1px solid ${docA?.id===d.id?'rgba(56,189,248,0.4)':'rgba(255,255,255,0.06)'}`}}>
                    {docA?.id===d.id ? '✓ Document A' : 'Set as Document A'}
                  </button>
                  <button onClick={()=>setDocB(d)}
                    style={{flex:1,padding:'6px',borderRadius:6,cursor:'pointer',fontSize:11,fontWeight:600,
                      background:docB?.id===d.id?'rgba(139,92,246,0.2)':'rgba(255,255,255,0.04)',
                      color:docB?.id===d.id?'#a78bfa':'#94a3b8',
                      border:`1px solid ${docB?.id===d.id?'rgba(139,92,246,0.4)':'rgba(255,255,255,0.06)'}`}}>
                    {docB?.id===d.id ? '✓ Document B' : 'Set as Document B'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Panel */}
        <div>
          <div className="glass-card p-5 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <GitCompare size={16} style={{color:'#a78bfa'}}/>
              <span style={{fontWeight:700,color:'#f8fafc',fontSize:15}}>Document Similarity Analysis</span>
            </div>

            {/* Selected docs */}
            <div className="flex flex-col gap-2 mb-4">
              <div style={{background:'rgba(56,189,248,0.06)',border:`1px solid ${docA?'rgba(56,189,248,0.35)':'rgba(255,255,255,0.06)'}`,borderRadius:8,padding:'10px 12px'}}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={11} style={{color:'#38bdf8'}}/>
                  <span style={{fontSize:10,color:'#38bdf8',fontWeight:700}}>DOCUMENT A</span>
                  {docA && <span className="badge" style={{background:`${catColors[docA.category]}15`,color:catColors[docA.category],fontSize:9,marginLeft:'auto'}}>{docA.category}</span>}
                </div>
                <div style={{fontSize:12,color:docA?'#e2e8f0':'#4b5563'}}>
                  {docA ? docA.title : 'Not selected — click "Set as Document A"'}
                </div>
                {docA && <div style={{fontSize:10,color:'#4b5563',marginTop:3}}>{docA.id} · {docA.content.split(' ').length} words</div>}
              </div>

              <div style={{textAlign:'center',color:'#4b5563',fontSize:11}}>vs</div>

              <div style={{background:'rgba(139,92,246,0.06)',border:`1px solid ${docB?'rgba(139,92,246,0.35)':'rgba(255,255,255,0.06)'}`,borderRadius:8,padding:'10px 12px'}}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={11} style={{color:'#a78bfa'}}/>
                  <span style={{fontSize:10,color:'#a78bfa',fontWeight:700}}>DOCUMENT B</span>
                  {docB && <span className="badge" style={{background:`${catColors[docB.category]}15`,color:catColors[docB.category],fontSize:9,marginLeft:'auto'}}>{docB.category}</span>}
                </div>
                <div style={{fontSize:12,color:docB?'#e2e8f0':'#4b5563'}}>
                  {docB ? docB.title : 'Not selected — click "Set as Document B"'}
                </div>
                {docB && <div style={{fontSize:10,color:'#4b5563',marginTop:3}}>{docB.id} · {docB.content.split(' ').length} words</div>}
              </div>
            </div>

            <button onClick={runSimilarity} disabled={!docA||!docB||loading}
              style={{width:'100%',padding:'11px',borderRadius:10,fontWeight:700,fontSize:13,
                cursor:docA&&docB&&!loading?'pointer':'not-allowed',border:'none',
                transition:'all 0.2s',marginBottom:12,
                background:docA&&docB?'linear-gradient(135deg,#8b5cf6,#38bdf8)':'rgba(255,255,255,0.05)',
                color:docA&&docB?'#fff':'#4b5563'}}>
              {loading ? '⏳ Java Computing Suffix Array...' : '🔍 Run Similarity Analysis (Java)'}
            </button>

            {javaError && (
              <div style={{fontSize:11,color:'#ef4444',marginBottom:10,padding:'8px 12px',borderRadius:6,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)'}}>
                {javaError}
              </div>
            )}

            {/* Results */}
            {similarity && (
              <div className="fade-in">

                {/* Score meter */}
                <SimilarityMeter score={similarity.similarityScore} />

                {/* LCS */}
                <div style={{background:'rgba(255,255,255,0.03)',borderRadius:10,padding:14,marginBottom:12}}>
                  <div style={{fontSize:11,color:'#4b5563',fontWeight:600,marginBottom:8}}>
                    LONGEST COMMON SUBSTRING (LCS)
                  </div>
                  <div style={{fontSize:11,color:'#94a3b8',marginBottom:8,lineHeight:1.5}}>
                    The longest text sequence found in <b style={{color:'#38bdf8'}}>both</b> documents:
                  </div>
                  <div style={{background:'#0b1520',border:'1px solid rgba(56,189,248,0.2)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:13,color:'#a5f3fc',lineHeight:1.6}}>
                    "{similarity.lcs}"
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div style={{textAlign:'center',background:'rgba(56,189,248,0.08)',borderRadius:6,padding:'6px 14px'}}>
                      <div style={{fontSize:18,fontWeight:700,color:'#38bdf8'}}>{similarity.lcsLength}</div>
                      <div style={{fontSize:10,color:'#4b5563'}}>characters</div>
                    </div>
                    <div style={{fontSize:11,color:'#94a3b8',flex:1,lineHeight:1.6}}>
                      This common substring indicates that both documents share <b style={{color:'#e2e8f0'}}>similar content, terminology, or subject matter</b>.
                    </div>
                  </div>
                </div>

                {/* Step-by-step algorithm */}
                <div style={{background:'rgba(139,92,246,0.05)',border:'1px solid rgba(139,92,246,0.15)',borderRadius:10,padding:14,marginBottom:12}}>
                  <div style={{fontSize:11,color:'#a78bfa',fontWeight:700,marginBottom:10}}>
                    📐 HOW JAVA COMPUTED THIS
                  </div>
                  {[
                    { step:'①', title:'Concatenate', desc:`Combined both documents with a separator (total ~${(docA?.content.length||0)+(docB?.content.length||0)} chars)`, color:'#38bdf8' },
                    { step:'②', title:'Suffix Array', desc:'Java sorted all suffixes in O(N log N) — prefix doubling algorithm', color:'#8b5cf6' },
                    { step:'③', title:'LCP/Kasai', desc:'Built LCP array in O(N) — Kasai\'s algorithm finds common prefix lengths', color:'#f59e0b' },
                    { step:'④', title:'Cross-doc LCS', desc:'Scanned adjacent suffix pairs from different documents — peak LCP = LCS', color:'#22c55e' },
                    { step:'⑤', title:'Result', desc:`Score = (2 × ${similarity.lcsLength}) / (${docA?.content.length||0} + ${docB?.content.length||0}) × 100 = ${similarity.similarityScore}%`, color:'#ef4444' },
                  ].map(s=>(
                    <div key={s.step} className="flex items-start gap-3 mb-3">
                      <span style={{fontSize:14,color:s.color,fontWeight:700,flexShrink:0,minWidth:20}}>{s.step}</span>
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:'#e2e8f0',marginBottom:2}}>{s.title}</div>
                        <div style={{fontSize:11,color:'#94a3b8',lineHeight:1.5}}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {l:'Execution Time', v:`${similarity.executionTimeMs?.toFixed(3)} ms`, c:'#f59e0b'},
                    {l:'Algorithm', v:'Suffix Array + LCP', c:'#a78bfa'},
                    {l:'Build Complexity', v:'O(N log N)', c:'#38bdf8'},
                    {l:'LCP Complexity', v:'O(N) Kasai', c:'#22c55e'},
                  ].map(s=>(
                    <div key={s.l} style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'10px 12px'}}>
                      <div style={{fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div>
                      <div style={{fontSize:10,color:'#4b5563',marginTop:2}}>{s.l}</div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
