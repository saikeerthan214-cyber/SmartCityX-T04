import { useState } from 'react';
import { Search, Server } from 'lucide-react';
import { cityDocuments, CityDocument } from '../data/documents';
import { javaSimilarity, SimilarityResult } from '../api/javaApi';

const catColors: Record<string,string> = {
  Infrastructure:'#8b5cf6', Water:'#38bdf8', Energy:'#f59e0b',
  Traffic:'#f97316', Emergency:'#ef4444', Environment:'#22c55e'
};

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
    setLoading(true); setJavaError('');
    try {
      const res = await javaSimilarity(docA.content, docB.content);
      setSimilarity(res);
    } catch {
      setJavaError('Java server offline. Run: java -cp out SmartCityXServer');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      {/* Search */}
      <div className="flex items-center gap-2 px-4 mb-6" style={{background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,height:44,maxWidth:500}}>
        <Search size={16} style={{color:'#4b5563'}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents, categories, IDs..."
          style={{background:'transparent',border:'none',outline:'none',color:'#f8fafc',fontSize:13,width:'100%'}}/>
      </div>

      <div className="grid gap-6" style={{gridTemplateColumns:'1fr 380px'}}>
        {/* Document list */}
        <div>
          <div style={{fontSize:12,color:'#4b5563',marginBottom:12}}>{filtered.length} documents</div>
          <div className="flex flex-col gap-3">
            {filtered.map(d=>(
              <div key={d.id} className="glass-card p-4 cursor-pointer"
                style={{borderLeft:`3px solid ${catColors[d.category]}`,
                  outline: (docA?.id===d.id||docB?.id===d.id)?`2px solid ${catColors[d.category]}`:'none'}}>
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
                <div className="flex items-center justify-between">
                  <span style={{fontSize:11,color:'#4b5563'}}>{d.author} · Updated {d.lastUpdated}</span>
                  <div className="flex gap-2">
                    <button onClick={()=>setDocA(d)} style={{fontSize:10,padding:'3px 8px',borderRadius:5,cursor:'pointer',
                      background:docA?.id===d.id?'rgba(56,189,248,0.2)':'rgba(255,255,255,0.05)',
                      color:docA?.id===d.id?'#38bdf8':'#94a3b8',border:'1px solid rgba(255,255,255,0.06)'}}>
                      Set A
                    </button>
                    <button onClick={()=>setDocB(d)} style={{fontSize:10,padding:'3px 8px',borderRadius:5,cursor:'pointer',
                      background:docB?.id===d.id?'rgba(139,92,246,0.2)':'rgba(255,255,255,0.05)',
                      color:docB?.id===d.id?'#a78bfa':'#94a3b8',border:'1px solid rgba(255,255,255,0.06)'}}>
                      Set B
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Similarity Panel */}
        <div>
          <div className="glass-card p-5 sticky top-4">
            <div style={{fontWeight:600,color:'#f8fafc',marginBottom:16,fontSize:14}}>
              📊 Document Similarity Analysis
            </div>
            <div style={{fontSize:11,color:'#4b5563',marginBottom:12}}>Algorithm: Suffix Array + LCP/Kasai</div>

            <div className="flex flex-col gap-3 mb-4">
              <div style={{background:'rgba(56,189,248,0.06)',border:'1px solid rgba(56,189,248,0.15)',borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:10,color:'#38bdf8',fontWeight:600,marginBottom:4}}>DOCUMENT A</div>
                <div style={{fontSize:12,color:'#e2e8f0'}}>{docA ? docA.title : <span style={{color:'#4b5563'}}>Click "Set A" on any document</span>}</div>
              </div>
              <div style={{background:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.15)',borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:10,color:'#a78bfa',fontWeight:600,marginBottom:4}}>DOCUMENT B</div>
                <div style={{fontSize:12,color:'#e2e8f0'}}>{docB ? docB.title : <span style={{color:'#4b5563'}}>Click "Set B" on any document</span>}</div>
              </div>
            </div>

            <button onClick={runSimilarity} disabled={!docA||!docB||loading}
              style={{width:'100%',padding:'10px',borderRadius:8,fontWeight:600,fontSize:13,cursor:docA&&docB&&!loading?'pointer':'not-allowed',
                background:docA&&docB?'linear-gradient(135deg,#3b82f6,#38bdf8)':'rgba(255,255,255,0.05)',
                color:docA&&docB?'#fff':'#4b5563',border:'none',transition:'all 0.2s',marginBottom:16}}>
              {loading ? 'Java Computing...' : 'Run Similarity Analysis (Java)'}
            </button>
            <div className="flex items-center gap-2 mb-3" style={{fontSize:11,color:'#4b5563'}}>
              <Server size={11} style={{color:'#38bdf8'}}/>Algorithm: Suffix Array + LCP/Kasai · Java Backend
            </div>
            {javaError && <div style={{fontSize:11,color:'#ef4444',marginBottom:8}}>{javaError}</div>}
            {similarity && (
              <div className="fade-in">
                <div style={{background:'rgba(255,255,255,0.03)',borderRadius:10,padding:16,marginBottom:12}}>
                  <div style={{fontSize:11,color:'#4b5563',fontWeight:600,marginBottom:8}}>SIMILARITY SCORE</div>
                  <div style={{fontSize:36,fontWeight:800,color:similarity.similarityScore>70?'#22c55e':similarity.similarityScore>40?'#f59e0b':'#ef4444'}}>{similarity.similarityScore}%</div>
                  <div style={{height:6,background:'rgba(255,255,255,0.08)',borderRadius:3,marginTop:8}}>
                    <div style={{height:'100%',borderRadius:3,background:similarity.similarityScore>70?'#22c55e':similarity.similarityScore>40?'#f59e0b':'#ef4444',width:`${similarity.similarityScore}%`,transition:'width 0.8s'}}/>
                  </div>
                </div>
                <div style={{background:'rgba(255,255,255,0.03)',borderRadius:10,padding:12,marginBottom:12}}>
                  <div style={{fontSize:11,color:'#4b5563',fontWeight:600,marginBottom:6}}>LONGEST COMMON SUBSTRING</div>
                  <div className="algo-highlight" style={{fontSize:11}}>"{similarity.lcs}" <span style={{color:'#4b5563'}}>({similarity.lcsLength} chars)</span></div>
                </div>
                <div style={{background:'rgba(56,189,248,0.06)',border:'1px solid rgba(56,189,248,0.1)',borderRadius:8,padding:10,marginBottom:10}}>
                  <div style={{fontSize:10,color:'#38bdf8',fontWeight:600,marginBottom:4}}>JAVA ALGORITHM DETAILS</div>
                  <div style={{fontSize:11,color:'#94a3b8',lineHeight:1.7}}>
                    ① Suffix Array built in Java O(N log N)<br/>
                    ② LCP array via Kasai's O(N) in Java<br/>
                    ③ Cross-document LCS scan on suffix pairs<br/>
                    ④ Executed in {similarity.executionTimeMs?.toFixed(3)} ms
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
