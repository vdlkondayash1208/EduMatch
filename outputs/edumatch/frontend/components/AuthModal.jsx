import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, Mail, Sparkles, User, X } from 'lucide-react';

export function AuthModal({open, mode='login', onClose, onSuccess}){
  const [authMode,setAuthMode] = useState(mode);
  const [form,setForm] = useState({name:'', email:'', password:''});
  const [error,setError] = useState(null);

  // Sync state if mode changes externally
  useEffect(() => {
    setAuthMode(mode);
  }, [mode]);

  // Clear form when modal is opened or closed, or when active mode switches
  useEffect(() => {
    setForm({name:'', email:'', password:''});
    setError(null);
  }, [open, authMode]);

  const [isRegisteredSuccess, setIsRegisteredSuccess] = useState(false);
  const update = (key,value) => setForm(current => ({...current,[key]:value}));

  const checkPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'transparent', tips: '' };
    
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[^A-Za-z0-9]/.test(pass);
    
    let tips = [];
    
    if (pass.length < 6) {
      tips.push("Must be 6+ characters");
    }
    if (!hasUpperCase) {
      tips.push("Add a capital letter");
    }
    if (!hasSymbol) {
      tips.push("Add a special character");
    }
    
    // Strict requirements check
    if (pass.length < 6 || !hasUpperCase || !hasSymbol) {
      return {
        score: 1,
        label: 'Weak',
        color: '#ff5555',
        tips: tips.join(' • ')
      };
    }
    
    // If strict requirements are met, check strong criteria
    const hasLength8 = pass.length >= 8;
    const hasDigit = hasNumber;
    const hasLower = hasLowerCase;
    
    if (hasLength8 && hasDigit && hasLower) {
      return {
        score: 3,
        label: 'Strong',
        color: '#c8ff79',
        tips: 'Looking good! Strong password.'
      };
    } else {
      let advice = [];
      if (!hasLength8) advice.push("Make it 8+ characters");
      if (!hasDigit) advice.push("Add a number");
      return {
        score: 2,
        label: 'Moderate',
        color: '#ffb74d',
        tips: advice.length > 0 ? advice.join(' • ') : 'Looking good! Moderate password.'
      };
    }
  };

  const strength = checkPasswordStrength(form.password);

  const submit = async e => {
    e.preventDefault();
    setError(null);
    if (authMode === 'register' && strength.label === 'Weak') {
      setError('Please create a stronger password (at least Moderate).');
      return;
    }
    const fallbackName = form.email ? form.email.split('@')[0] : 'Future Builder';
    const result = await onSuccess({
      name: form.name || fallbackName,
      email: form.email || 'student@edumatch.ai',
      password: form.password,
      mode: authMode
    });
    setForm(current => ({...current, password: ''}));
    if (result && result.registered) {
      setIsRegisteredSuccess(true);
      setTimeout(() => {
        setIsRegisteredSuccess(false);
        setAuthMode('login');
      }, 4500);
    } else if (result) {
      setError(result);
    }
  };

  return (
    <AnimatePresence>
      {open && <motion.div className="auth-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
        <motion.div className="auth-modal" initial={{opacity:0,y:38,scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:.97}} transition={{duration:.35,ease:[.2,.8,.2,1]}}>
          <button className="auth-close" onClick={onClose} aria-label="Close auth modal"><X size={18}/></button>
          {isRegisteredSuccess ? (
            <div style={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '60px 40px',
              background: 'radial-gradient(circle at center, rgba(144, 124, 255, 0.08), transparent 70%)',
              minHeight: '500px'
            }}>
              <motion.div
                initial={{ scale: 0, rotateY: 180, rotateX: 45 }}
                animate={{ scale: 1, rotateY: 0, rotateX: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c8ff79 0%, #74e5ff 100%)',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 20px 40px rgba(116, 229, 255, 0.3), inset 0 -6px 12px rgba(0,0,0,0.15), inset 0 6px 12px rgba(255,255,255,0.3)',
                  marginBottom: '30px',
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#07080b" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{
                    width: '46px',
                    height: '46px',
                    filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'
                  }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>
              <h2 style={{
                fontFamily: 'var(--serif)',
                fontSize: '36px',
                margin: '0 0 16px',
                color: '#fff',
                letterSpacing: '-0.03em'
              }}>
                Thanks for the registration!
              </h2>
              <p style={{
                color: 'var(--muted)',
                fontSize: '15px',
                maxWidth: '380px',
                lineHeight: '1.6',
                margin: '0 auto 20px'
              }}>
                Your EduMatch profile has been created successfully. Please log in to access your dashboard.
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--line)',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                color: 'var(--cyan)'
              }}>
                <span className="spinner" style={{
                  width: 14, 
                  height: 14, 
                  border: '2px solid var(--cyan)', 
                  borderTopColor: 'transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite'
                }}></span>
                Redirecting you to Login...
              </div>
            </div>
          ) : (
            <>
              <div className="auth-art">
                <span className="auth-orb"/><span className="auth-orb small"/>
                <div className="auth-badge"><Sparkles size={15}/> Secure EduMatch profile</div>
                <h2>{authMode==='register'?'Create your future profile':'Welcome back, builder'}</h2>
                <p>{authMode==='register'?'Save your dream, marks, stream choices, college preferences and roadmap in one synced profile.':'Sign in to continue building your personalized college and career path.'}</p>
                <div className="auth-proof"><b>Why login?</b><span>Your selected goal stays synced across Discover, Profile, Results, Roadmap and Colleges.</span></div>
              </div>
              <form className="auth-form" onSubmit={submit}>
                <div className="auth-tabs">
                  <button type="button" className={authMode==='login'?'active':''} onClick={()=>setAuthMode('login')}>Login</button>
                  <button type="button" className={authMode==='register'?'active':''} onClick={()=>setAuthMode('register')}>Register</button>
                </div>
                <div>
                  <small>{authMode==='register'?'START YOUR ACCOUNT':'CONTINUE SECURELY'}</small>
                  <h3>{authMode==='register'?'Register to build profile':'Login required'}</h3>
                </div>
                {authMode==='register' && <label className="auth-field"><User size={16}/><input name="name" autoComplete="name" value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Your name" required/></label>}
                <label className="auth-field"><Mail size={16}/><input type="email" name="email" autoComplete="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="Email address" required/></label>
                {error && <div style={{color:'#ff5555', fontSize:'0.85rem', marginTop:'-0.5rem', marginBottom:'0.5rem', fontWeight:'500'}}>{error}</div>}
                <label className="auth-field"><Lock size={16}/><input type="password" name="password" autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} value={form.password} onChange={e=>update('password',e.target.value)} placeholder="Password" required minLength={6}/></label>
                {authMode === 'register' && form.password && (
                  <div style={{ marginTop: '0.25rem', marginBottom: '0.75rem', padding: '0 4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Password Security:</span>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: strength.color }}>{strength.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
                      <div style={{ flex: 1, background: strength.score >= 1 ? strength.color : 'transparent', transition: 'all 0.3s' }}></div>
                      <div style={{ flex: 1, background: strength.score >= 2 ? strength.color : 'transparent', transition: 'all 0.3s' }}></div>
                      <div style={{ flex: 1, background: strength.score >= 3 ? strength.color : 'transparent', transition: 'all 0.3s' }}></div>
                    </div>
                    <div style={{ fontSize: '10px', color: strength.label === 'Strong' ? 'var(--lime)' : 'var(--muted)', lineHeight: '1.4' }}>
                      {strength.tips}
                    </div>
                  </div>
                )}
                <button className="button auth-submit" type="submit" disabled={authMode === 'register' && strength.label === 'Weak'}>{authMode==='register'?'Create account':'Login and continue'} <ArrowRight size={16}/></button>
                <p className="auth-switch">{authMode==='register'?'Already have an account?':'New to EduMatch?'} <button type="button" onClick={()=>setAuthMode(authMode==='register'?'login':'register')}>{authMode==='register'?'Login':'Register'}</button></p>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  );
}
