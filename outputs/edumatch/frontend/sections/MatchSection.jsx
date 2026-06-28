import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { customPathBlueprint } from '../data/edumatchData';
import { Pill, Reveal } from '../components/ui';

export function MatchSection({state, navigate}){
  const {career, profile, isSchoolStage, isCustomPath, currentMeta, activeRoadmap, matchResult} = state;
  const hasAiRoadmap = Boolean(matchResult?.roadmap?.length);
  const blueprint = hasAiRoadmap ? matchResult.roadmap : (isSchoolStage ? activeRoadmap : customPathBlueprint);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const rawConfidence = currentMeta[0] || '100%';
  const displayConfidence = rawConfidence.replace(/^confidence:\s*/i, '');

  const getConfidencePercent = (conf) => {
    if (!conf) return 100;
    const match = conf.match(/(\d+)%/);
    if (match) return parseInt(match[1], 10);
    const lower = conf.toLowerCase();
    if (lower.includes('high') || lower.includes('strong')) return 90;
    if (lower.includes('moderate') || lower.includes('medium')) return 60;
    if (lower.includes('low') || lower.includes('weak')) return 35;
    return 75; // default fallback
  };

  const pct = getConfidencePercent(displayConfidence);
  const bigScoreStyle = {
    background: `radial-gradient(circle at center, #11121a 57%, transparent 58%), conic-gradient(var(--violet) 0 ${pct}%, #24252d ${pct}%)`
  };

  const strongStyle = {
    fontSize: displayConfidence.length > 5 ? '18px' : '38px',
    lineHeight: '1.2',
    textAlign: 'center',
    display: 'block',
    width: '100%',
    padding: '0 8px',
    wordBreak: 'break-word'
  };

  return (
    <section className={`match section ${(isCustomPath||isSchoolStage)?'custom-path-mode':''}`} id="match">
      <div className="match-copy"><Reveal><Pill>{isSchoolStage?'STREAM ROADMAP':isCustomPath?'PERSONAL PATH STUDIO':'LIVE AI MATCH'}</Pill><h2>{isSchoolStage?<><span>{profile.stream}</span><br/>roadmap.</>:isCustomPath?<><span>Invent</span> the route.</>:<>Your ambition,<br/><span>decoded.</span></>}</h2><p>{isSchoolStage?'For Class 10, 11 and 12 learners, EduMatch recommends the right 11th-12th pathway now. UG college prediction stays locked until Class 12 performance and entrance exam results are available.':isCustomPath?'EduMatch turns a blurry, original ambition into a real path: skills to learn, proof to build, mentors to find and money experiments to try.':'EduMatch weighs 40+ signals from academic fit and budget to campus culture and career outcomes.'}</p><ul><li><Check/>{isSchoolStage?'11th-12th college/pathway first':isCustomPath?'No fixed job title required':'Personalized to your real profile'}</li><li><Check/>{isSchoolStage?'Future streams based on selected stream':isCustomPath?'Portfolio-first, income-aware roadmap':'Transparent, explainable matches'}</li><li><Check/>{isSchoolStage?'UG colleges unlock after 12th + entrance results':isCustomPath?'Adapts as your experiments reveal your direction':'Adapts as your goals evolve'}</li></ul></Reveal></div>
      <Reveal className="match-card"><div className="match-top"><div><small>{isSchoolStage?'GUIDANCE FOR':isCustomPath?'CUSTOM BLUEPRINT FOR':'PATH ANALYSIS FOR'}</small><h3>{isSchoolStage?profile.educationStage:career}</h3></div><span className="pulse">{isSchoolStage?'UG LOCKED':isCustomPath?'STUDIO READY':'ANALYSIS COMPLETE'}</span></div>
        {(isCustomPath||isSchoolStage)?<div className="custom-blueprint">{blueprint.map((item,i)=><div className="blueprint-step" key={`${item[0]}-${item[1]}-${i}`}><span>{String(i+1).padStart(2,'0')}</span><div><b>{item[0]}</b><p>{item[1]}</p></div></div>)}</div>:<div className="score-wrap"><div className="big-score" style={bigScoreStyle}><strong style={strongStyle}>{displayConfidence}</strong><span>Path confidence</span></div><div className="score-lines"><div><span>Profile alignment</span><i style={{width:'94%'}}/></div><div><span>Career momentum</span><i style={{width:'88%'}}/></div><div><span>Affordability fit</span><i style={{width:'79%'}}/></div></div></div>}
        
        {matchResult?.analysis && (
          <div className="ai-analysis-box" style={{
            background: 'rgba(144, 124, 255, 0.05)',
            borderLeft: '4px solid var(--violet)',
            padding: '1.25rem',
            borderRadius: '0 12px 12px 0',
            marginTop: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            color: '#dedee3'
          }}>
            <strong style={{ display: 'block', color: 'var(--violet)', marginBottom: '0.4rem', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              AI Merit & Qualification Check
            </strong>
            {matchResult.analysis}
          </div>
        )}

        <div className="rec-grid">
          <div style={{gridColumn: isSchoolStage || isCustomPath ? 'auto' : '1 / -1'}}>
            <small>{isSchoolStage?'CURRENT MATCH TYPE':isCustomPath?'FIRST EXPERIMENT':'TOP COLLEGE MATCHES'}</small>
            {isSchoolStage || isCustomPath ? (
              <b>{currentMeta[2]}</b>
            ) : (
              <div style={{display:'flex', gap:'1rem', flexWrap:'wrap', marginTop:'0.5rem'}}>
                {(state.visibleColleges || []).slice(0, 3).map((c, i) => {
                  const isExpanded = expandedIndex === i;
                  return (
                    <div key={i} style={{
                      background:'rgba(255,255,255,0.03)',
                      border:'1px solid rgba(255,255,255,0.08)',
                      padding:'1rem',
                      borderRadius:'12px',
                      flex:'1 1 240px',
                      display:'flex',
                      flexDirection:'column',
                      gap:'0.5rem',
                      justifyContent:'space-between',
                      transition: 'all 0.3s ease'
                    }}>
                      <div>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.25rem'}}>
                          <span style={{fontSize:'0.8rem', color:c.color, fontWeight:'bold'}}>{c.score}% MATCH</span>
                          <span style={{fontSize:'0.8rem', color:'var(--cyan)'}}>{c.chance} Shot</span>
                        </div>
                        <b style={{display:'block', fontSize:'1rem', marginBottom:'0.25rem', color:'#fff'}}>{c.name}</b>
                        <small style={{display:'block', opacity:0.7, marginBottom:'0.5rem'}}>{c.city}, {c.state || 'India'}</small>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.25rem', background:'rgba(0,0,0,0.15)', padding:'0.5rem', borderRadius:'6px', fontSize:'0.75rem', marginBottom:'0.5rem'}}>
                          <div><span style={{opacity:0.6, display:'block', fontSize:'0.65rem'}}>ROI</span>{c.roi}</div>
                          <div><span style={{opacity:0.6, display:'block', fontSize:'0.65rem'}}>PLACEMENT</span>{c.placement}</div>
                        </div>
                        {(c.cutoffHint || c.sourceNote) && (
                          <p style={{margin:0, fontSize:'0.8rem', opacity:0.8, color:'#d0d1d9', lineHeight:'1.4'}}>
                            <strong>Cutoff Fit:</strong> {c.cutoffHint || c.sourceNote}
                          </p>
                        )}
                      </div>
                      
                      <button 
                        type="button"
                        onClick={() => setExpandedIndex(isExpanded ? null : i)}
                        style={{
                          background:'rgba(255,255,255,0.05)',
                          border:'1px solid rgba(255,255,255,0.08)',
                          borderRadius:'6px',
                          color:'#fff',
                          padding:'6px 10px',
                          fontSize:'0.75rem',
                          cursor:'pointer',
                          marginTop:'0.75rem',
                          width:'100%',
                          textAlign:'center',
                          fontWeight:'bold'
                        }}
                      >
                        {isExpanded ? 'Hide Details' : 'Syllabus & Scholarships'}
                      </button>

                      {isExpanded && (
                        <div style={{
                          borderTop:'1px dashed rgba(255,255,255,0.1)',
                          paddingTop:'0.75rem',
                          marginTop:'0.5rem',
                          display:'flex',
                          flexDirection:'column',
                          gap:'0.5rem',
                          fontSize:'0.8rem'
                        }}>
                          <div>
                            <strong style={{color:'var(--violet)', fontSize:'0.7rem', display:'block', marginBottom:'0.2rem', textTransform:'uppercase'}}>Course Syllabus Topics</strong>
                            <div style={{display:'flex', flexWrap:'wrap', gap:'0.3rem'}}>
                              {(c.courseProfile || []).map((t, ti) => (
                                <span key={ti} style={{background:'rgba(144, 124, 255, 0.1)', color:'#d9d4ff', padding:'2px 6px', borderRadius:'4px', fontSize:'0.75rem'}}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <strong style={{color:'#4CAF50', fontSize:'0.7rem', display:'block', marginBottom:'0.2rem', textTransform:'uppercase'}}>Available Scholarships</strong>
                            <ul style={{margin:0, paddingLeft:'1rem', opacity:0.8, display:'flex', flexDirection:'column', gap:'0.15rem'}}>
                              {(c.scholarshipsAvailable || []).map((s, si) => (
                                <li key={si} style={{lineHeight:1.3}}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div><small>{isSchoolStage?'UG COLLEGE STATUS':isCustomPath?'EARNING MODEL':'EXPECTED SALARY'}</small><b>{currentMeta[1]}</b></div>
          <div className="wide"><small>{isSchoolStage?'FUTURE STREAM EDGE':isCustomPath?'YOUR OPERATING EDGE':'YOUR SKILL EDGE'}</small><b>{currentMeta[3]}</b></div>
        </div>

        {!isSchoolStage && !isCustomPath && matchResult?.jobProgression && matchResult.jobProgression.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '1.25rem',
            borderRadius: '12px',
            marginTop: '1.5rem',
            marginBottom: '1rem'
          }}>
            <h4 style={{
              fontSize: '1rem',
              color: 'var(--cyan)',
              marginBottom: '1rem',
              borderBottom: '1px dashed rgba(116, 229, 255, 0.15)',
              paddingBottom: '0.4rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>📈</span> Career Job Progression Pathways
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                left: '15px',
                top: '15px',
                bottom: '15px',
                width: '2px',
                background: 'linear-gradient(to bottom, var(--violet), var(--cyan))',
                zIndex: 0
              }}/>
              
              {matchResult.jobProgression.map((job, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  gap: '0.75rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#11121a',
                    border: `2px solid ${idx === 0 ? 'var(--violet)' : idx === 1 ? '#9b8cff' : 'var(--cyan)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.2)',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.03)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      marginBottom: '0.4rem'
                    }}>
                      <div>
                        <span style={{
                          fontSize: '0.7rem', 
                          color: idx === 0 ? 'var(--violet)' : idx === 1 ? '#9b8cff' : 'var(--cyan)', 
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {job.level}
                        </span>
                        <b style={{display: 'block', fontSize: '0.95rem', color: '#fff'}}>{job.title}</b>
                      </div>
                      <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: 'var(--cyan)',
                        height: 'fit-content'
                      }}>
                        {job.salary}
                      </div>
                    </div>
                    <div>
                      <small style={{color: 'var(--muted)', display: 'block', marginBottom: '0.2rem', fontSize:'0.75rem'}}>Required Skills:</small>
                      <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.25rem'}}>
                        {(typeof job.skills === 'string' ? job.skills.split(',') : Array.isArray(job.skills) ? job.skills : []).map((skill, sIdx) => (
                          <span key={sIdx} style={{background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.7rem', padding: '2px 5px', borderRadius: '4px'}}>
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="button full" onClick={() => navigate && navigate('/roadmap')}>{isSchoolStage?'View stream-wise roadmap':isCustomPath?'Build my unconventional roadmap':'Explore my complete roadmap'} <ArrowRight size={16}/></button>
      </Reveal>
    </section>
  );
}
