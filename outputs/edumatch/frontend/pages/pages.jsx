import { useState, useEffect } from 'react';
import { ArrowRight, Lock, Target, User, GraduationCap, Compass, BookOpen, WalletCards, MapPin, Trophy, Layers, Star } from 'lucide-react';
import { CareerSelector } from '../sections/CareerSelector';
import { Hero } from '../sections/Hero';
import { ProfileForm } from '../sections/ProfileForm';
import { MatchSection } from '../sections/MatchSection';
import { CollegeSection, DayInLife, Features, FutureTimeline, Mentor, ChanceCalculator } from '../sections/MoreSections';
import AboutPage from '../sections/AboutPage';
import { Pill } from '../components/ui';

export function HomePage({state,navigate}){
  return <><Hero navigate={navigate}/><HomeHub navigate={navigate}/></>;
}

export function DiscoverPage({state,discoverPrompt,clearDiscoverPrompt}){
  return <PageShell eyebrow="STEP 01" title="Discover your direction" text="Pick a goal or type your own weird, specific, ambitious path."><CareerSelector {...state} discoverPrompt={discoverPrompt} clearDiscoverPrompt={clearDiscoverPrompt}/></PageShell>;
}

export function ProfilePage({state,navigate,user}){
  return <PageShell eyebrow="STEP 02" title="Build your profile" text="Academic stage, budget, location, stream and exams live here."><ProfileForm state={state} navigate={navigate} user={user}/></PageShell>;
}

export function ResultsPage({state,navigate}){
  return <PageShell eyebrow="STEP 03" title="See your match result" text="This page shows the current recommendation logic for your selected stage."><MatchSection state={state} navigate={navigate}/></PageShell>;
}

export function PlatformPage({navigate}){
  return <PageShell eyebrow="PLATFORM" title="EduMatch intelligence layer" text="The engine pieces behind matching, prediction and roadmaps."><Features navigate={navigate}/></PageShell>;
}

export function RoadmapPage({state}){
  return <PageShell eyebrow="ROADMAP" title="Your stream-wise roadmap" text="For 10th, 11th and 12th students, the roadmap starts before UG college prediction."><FutureTimeline state={state}/></PageShell>;
}

export function CollegesPage({state}){
  return <PageShell eyebrow="COLLEGES" title="Recommended institutions" text="School-stage users see 11th-12th pathways first. UG colleges unlock after Class 12 and entrance results."><CollegeSection state={state}/></PageShell>;
}

export function MentorPage({state,user,navigate,onAuth}){
  return <PageShell eyebrow="MENTOR" title="Ask Edu, your AI mentor" text="A separate guidance space for messy questions and next decisions."><Mentor state={state} user={user} navigate={navigate} onAuth={onAuth}/></PageShell>;
}

export function StoriesPage({state}){
  return <PageShell eyebrow="STORIES" title="See yourself there" text="A future-campus simulation page."><DayInLife state={state}/></PageShell>;
}

export function ChancePage({state, user, onAuth}){
  return <PageShell eyebrow="CHANCE" title="Admission Possibility" text="Search any college and see if you have a realistic shot."><ChanceCalculator state={state} user={user} onAuth={onAuth}/></PageShell>;
}

export function NotFoundPage({navigate}){
  return <HomePage navigate={navigate}/>;
}

function PageShell({eyebrow,title,text,children}){
  return <div className="route-page"><section className="page-hero section"><Pill>{eyebrow}</Pill><h1>{title}</h1><p>{text}</p></section>{children}</div>;
}

