import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar, Footer } from './components/Layout';
import { AuthModal } from './components/AuthModal';
import { useEduMatch } from './hooks/useEduMatch';
import { CollegesPage, DiscoverPage, HomePage, MentorPage, NotFoundPage,  PlatformPage,
  ProfilePage,
  ResultsPage,
  RoadmapPage,
  StoriesPage,
  ChancePage,
  DashboardPage,
  AboutPage
} from './pages/pages';
import { api } from './lib/api';

const BASE = import.meta.env.BASE_URL; // '/EduMatch/' — set by vite.config.js
const BASE_REGEX = new RegExp(`^${BASE}`);

function stripBase(url) {
  const s = url.replace(BASE_REGEX, '');
  return '/' + s || '/';
}

function fullUrl(rel) {
  return BASE.replace(/\/$/, '') + rel;
}

function App(){
  const [menu,setMenu] = useState(false);
  const [path,setPath] = useState(stripBase(window.location.pathname));
  const [user,setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('edumatch_user')) || null; }
    catch { return null; }
  });
  const [authOpen,setAuthOpen] = useState(false);
  const [authMode,setAuthMode] = useState('login');
  const [pendingPath,setPendingPath] = useState(null);
  const [discoverPrompt,setDiscoverPrompt] = useState(false);
  const root = useRef(null);
  const stateRef = useRef(null);
  const protectedRoutes = [];
  const goalRequiredRoutes = ['/profile','/results','/roadmap','/colleges','/stories'];
  const navigate = (next, options = {}) => {
    if (goalRequiredRoutes.includes(next) && !options.allowProfile && !stateRef.current?.hasSelectedGoal) {
      setDiscoverPrompt(true);
      next = '/discover';
    }
    const matchRequiredRoutes = ['/results', '/roadmap', '/colleges', '/stories'];
    if (matchRequiredRoutes.includes(next) && !options.allowResults && !stateRef.current?.matchesGenerated) {
      next = '/profile';
    }
    if (protectedRoutes.includes(next) && !user) {
      setPendingPath(next);
      setAuthMode('register');
      setAuthOpen(true);
      return;
    }
    if (stripBase(window.location.pathname) !== next) window.history.pushState({},'',fullUrl(next));
    setPath(next);
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const openAuth = mode => { setAuthMode(mode); setAuthOpen(true); };
  const completeAuth = async account => {
    let savedAccount = account;
    try {
      savedAccount = await api.auth(account);
      if (savedAccount.error) {
        return savedAccount.error;
      }
    } catch (err) {
      return err.message || "Network error occurred";
    }
    if (account.mode === 'register') {
      return { registered: true };
    }
    setUser(savedAccount);
    localStorage.setItem('edumatch_user', JSON.stringify(savedAccount));
    setAuthOpen(false);
    const next = pendingPath || (path === '/' ? '/discover' : path);
    setPendingPath(null);
    if (stripBase(window.location.pathname) !== next) window.history.pushState({},'',fullUrl(next));
    setPath(next);
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('edumatch_user');
    navigate('/');
  };
  const state = useEduMatch(navigate, user, openAuth);
  stateRef.current = state;
  const {scrollYProgress} = useScroll();
  const progress = useSpring(scrollYProgress,{stiffness:90,damping:25});

  useEffect(() => {
    const lenis = new Lenis({duration:1.15,smoothWheel:true});
    let id;
    const raf = time => { lenis.raf(time); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  },[]);

  useEffect(() => {
    const onPop = () => setPath(stripBase(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  },[]);

  useEffect(() => {
    if (goalRequiredRoutes.includes(path) && !state.hasSelectedGoal) {
      setDiscoverPrompt(true);
      navigate('/discover');
      return;
    }
    if (['/results', '/roadmap', '/colleges', '/stories'].includes(path) && !state.matchesGenerated) {
      navigate('/profile');
      return;
    }
    if (protectedRoutes.includes(path) && !user) {
      setPendingPath(path);
      setAuthMode('register');
      setAuthOpen(true);
    }
  },[path,user,state.matchesGenerated,state.hasSelectedGoal]);

  const pages = {
    '/': <HomePage state={state} navigate={navigate}/>,
    '/discover': <DiscoverPage state={state} discoverPrompt={discoverPrompt} clearDiscoverPrompt={()=>setDiscoverPrompt(false)}/>,
    '/profile': <ProfilePage state={state} navigate={navigate} user={user}/>,
    '/results': <ResultsPage state={state} navigate={navigate}/>,
    '/platform': <PlatformPage navigate={navigate}/>,
    '/roadmap': <RoadmapPage state={state}/>,
    '/colleges': <CollegesPage state={state}/>,
    '/chance': <ChancePage state={state} user={user} onAuth={openAuth}/>,
    '/mentor': <MentorPage state={state} user={user} navigate={navigate} onAuth={openAuth}/>,
    '/dashboard': <DashboardPage state={state} user={user} navigate={navigate} onAuth={openAuth}/>,
    '/stories': <StoriesPage state={state}/>,
    '/about': <AboutPage navigate={navigate}/>
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (document.querySelector('.hero') && document.querySelector('.orb-a')) {
        gsap.to('.orb-a',{y:180,x:90,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
      }
      if (document.querySelector('.future') && document.querySelector('.future-orbit')) {
        gsap.to('.future-orbit',{rotate:35,scrollTrigger:{trigger:'.future',start:'top bottom',end:'bottom top',scrub:1}});
      }
    },root);
    return () => ctx.revert();
  },[path]);

  return (
    <div ref={root} className="app" id="top">
      <motion.div className="scroll-progress" style={{scaleX:progress}}/>
      <div className="noise"/><div className="cursor-glow"/>
      <Navbar menu={menu} setMenu={setMenu} navigate={navigate} path={path} user={user} onAuth={openAuth} onLogout={logout}/>
      <main>
        {pages[path] || <NotFoundPage navigate={navigate}/>}
      </main>
      <Footer navigate={navigate}/>
      <AuthModal open={authOpen} mode={authMode} onClose={()=>setAuthOpen(false)} onSuccess={completeAuth}/>
    </div>
  );
}

export default App;
