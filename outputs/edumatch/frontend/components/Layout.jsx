import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logo } from './ui';

const links = [
  ['/', 'Home'],
  ['/dashboard', 'Dashboard'],
  ['/discover', 'Discover'],
  ['/profile', 'Profile'],
  ['/results', 'Results'],
  ['/chance', 'Chance'],
  ['/platform', 'Platform'],
  ['/mentor', 'Mentor'],
  ['/stories', 'Stories'],
  ['/about', 'About Us']
];

const mobileLinks = [
  ['/', 'Home'],
  ['/platform', 'Platform'],
  ['/roadmap', 'Roadmaps'],
  ['/colleges', 'Colleges'],
  ['/about', 'About Us'],
  ['contact', 'Contact']
];

function RouteLink({to,children,navigate,className=''}){
  return <a href={to} className={className} onClick={e=>{e.preventDefault();navigate(to)}}>{children}</a>;
}

export function Navbar({menu,setMenu,navigate,path,user,onAuth,onLogout}){
  return (
    <>
      <nav>
        <Logo navigate={navigate}/>
        <div className="nav-links">{links.slice(1).map(([to,label])=><RouteLink key={to} to={to} navigate={navigate} className={path===to?'active':''}>{label}</RouteLink>)}</div>
        <div className="nav-actions">
          {user ? <div className="user-chip"><span>{user.name?.slice(0,1)?.toUpperCase() || 'U'}</span><b>{user.name}</b><button onClick={onLogout}>Logout</button></div> : <><button className="text-btn" onClick={()=>onAuth('login')}>Sign in</button><button className="text-btn register-link" onClick={()=>onAuth('register')}>Register</button></>}
          <RouteLink to="/discover" navigate={navigate} className="button button-sm">Find my path <ArrowRight size={15}/></RouteLink>
        </div>
        <button className="menu" onClick={() => setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
      </nav>
      <AnimatePresence>
        {menu && <motion.div className="mobile-nav" initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
          {mobileLinks.map(([to,label]) =>
            to === 'contact' ? (
              <a key={to} href="mailto:edumatch8@gmail.com" className="mobile-nav-link">{label}</a>
            ) : (
              <RouteLink key={to} to={to} navigate={(next)=>{setMenu(false);navigate(next)}} className="mobile-nav-link">{label}</RouteLink>
            )
          )}
        </motion.div>}
      </AnimatePresence>
    </>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
    </svg>
  );
}

export function Footer({navigate}){
  const handleMailto = () => { window.location.href = 'mailto:edumatch8@gmail.com'; };

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Column 1 — EduMatch */}
          <div className="footer-col footer-brand">
            <Logo navigate={navigate}/>
            <p>EduMatch is an AI-powered educational platform that helps students with career guidance, personalized learning, internship recommendations, and skill development through intelligent recommendations and modern technology.</p>
          </div>

          {/* Column 2 — Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <div className="footer-links">
              {links.slice(1).map(([to, label]) => (
                <RouteLink key={to} to={to} navigate={navigate}>{label}</RouteLink>
              ))}
            </div>
          </div>

          {/* Column 3 — Technology Stack */}
          <div className="footer-col">
            <h4>Technology Stack</h4>
            <ul className="footer-tech-list">
              <li>React.js</li>
              <li>Python</li>
              <li>MySQL</li>
              <li>OpenRouter API</li>
              <li>REST APIs</li>
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div className="footer-col">
            <h4>Contact</h4>
            <div className="footer-contact">
              <a href="mailto:edumatch8@gmail.com" onClick={e => { e.preventDefault(); handleMailto(); }} className="footer-email">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
                edumatch8@gmail.com
              </a>
              <div className="footer-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Hyderabad, Telangana, India</span>
              </div>
            </div>
            <div className="footer-socials">
              <a href="#" onClick={e => e.preventDefault()} className="social-link" aria-label="GitHub"><GithubIcon /></a>
              <a href="#" onClick={e => e.preventDefault()} className="social-link" aria-label="LinkedIn"><LinkedinIcon /></a>
              <a href="#" onClick={e => e.preventDefault()} className="social-link" aria-label="Instagram"><InstagramIcon /></a>
              <a href="#" onClick={e => e.preventDefault()} className="social-link" aria-label="X (Twitter)"><XIcon /></a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="footer-divider"/>
        <div className="footer-bottom-row">
          <span>© 2026 EduMatch. All Rights Reserved.</span>
          <div className="footer-legal">
            <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
            <a href="#" onClick={e => e.preventDefault()}>Terms &amp; Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
