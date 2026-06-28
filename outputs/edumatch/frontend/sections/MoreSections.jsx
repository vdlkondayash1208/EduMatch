import { useState, useEffect, useRef } from 'react';
import { ArrowRight, BrainCircuit, ChevronRight, Clock3, Code2, Coffee, GraduationCap, Moon, Send, Sparkles, School, BookOpen, Wallet, Award } from 'lucide-react';
import { features } from '../data/edumatchData';
import { Pill, Reveal } from '../components/ui';
import { api } from '../lib/api';

export function Features({navigate}){
  return (
    <section className="features section" id="features">
      <Reveal className="section-title left">
        <Pill>ONE INTELLIGENCE LAYER</Pill>
        <h2>Everything you need<br/>to move <span>forward.</span></h2>
      </Reveal>
      <div className="bento">
        {features.map((f,i)=>(
          <Reveal key={f.title} className={`feature-card ${f.wide?'feature-wide':''}`} delay={i*.08} onClick={() => navigate && f.link && navigate(f.link)} style={{cursor: f.link ? 'pointer' : 'default'}}>
            <div className="feature-num">{f.tag}</div>
            <div className="feature-icon"><f.icon/></div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
            <div className="feature-arrow"><ArrowRight/></div>
            {i===0 && <div className="card-visual bars"><i/><i/><i/><i/></div>}
            {i===2 && <div className="card-visual orbit"><span>YOU</span></div>}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FutureTimeline({state}){
  const {isSchoolStage, activeRoadmap, matchResult, career} = state;
  const hasAiRoadmap = Boolean(matchResult?.roadmap?.length);
  const items = hasAiRoadmap
    ? matchResult.roadmap
    : (isSchoolStage ? activeRoadmap : [['NOW','Discover your direction','Your ambition becomes a personalized plan.'],['YEAR 1','Enter the right college','One focused step, validated by live data.'],['YEAR 2','Build high-value skills','One focused step, validated by live data.'],['YEAR 3','Land a defining internship','One focused step, validated by live data.'],['YEAR 5','Start your dream career','Arrive prepared, confident and ahead.']]);

  const pillText = hasAiRoadmap ? 'YOUR AI-GENERATED FUTURE' : (isSchoolStage ? 'STREAM-FIRST ROADMAP' : 'YOUR NEXT FIVE YEARS');
  const title1 = hasAiRoadmap ? 'Your path to' : (isSchoolStage ? 'First choose the right stream.' : 'Your path to');
  const title2 = hasAiRoadmap ? (career || 'your future.') : (isSchoolStage ? 'Then earn the college.' : career || 'your future.');
  const desc = hasAiRoadmap ? 'A personalized timeline generated based on your profile and career goals.' : (isSchoolStage ? 'For school-stage learners, the roadmap begins with 11th-12th fit, then Class 12 performance and entrance results decide UG options.' : 'Every milestone connected. Every decision made with the destination in mind.');

  return (
    <section className="future section" id="how">
      <div className="future-orbit"/>
      <Reveal className="future-copy">
        <Pill>{pillText}</Pill>
        <h2>{title1}<br/><span>{title2}</span></h2>
        <p>{desc}</p>
      </Reveal>
      <div className="timeline">
        {items.map((x,i)=>(
          <Reveal className="timeline-item" key={`${x[0]}-${x[1]}-${i}`} delay={i*.1}>
            <div className="dot"><span/></div>
            <small>{x[0]}</small>
            <h3>{x[1]}</h3>
            <p>{x[2]}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CollegeSection({state}){
  const {needsIntermediate, visibleColleges, profile} = state;
  return (
    <section className="colleges section">
      <Reveal className="section-title">
        <Pill>{needsIntermediate?'11TH-12TH PATHWAYS':'COLLEGE INTELLIGENCE'}</Pill>
        <h2>{needsIntermediate?'Find the right 11th-12th launchpad.':'Not rankings.'}<br/><span>{needsIntermediate?'Before college even begins.':'Real alignment.'}</span></h2>
      </Reveal>
      <div className="college-grid">
        {visibleColleges.map((c,i)=>(
          <Reveal className="college-card" key={c.name} delay={i*.1}>
            <div className="college-top"><span className="college-icon">{c.name.slice(0,1)}</span><span>{String(i+1).padStart(2,'0')}</span></div>
            <h3>{c.name}</h3>
            <p>{c.city} - {needsIntermediate ? profile.stream : 'Computer Science'}</p>
            <div className="score-circle" style={{'--score':`${c.score*3.6}deg`,'--c':c.color}}>
              <div><b>{c.score}</b><small>MATCH</small></div>
            </div>
            <div className="college-stats">
              <div><small>{needsIntermediate?'FIT':'CHANCE'}</small><b>{c.chance}</b></div>
              <div><small>{needsIntermediate?'BOARD':'ROI'}</small><b>{c.roi}</b></div>
              <div><small>{needsIntermediate?'FORMAT':'AVG. CTC'}</small><b>{c.placement}</b></div>
            </div>
            <button>{needsIntermediate?'View 11th-12th pathway':'View match breakdown'} <ArrowRight size={16}/></button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Mentor({state,user,navigate,onAuth}){
  const [input,setInput] = useState('');
  const [loading,setLoading] = useState(false);
  const messages = state.mentorHistory;
  const setMessages = state.setMentorHistory;
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, loading]);

  const send = async () => {
    if (!user) {
      if (onAuth) onAuth('register');
      return;
    }
    const text = input.trim();
    if (!text || loading) return;
    const nextMessages = [...messages, {role:'user', content:text}];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    state.setSent(true);
    try {
      const response = await api.mentor({
        userEmail: user?.email,
        sessionId: user?.email || 'guest',
        message: text,
        career: state.career,
        profile: state.profile,
        history: nextMessages
      });
      setMessages([...nextMessages, {role:'assistant', content:response.answer, redirectTo:response.redirectTo}]);
    } catch {
      setMessages([...nextMessages, {role:'assistant', content:'The backend is not responding yet, so use the Colleges page for shortlisting and the Roadmap page for next steps.', redirectTo:'/colleges'}]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mentor section">
      <Reveal className="mentor-copy">
        <Pill>ALWAYS-ON GUIDANCE</Pill>
        <h2>Meet the mentor<br/>who knows <span>you.</span></h2>
        <p>Ask the messy questions. Get clear, context-aware answers at every turn.</p>
        <div className="mentor-note">
          <span><BrainCircuit/></span>
          <div><b>Built around your profile</b><p>Remembers your goals, constraints and progress.</p></div>
        </div>
      </Reveal>
      <Reveal className="chat">
        <div className="chat-head">
          <span className="ai-avatar"><Sparkles/></span>
          <div><b>Edu, your AI mentor</b><small><i/> ONLINE NOW</small></div>
          <button type="button">...</button>
        </div>
        <div className="messages" ref={messagesContainerRef}>
          {messages.map((msg,index)=>(
            <div className={`msg ${msg.role==='user'?'student':'ai'}`} key={`${msg.role}-${index}`}>
              {msg.role==='assistant' && <Sparkles size={15}/>}
              <div>
                {msg.content}
                {msg.redirectTo && (
                  <button
                    type="button"
                    className="mini-rec"
                    onClick={()=>navigate(msg.redirectTo)}
                    style={{width:'100%',cursor:'pointer',textAlign:'left'}}
                  >
                    <span>GO</span>
                    <div>
                      <b>{msg.redirectTo.replace('/','') || 'home'}</b>
                      <small>Open suggested page</small>
                    </div>
                    <ChevronRight/>
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="msg ai"><Sparkles size={15}/><div>Thinking through your profile...</div></div>}
        </div>
        <div className="chat-input">
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter') send(); }}
            placeholder="Ask anything about your future..."
            style={{flex:1,minWidth:0,background:'transparent',border:0,outline:0,color:'#f6f5f2',font:'inherit'}}
          />
          <button onClick={send} disabled={loading} style={{marginLeft:'auto',width:38,height:38,borderRadius:8,background:'#eee',color:'#111'}}><Send size={16}/></button>
        </div>
      </Reveal>
    </section>
  );
}

export function DayInLife({state}){
  const hasAiDay = Boolean(state?.matchResult?.dayInLife?.length > 0);
  const items = hasAiDay 
    ? state.matchResult.dayInLife 
    : [['08:00','Algorithms class'],['12:15','Lunch with the team'],['14:00','AI research lab'],['17:30','Coding club demo'],['21:00','Build your side project']];
  const icons = [Clock3, Coffee, Code2, GraduationCap, Moon];

  return (
    <section className="day section" id="stories">
      <Reveal className="day-head">
        <Pill>SEE YOURSELF THERE</Pill>
        <h2>{state?.career ? `A day in the life of a future ${state.career}.` : 'Tuesday, 14 August.'}<br/><span>Your future campus.</span></h2>
      </Reveal>
      <div className="day-grid">
        {items.map((x,i)=>{
          const Icon=icons[i] || Clock3;
          return <Reveal className={`day-card d${i}`} key={`${x[0]}-${x[1]}-${i}`} delay={i*.08}><Icon/><small>{x[0]}</small><b>{x[1]}</b></Reveal>;
        })}
      </div>
    </section>
  );
}

export function CTA({navigate}){
  return (
    <section className="cta section">
      <div className="cta-orb"/>
      <Reveal>
        <Pill>YOUR MOVE</Pill>
        <h2>Stop wondering.<br/><span>Start becoming.</span></h2>
        <p>One conversation can change the shape of your next five years.</p>
        <button onClick={()=>navigate('/discover')} className="button light">Find my future <ArrowRight/></button>
        <small>Free to start - No credit card - Takes 4 minutes</small>
      </Reveal>
    </section>
  );
}

export function ChanceCalculator({state, user, onAuth}) {
  const [targetCollege, setTargetCollege] = useState('');
  const [targetCourse, setTargetCourse] = useState('');
  const [academicScore, setAcademicScore] = useState('');
  const [entranceExams, setEntranceExams] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [counselingLogs, setCounselingLogs] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);



  const handlePredict = async () => {
    if (!user) {
      if (onAuth) onAuth('register');
      return;
    }
    if (!targetCollege || !targetCourse) return;
    
    setIsSimulating(true);
    setResult(null);
    setCounselingLogs([]);

    const logMessages = [
      "📡 Establishing secure tunnel to National Informatics Centre (NIC) servers...",
      "🔐 Handshaking with Joint Seat Allocation Authority (JoSAA/CSAB) Gateway...",
      `🔍 Fetching category-wise cutoffs for reservation bracket: [${category}]...`,
      "🔄 Matching Class 12 / Board marks & Entrance ranks against official seat matrices...",
      "⚡ Simulating JoSAA/CUET round 1 & round 2 seat allotment models...",
      "📋 Feasibility report compiled. Fetching final counselor recommendation..."
    ];

    for (let i = 0; i < logMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      setCounselingLogs(prev => [...prev, logMessages[i]]);
    }

    setLoading(true);
    setIsSimulating(false);
    
    try {
      const response = await api.predictChance({
        userEmail: user?.email,
        targetCollege,
        targetCourse,
        credentials: { academicScore, entranceExams, budget },
        category
      });
      setResult(response);
    } catch (e) {
      console.error(e);
      setResult({ status: 'Error', chancePercentage: 0, analysis: 'Could not fetch prediction. Please try again later.', alternatives: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="colleges section">
      <Reveal className="section-title">
        <Pill>CHANCE CALCULATOR</Pill>
        <h2>Check your joining possibility.<br/><span>Get honest feedback.</span></h2>
        <p style={{marginTop:'1rem', opacity:0.8, maxWidth:'600px'}}>Enter your dream college and course. EduMatch will check your profile and tell you if you have a shot—and suggest better fits if you don't.</p>
      </Reveal>
      
      <Reveal className="match-card" style={{maxWidth:'1000px', margin:'0 auto'}}>
        <div className="question-grid" style={{marginBottom:'2rem'}}>
          <label className="question-card" style={{margin:0}}>
            <span className="question-icon"><School size={20}/></span>
            <span className="question-copy">
              <small>TARGET COLLEGE</small>
              <b>Where do you want to study?</b>
            </span>
            <input className="field-input" value={targetCollege} onChange={e=>setTargetCollege(e.target.value)} placeholder="e.g. IIT Bombay, Delhi University" />
          </label>
          <label className="question-card" style={{margin:0}}>
            <span className="question-icon"><BookOpen size={20}/></span>
            <span className="question-copy">
              <small>TARGET COURSE</small>
              <b>What do you want to study?</b>
            </span>
            <input className="field-input" value={targetCourse} onChange={e=>setTargetCourse(e.target.value)} placeholder="e.g. Computer Science, BBA" />
          </label>
          <label className="question-card" style={{margin:0}}>
            <span className="question-icon"><GraduationCap size={20}/></span>
            <span className="question-copy">
              <small>ACADEMIC PERFORMANCE</small>
              <b>What are your latest marks?</b>
            </span>
            <input className="field-input" value={academicScore} onChange={e=>setAcademicScore(e.target.value)} placeholder="e.g. 95% in Class 12 CBSE" />
          </label>
          <label className="question-card" style={{margin:0}}>
            <span className="question-icon"><Award size={20}/></span>
            <span className="question-copy">
              <small>ENTRANCE EXAMS</small>
              <b>Any exam scores or ranks?</b>
            </span>
            <input className="field-input" value={entranceExams} onChange={e=>setEntranceExams(e.target.value)} placeholder="e.g. JEE Mains 98 percentile" />
          </label>
          <label className="question-card" style={{margin:0}}>
            <span className="question-icon"><Wallet size={20}/></span>
            <span className="question-copy">
              <small>RESERVATION CATEGORY</small>
              <b>Select category bracket</b>
            </span>
            <select className="field-input" value={category} onChange={e=>setCategory(e.target.value)} style={{background:'#11121a', border:'1px solid rgba(255,255,255,0.08)', color:'#fff'}}>
              <option>General</option>
              <option>OBC</option>
              <option>SC</option>
              <option>ST</option>
              <option>EWS</option>
            </select>
          </label>
          <label className="question-card" style={{margin:0}}>
            <span className="question-icon"><Wallet size={20}/></span>
            <span className="question-copy">
              <small>FINANCIAL BUDGET</small>
              <b>What is your yearly budget?</b>
            </span>
            <input className="field-input" value={budget} onChange={e=>setBudget(e.target.value)} placeholder="e.g. ₹2-3 lakh / year" />
          </label>
        </div>
        <button className="button full" onClick={handlePredict} disabled={loading || isSimulating || !targetCollege || !targetCourse}>
          {isSimulating ? 'Connecting to Servers...' : loading ? 'Analyzing...' : 'Check my chances'} <ArrowRight size={16}/>
        </button>

        {isSimulating && (
          <div style={{
            background:'#0d0e15',
            fontFamily:'monospace',
            padding:'1.25rem',
            borderRadius:'12px',
            border:'1px solid var(--violet)',
            marginTop:'1.5rem',
            color:'#b8ff6a',
            fontSize:'0.85rem',
            lineHeight:'1.6',
            boxShadow:'inset 0 0 10px rgba(0,0,0,0.5)'
          }}>
            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem', borderBottom:'1px solid rgba(255,255,255,0.08)', paddingBottom:'0.5rem'}}>
              <span className="pulse" style={{width:'8px', height:'8px', background:'#b8ff6a', borderRadius:'50%'}}></span>
              <strong style={{color:'#fff'}}>LIVE JOINT COUNSELING API TUNNEL</strong>
            </div>
            {counselingLogs.map((log, idx) => (
              <div key={idx} style={{animation:'fadeIn 0.2s ease'}}>
                {log}
              </div>
            ))}
            <div style={{opacity:0.6, marginTop:'0.5rem'}}>
              Tunnel connection: ACTIVE (Ping: {Math.floor(Math.random() * 40) + 10}ms)
            </div>
          </div>
        )}

        {result && (
          <div style={{background:'rgba(255,255,255,0.02)', padding:'2rem', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.08)', marginTop:'1rem'}}>
            <div style={{display:'flex', alignItems:'center', justifyType:'space-between', justifyContent:'space-between', marginBottom:'1.5rem', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'1rem'}}>
              <div>
                <h3 style={{fontSize:'1.5rem', margin:0, fontFamily:'var(--serif)'}}>Analysis Result</h3>
                <small style={{color:'var(--muted)', letterSpacing:'0.1em'}}>{result.chancePercentage}% Estimated Match (Category: {category})</small>
              </div>
              <div style={{background: result.status === 'Target' || result.status === 'Safety' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)', border: `1px solid ${result.status === 'Target' || result.status === 'Safety' ? '#4CAF50' : '#FF9800'}`, padding:'6px 16px', borderRadius:'100px', fontSize:'0.9rem', fontWeight:'bold', color: result.status === 'Target' || result.status === 'Safety' ? '#4CAF50' : '#FFB74D'}}>
                {result.status} Match
              </div>
            </div>
            
            {result.cutoffDetail && (
              <div style={{background:'rgba(144, 124, 255, 0.08)', borderLeft:'3px solid var(--violet)', padding:'12px 16px', borderRadius:'0 8px 8px 0', marginBottom:'1rem', fontSize:'0.95rem', color:'#d9d4ff'}}>
                <strong>Cutoff Check: </strong>{result.cutoffDetail}
              </div>
            )}
            
            <p style={{lineHeight:1.7, opacity:0.9, fontSize:'1.05rem'}}>{result.analysis}</p>

            {result.alternatives && result.alternatives.length > 0 && (
              <div style={{marginTop:'2rem'}}>
                <h4 style={{fontSize:'1.1rem', marginBottom:'1rem', color:'var(--cyan)', borderBottom:'1px dashed rgba(116, 229, 255, 0.2)', paddingBottom:'0.5rem'}}>
                  Better Realistic Fits Based On Your Input
                </h4>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'1rem'}}>
                  {result.alternatives.map((alt, i) => (
                    <div key={i} style={{background:'#11121a', border:'1px solid rgba(116, 229, 255, 0.15)', padding:'1rem', borderRadius:'12px', transition:'transform 0.2s'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem'}}>
                        <b style={{fontSize:'1.05rem', color:'#fff'}}>{alt.name}</b>
                        <span style={{background:'var(--cyan)', color:'#000', fontSize:'0.75rem', fontWeight:'bold', padding:'2px 6px', borderRadius:'6px'}}>{alt.matchPercentage}% Match</span>
                      </div>
                      <p style={{margin:0, fontSize:'0.85rem', color:'var(--muted)', lineHeight:1.5}}>{alt.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Reveal>
    </section>
  );
}