function HomeHub({navigate}){
  const cards = [
    ['/discover','Discover','Choose from curated careers or type your own path.'],
    ['/profile','Profile','Enter education stage, marks, exams, budget and location.'],
    ['/results','Results','View match logic, UG lock status and path analysis.'],
    ['/roadmap','Roadmap','See the stream-wise plan before college decisions.'],
    ['/colleges','Colleges','Browse 11th-12th pathways or UG matches.'],
    ['/chance', 'Chance Calculator', 'Search a college and check your admission chances.'],
    ['/mentor','Mentor','Ask guidance questions in a dedicated mentor page.'],
    ['/stories','Stories','Experience a day in the life on your future campus.']
  ];
  return <section className="page-hub section"><Pill>CHOOSE A PAGE</Pill><h2>EduMatch is now split into<br/><span>separate pages.</span></h2><div className="page-grid">{cards.map(([to,title,text])=><button key={to} onClick={()=>navigate(to)}><span>{title}</span><p>{text}</p><ArrowRight size={18}/></button>)}</div></section>;
}


export { AboutPage };

export function DashboardPage({state, user, navigate, onAuth}){
  if (!user) {
    return (
      <PageShell eyebrow="DASHBOARD" title="Your Personal Dashboard" text="Unlock customized recommendations, roadmaps, and profile persistence.">
        <section className="dashboard-locked section">
          <div className="locked-card">
            <div className="lock-icon"><Lock size={32}/></div>
            <h3>Access Denied</h3>
            <p>Please sign in or register to save your goals, build a profile, and view your custom dashboard.</p>
            <div className="action-buttons">
              <button className="button" onClick={() => onAuth('login')}>Sign In</button>
              <button className="button ghost" onClick={() => onAuth('register')}>Create Account</button>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  const { career, profile, hasSelectedGoal, matchesGenerated, matchResult, loadingSavedProfile } = state;

  // WhatsApp Automation states (Item 7)
  const [shareStep, setShareStep] = useState(0); // 0 = idle, 1 = compiling, 2 = redirecting
  const [shareLogs, setShareLogs] = useState([]);

  // Yearly College Pulse-check states (Item 8)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewYear, setReviewYear] = useState('Year 1');
  const [reviewCollegeName, setReviewCollegeName] = useState('');
  const [ratingAcademics, setRatingAcademics] = useState(5);
  const [ratingCampus, setRatingCampus] = useState(5);
  const [ratingWorkload, setRatingWorkload] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [savedReviews, setSavedReviews] = useState(() => {
    try { return JSON.parse(localStorage.getItem('edumatch_college_reviews')) || []; }
    catch { return []; }
  });

  const triggerWhatsAppShare = async () => {
    setShareStep(1);
    setShareLogs([]);
    const logs = [
      "🔄 Loading profile parameters...",
      "📦 Formatting academic scores and entrance results...",
      "🏫 Retrieving top-match college lists...",
      "💼 Mapping Entry-to-Advanced level job paths...",
      "📑 Packaging data into structured message template...",
      "🚀 Initializing WhatsApp API endpoint..."
    ];
    for (let i = 0; i < logs.length; i++) {
      await new Promise(r => setTimeout(r, 300));
      setShareLogs(prev => [...prev, logs[i]]);
    }
    
    const collegesStr = (matchResult?.colleges || [])
      .slice(0, 3)
      .map(c => `• ${c.name} (${c.score}% Match, Avg CTC: ${c.placement})`)
      .join('\n');
      
    const roadmapStr = (matchResult?.roadmap || [])
      .slice(0, 4)
      .map(r => `• [${r[0]}] ${r[1]} - ${r[2]}`)
      .join('\n');

    const jobStr = (matchResult?.jobProgression || [])
      .map(j => `• [${j.level}] ${j.title} (${j.salary})`)
      .join('\n');

    const messageText = `*EduMatch AI Student Intelligence Report* 🚀\n` +
      `-------------------------------------------\n` +
      `*Student:* ${user.name}\n` +
      `*Target Career:* ${career}\n` +
      `*Academic Stage:* ${profile.educationStage} (${profile.stream || 'N/A'})\n` +
      `*Budget Bracket:* ${profile.budget || 'N/A'}\n\n` +
      `*Top Recommended Colleges:*\n${collegesStr || 'N/A'}\n\n` +
      `*Career Progression:*\n${jobStr || 'N/A'}\n\n` +
      `*Actionable Roadmap:*\n${roadmapStr || 'N/A'}\n\n` +
      `*Generated via EduMatch AI* 🎓`;

    const encoded = encodeURIComponent(messageText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    
    setShareStep(2);
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setShareStep(0);
    }, 1000);
  };

  const handleSaveReview = () => {
    const newReview = {
      id: Date.now(),
      college: reviewCollegeName || "Your College",
      year: reviewYear,
      ratings: { academics: ratingAcademics, campus: ratingCampus, workload: ratingWorkload },
      comment: reviewComment,
      date: new Date().toLocaleDateString()
    };
    const updated = [newReview, ...savedReviews];
    setSavedReviews(updated);
    localStorage.setItem('edumatch_college_reviews', JSON.stringify(updated));
    setReviewModalOpen(false);
    
    // Clear fields
    setReviewComment('');
    alert(`Thank you for submitting your ${reviewYear} review! Your roadmap has been adjusted based on this yearly check-in.`);
  };

  if (loadingSavedProfile) {
    return (
      <PageShell eyebrow="DASHBOARD" title={`Welcome, ${user.name}`} text="Access your matching intelligence and roadmaps.">
        <section className="dashboard-loading section">
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Loading your saved workspace...</p>
          </div>
        </section>
      </PageShell>
    );
  }

  if (!hasSelectedGoal) {
    return (
      <PageShell eyebrow="DASHBOARD" title={`Welcome, ${user.name}`} text="Start your career matching and profile creation journey.">
        <section className="dashboard-setup section">
          <div className="setup-steps-container">
            <div className="setup-header">
              <h2>Let's build your matching profile</h2>
              <p>Your intelligence board is empty. Complete these quick steps to generate your first roadmap.</p>
            </div>
            <div className="steps-grid">
              <div className="step-card active">
                <span className="step-num">01</span>
                <h3>Discover Direction</h3>
                <p>Pick a pre-seeded goal or type your own weird, specific, ambitious career path.</p>
                <button className="button button-sm" onClick={() => navigate('/discover')}>Discover Path <ArrowRight size={14}/></button>
              </div>
              <div className="step-card locked">
                <span className="step-num">02</span>
                <h3>Build Profile</h3>
                <p>Add your academic stage, grades, location, entrance exams, and budget details.</p>
              </div>
              <div className="step-card locked">
                <span className="step-num">03</span>
                <h3>Generate Matches</h3>
                <p>Unlock custom AI recommendations, stream-wise roadmaps, and college fit prediction.</p>
              </div>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  if (!matchesGenerated) {
    return (
      <PageShell eyebrow="DASHBOARD" title={`Welcome, ${user.name}`} text="Complete your profile signals to unlock college matching.">
        <section className="dashboard-setup section">
          <div className="setup-steps-container">
            <div className="setup-header">
              <h2>Almost there!</h2>
              <p>You selected <strong>"{career}"</strong> as your goal. Now, complete your profile signals.</p>
            </div>
            <div className="steps-grid">
              <div className="step-card completed">
                <span className="step-num">✓</span>
                <h3>Career Selected</h3>
                <p>Your target: <strong>{career}</strong></p>
                <button className="text-btn" onClick={() => navigate('/discover')} style={{textDecoration:'underline'}}>Change goal</button>
              </div>
              <div className="step-card active">
                <span className="step-num">02</span>
                <h3>Build Profile</h3>
                <p>Academic boards, stream selection, grades, entrance exams, and budget parameters.</p>
                <button className="button button-sm" onClick={() => navigate('/profile')}>Complete Profile <ArrowRight size={14}/></button>
              </div>
              <div className="step-card locked">
                <span className="step-num">03</span>
                <h3>Generate Matches</h3>
                <p>Unlock custom AI recommendations, stream-wise roadmaps, and college fit prediction.</p>
              </div>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="INTELLIGENCE DASHBOARD" title={`Workspace: ${user.name}`} text="Your saved career path, profile metrics, and matched recommendations.">
      <section className="dashboard-content section">
        <div className="dashboard-grid">
          
          <div className="dash-card goal-summary-card">
            <div className="card-badge"><Target size={12}/> Target Career</div>
            <h2>{career}</h2>
            <div className="goal-meta-grid">
              <div>
                <small>CONFIDENCE</small>
                <b>{state.currentMeta?.[0] || '100%'}</b>
              </div>
              <div>
                <small>EARNING MODEL</small>
                <b>{state.currentMeta?.[1] || 'Flexible'}</b>
              </div>
            </div>
            <p className="goal-focus"><strong>Focus:</strong> {state.currentMeta?.[2]} — {state.currentMeta?.[3]}</p>
            <div className="card-actions">
              <button className="button button-sm ghost" onClick={() => navigate('/discover')}>Change Goal</button>
              <button className="button button-sm" onClick={() => navigate('/results')}>View Full Match Analysis</button>
            </div>
          </div>

          <div className="dash-card profile-summary-card">
            <div className="card-badge"><User size={12}/> Academic Profile</div>
            <div className="profile-metrics-list">
              <div className="metric-row">
                <span className="label"><GraduationCap size={14}/> Stage</span>
                <span className="value">{profile.educationStage}</span>
              </div>
              {profile.stream && (
                <div className="metric-row">
                  <span className="label"><Compass size={14}/> Stream</span>
                  <span className="value">{profile.stream}</span>
                </div>
              )}
              {profile.board && (
                <div className="metric-row">
                  <span className="label"><BookOpen size={14}/> Board</span>
                  <span className="value">{profile.board}</span>
                </div>
              )}
              <div className="metric-row">
                <span className="label"><WalletCards size={14}/> Budget</span>
                <span className="value">{profile.budget}</span>
              </div>
              {profile.currentLocation && (
                <div className="metric-row">
                  <span className="label"><MapPin size={14}/> Location</span>
                  <span className="value">{profile.currentLocation}</span>
                </div>
              )}
            </div>
            <div className="card-actions">
              <button className="button button-sm ghost" onClick={() => navigate('/profile')}>Edit Profile Signals</button>
            </div>
          </div>

          <div className="dash-card colleges-preview-card">
            <div className="card-badge"><Trophy size={12}/> Top Recommendations</div>
            {state.isSchoolStage ? (
              <div className="roadmap-stub">
                <h4>Stream Roadmap Ready</h4>
                <p>For your junior college stage, the roadmap is locked on intermediate curriculum preparation.</p>
                <button className="button button-sm" onClick={() => navigate('/roadmap')}>View Stream Roadmap <ArrowRight size={14}/></button>
              </div>
            ) : matchResult?.colleges?.length ? (
              <div className="colleges-mini-list">
                {matchResult.colleges.slice(0, 3).map((c, idx) => (
                  <div className="college-mini-item" key={idx}>
                    <span className="col-match" style={{color: c.color}}>{c.score}% Match</span>
                    <div className="col-info">
                      <b>{c.name}</b>
                      <small>{c.city}, {c.state}</small>
                    </div>
                    <span className="col-chance">{c.chance}</span>
                  </div>
                ))}
                <button className="button button-sm full" onClick={() => navigate('/colleges')}>Browse All Colleges <ArrowRight size={14}/></button>
              </div>
            ) : (
              <div className="roadmap-stub">
                <p>No college recommendations generated yet.</p>
              </div>
            )}
          </div>

          {/* WhatsApp Automation Integration (Item 7) */}
          <div className="dash-card whatsapp-automation-card" style={{
            background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.05) 0%, rgba(18, 140, 126, 0.05) 100%)',
            border: '1px solid rgba(37, 211, 102, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div className="card-badge" style={{background:'rgba(37, 211, 102, 0.15)', color:'#25D366'}}>
              <span>💬</span> WhatsApp Integration
            </div>
            <h3>WhatsApp Automation</h3>
            <p style={{fontSize:'0.9rem', opacity:0.8, marginBottom:'1rem'}}>Compile your match analysis, syllabus profiles, and roadmap into a beautiful report and send it instantly to parent/mentor phones.</p>
            
            {shareStep === 1 && (
              <div style={{
                background: '#0d0e15',
                padding: '0.75rem',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#25D366',
                marginBottom: '1rem',
                border: '1px solid rgba(37, 211, 102, 0.2)'
              }}>
                {shareLogs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            )}

            {shareStep === 2 && (
              <div style={{
                color: '#25D366',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span className="spinner" style={{width:16, height:16, border:'2px solid #25D366', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 1s linear infinite'}}></span>
                Redirecting to WhatsApp API...
              </div>
            )}

            <button 
              className="button" 
              onClick={triggerWhatsAppShare} 
              disabled={shareStep > 0}
              style={{
                background: '#25D366',
                color: '#fff',
                border: 'none',
                fontWeight: 'bold',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              Forward Report to WhatsApp
            </button>
          </div>

          {/* Yearly College Life Reviews & Pulse-check Modal (Item 8) */}
          <div className="dash-card reviews-feed-card" style={{
            border: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative'
          }}>
            <div className="card-badge">
              <span>📋</span> Yearly pulse checks
            </div>
            <h3>College Life Reviews</h3>
            <p style={{fontSize:'0.9rem', opacity:0.8, marginBottom:'1rem'}}>
              Track your year-by-year college feedback. Check-in after each completed academic year.
            </p>
            
            <button 
              type="button" 
              onClick={() => {
                setReviewCollegeName(matchResult?.colleges?.[0]?.name || '');
                setReviewModalOpen(true);
              }} 
              className="button button-sm ghost"
              style={{marginBottom:'1rem', width:'100%', justifyContent:'center'}}
            >
              + Log New Year pulse check
            </button>

            <div style={{
              display:'flex', 
              flexDirection:'column', 
              gap:'0.75rem', 
              maxHeight:'150px', 
              overflowY:'auto',
              paddingRight:'0.25rem'
            }}>
              {savedReviews.length === 0 ? (
                <p style={{fontSize:'0.85rem', opacity:0.6, margin:0, textAlign:'center'}}>No yearly pulse checks logged yet.</p>
              ) : (
                savedReviews.map(rev => (
                  <div key={rev.id} style={{
                    background:'rgba(255,255,255,0.02)',
                    border:'1px solid rgba(255,255,255,0.05)',
                    padding:'0.75rem',
                    borderRadius:'8px',
                    fontSize:'0.85rem'
                  }}>
                    <div style={{display:'flex', justifyType:'space-between', justifyContent:'space-between', marginBottom:'0.25rem'}}>
                      <b>{rev.college} ({rev.year})</b>
                      <small style={{opacity:0.6}}>{rev.date}</small>
                    </div>
                    <div style={{display:'flex', gap:'0.5rem', fontSize:'0.75rem', color:'var(--cyan)', marginBottom:'0.25rem'}}>
                      <span>Acad: {rev.ratings.academics}★</span>
                      <span>Social: {rev.ratings.campus}★</span>
                      <span>Workload: {rev.ratings.workload}★</span>
                    </div>
                    {rev.comment && <p style={{margin:0, opacity:0.8, fontSize:'0.8rem', lineHeight:1.4}}>{rev.comment}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dash-card hub-links-card">
            <div className="card-badge"><Layers size={12}/> Intelligence Hub</div>
            <div className="hub-links-grid">
              <button className="hub-btn" onClick={() => navigate('/roadmap')}>
                <b>Roadmap</b>
                <p>Timeline roadmap and preparations steps</p>
              </button>
              <button className="hub-btn" onClick={() => navigate('/chance')}>
                <b>Chance Calculator</b>
                <p>Predict admission probability</p>
              </button>
              <button className="hub-btn" onClick={() => navigate('/mentor')}>
                <b>Ask Edu AI</b>
                <p>Get career guidance in real time</p>
              </button>
              <button className="hub-btn" onClick={() => navigate('/stories')}>
                <b>Stories</b>
                <p>Simulate campus life</p>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Yearly College Life Pulse Check Modal (Item 8) */}
      {reviewModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: '#11121a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{fontSize:'1.5rem', fontFamily:'var(--serif)', color:'#fff', marginBottom:'0.5rem'}}>
              🎓 College Life pulse-check
            </h3>
            <p style={{color:'var(--muted)', fontSize:'0.9rem', marginBottom:'1.5rem'}}>
              Log your annual review to align your roadmap with actual experiences.
            </p>

            <div style={{display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'1.5rem'}}>
              <label style={{display:'flex', flexDirection:'column', gap:'0.25rem'}}>
                <span style={{fontSize:'0.8rem', fontWeight:'bold', color:'var(--muted)'}}>COLLEGE NAME</span>
                <input 
                  type="text" 
                  value={reviewCollegeName} 
                  onChange={e => setReviewCollegeName(e.target.value)} 
                  placeholder="e.g. BITS Pilani" 
                  style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px', color:'#fff'}}
                />
              </label>

              <label style={{display:'flex', flexDirection:'column', gap:'0.25rem'}}>
                <span style={{fontSize:'0.8rem', fontWeight:'bold', color:'var(--muted)'}}>WHICH YEAR COMPLETED?</span>
                <select 
                  value={reviewYear} 
                  onChange={e => setReviewYear(e.target.value)} 
                  style={{background:'#11121a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px', color:'#fff', width:'100%'}}
                >
                  <option>Year 1</option>
                  <option>Year 2</option>
                  <option>Year 3</option>
                  <option>Year 4</option>
                </select>
              </label>

              <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                <span style={{fontSize:'0.8rem', fontWeight:'bold', color:'var(--muted)'}}>RATINGS (1 to 5 Stars)</span>
                {[
                  ['Academics & Faculty', ratingAcademics, setRatingAcademics],
                  ['Campus & Social Life', ratingCampus, setRatingCampus],
                  ['Workload & Stress Fit', ratingWorkload, setRatingWorkload]
                ].map(([label, val, setter], index) => (
                  <div key={`${label}-${index}`} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span style={{fontSize:'0.85rem', color:'#dedee3'}}>{label}</span>
                    <div style={{display:'flex', gap:'0.2rem'}}>
                      {Array.from({length:5}, (_, i) => (
                        <button 
                          key={i} 
                          type="button" 
                          onClick={() => setter(i+1)}
                          style={{background:'none', border:'none', cursor:'pointer', color: i < val ? 'var(--cyan)' : 'rgba(255,255,255,0.1)'}}
                        >
                          <Star size={18} fill={i < val ? 'var(--cyan)' : 'none'}/>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <label style={{display:'flex', flexDirection:'column', gap:'0.25rem'}}>
                <span style={{fontSize:'0.8rem', fontWeight:'bold', color:'var(--muted)'}}>SHARE YOUR EXPERIENCES</span>
                <textarea 
                  value={reviewComment} 
                  onChange={e => setReviewComment(e.target.value)} 
                  placeholder="How was the workload, social scene, internships, or placements? Be honest." 
                  rows={4}
                  style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px', color:'#fff', resize:'vertical', fontSize:'0.9rem'}}
                />
              </label>
            </div>

            <div style={{display:'flex', gap:'1rem'}}>
              <button 
                type="button" 
                onClick={() => setReviewModalOpen(false)}
                className="button ghost"
                style={{flex:1}}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSaveReview}
                className="button"
                style={{flex:1}}
              >
                Submit pulse check
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
