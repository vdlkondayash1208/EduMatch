import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, BrainCircuit, Route, 
  GraduationCap, LayoutDashboard, Target, Eye, 
  Code, Database, Cpu, GitBranch, Globe, 
  Mail, Server,
  Zap, Layers
} from 'lucide-react';
import { Pill, Reveal } from '../components/ui';

const features = [
  { icon: BrainCircuit, title: 'AI Career Guidance', text: 'Intelligent career path recommendations powered by AI, analyzing your strengths, interests, and market trends.', color: '#907cff' },
  { icon: Route, title: 'Personalized Learning Roadmaps', text: 'Custom learning paths that adapt to your academic stage, exam targets, and career goals.', color: '#c8ff79' },
  { icon: GraduationCap, title: 'College Explorer', text: 'Comprehensive college discovery with match scores, placement data, and admission chance prediction.', color: '#7cc5ff' },
  { icon: LayoutDashboard, title: 'Student Dashboard', text: 'Unified workspace to track your career path, profile metrics, roadmaps, and recommendations.', color: '#d47cff' }
];

const techStack = {
  frontend: ['React.js', 'Vite', 'HTML5', 'CSS3', 'JavaScript'],
  backend: ['Python', 'Flask / FastAPI', 'REST APIs'],
  database: ['MySQL'],
  ai: ['OpenRouter API', 'Large Language Models (LLMs)'],
  tools: ['Git', 'GitHub', 'VS Code', 'Postman'],
  deployment: ['Netlify', 'GitHub Pages']
};

import varoodhImg from '../Assets-/varoodh.jpeg';
import rohithImg from '../Assets-/ROhith.jpeg';
import ramImg from '../Assets-/Ram shankar.jpeg';
import yashwanthImg from '../Assets-/Yashwanth.jpeg';
import ritinImg from '../Assets-/ritin.jpeg';
import shivaImg from '../Assets-/shiva.jpeg';
import sanvithImg from '../Assets-/Sanvith.jpeg';
import venkatImg from '../Assets-/venkat.jpeg';

const team = [
  { name: 'Varrodh', role: 'Team Leader & Technical Lead', initials: 'V', color: '#907cff', email: 'Varoodh711@gmail.com', image: varoodhImg },
  { name: 'Sri Rohith', role: 'Frontend Developer', initials: 'SR', color: '#74e5ff', email: 'adnosesrirohit@gmail.com', image: rohithImg },
  { name: 'Ram Shankar', role: 'Frontend Developer', initials: 'RS', color: '#c8ff79', email: 'konderiramshankar@gmail.com', image: ramImg },
  { name: 'V. Yashwanth', role: 'Backend Developer', initials: 'VY', color: '#ff9f7c', email: 'vdlkondayash1208@gmail.com', image: yashwanthImg },
  { name: 'Sri Ritin', role: 'Backend Developer', initials: 'SR', color: '#7cc5ff', email: 'Sririthin12@gmail.com', image: ritinImg },
  { name: 'Shiva', role: 'Database Developer', initials: 'SH', color: '#d47cff', email: 'Mrshiva7541@gmail.com', image: shivaImg },
  { name: 'Sanvith', role: 'Database Developer', initials: 'SA', color: '#ff8c8c', email: 'yadagirishanvith@gmail.com', image: sanvithImg },
  { name: 'T. Venkat Reddy', role: 'Database Developer', initials: 'TV', color: '#7cffb0', email: 'thummetivenkat@gmail.com', image: venkatImg }
];

const highlights = [
  { icon: Users, label: 'Team Members', value: 8, suffix: '' },
  { icon: Zap, label: 'AI-Powered Platform', value: 100, suffix: '%' },
  { icon: Layers, label: 'Responsive Design', value: 100, suffix: '%' },
  { icon: Lock, label: 'Secure Authentication', value: 100, suffix: '%' }
];

function Users() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function Lock() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function AnimatedCounter({ value, suffix = '', label, icon: Icon, color }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.round(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="highlight-card">
      <div className="highlight-icon" style={{ background: `rgba(${parseInt(color?.slice(1,3), 16)}, ${parseInt(color?.slice(3,5), 16)}, ${parseInt(color?.slice(5,7), 16)}, 0.1)`, color }}>
        <Icon />
      </div>
      <div className="highlight-value">
        <strong>{count}</strong>
        <span>{suffix}</span>
      </div>
      <p>{label}</p>
    </div>
  );
}

function LinkedinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function TeamCard({ member, index }) {
  const [imgError, setImgError] = useState(false);
  const handleImgError = useCallback(() => setImgError(true), []);

  return (
    <motion.div
      className="team-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
    >
      <div className="team-avatar" style={imgError ? { background: `linear-gradient(135deg, ${member.color}, ${member.color}88)` } : {}}>
        {imgError ? (
          <span>{member.initials}</span>
        ) : (
          <img src={member.image} alt={member.name} onError={handleImgError} />
        )}
      </div>
      <h4>{member.name}</h4>
      <p>{member.role}</p>
      <div className="team-socials-bar">
        <a href={`mailto:${member.email}`} className="team-social-icon" aria-label={`Email ${member.name}`}>
          <Mail size={14} />
        </a>
        <a href="#" onClick={e => e.preventDefault()} className="team-social-icon" aria-label={`${member.name} LinkedIn`}>
          <LinkedinIcon />
        </a>
        <a href="#" onClick={e => e.preventDefault()} className="team-social-icon" aria-label={`${member.name} Instagram`}>
          <InstagramIcon />
        </a>
      </div>
    </motion.div>
  );
}

function TechCategory({ title, items, icon: Icon, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <div className="tech-category">
        <div className="tech-category-head">
          <div className="tech-category-icon"><Icon size={16} /></div>
          <h4>{title}</h4>
        </div>
        <div className="tech-items">
          {items.map((item, i) => (
            <span key={i} className="tech-tag">{item}</span>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export default function AboutPage({ navigate }) {
  const handleExplore = () => {
    if (navigate) navigate('/discover');
  };
  const handleContact = () => {
    window.location.href = 'mailto:edumatch8@gmail.com';
  };
  const handleGetStarted = () => {
    if (navigate) navigate('/discover');
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero section">
        <div className="about-hero-grid" />
        <Reveal>
          <Pill>ABOUT EDUMATCH</Pill>
          <h1>
            About <span>EduMatch</span>
          </h1>
          <p>
            EduMatch is an AI-powered educational platform that helps students with career guidance, 
            personalized learning, internship recommendations, and skill development using modern 
            web technologies and artificial intelligence.
          </p>
          <div className="about-hero-actions">
            <button className="button" onClick={handleExplore}>
              Explore Platform <ArrowRight size={16} />
            </button>
            <button className="button ghost" onClick={handleContact}>
              Contact Us <Mail size={16} />
            </button>
          </div>
        </Reveal>
      </section>

      {/* Mission & Vision Section */}
      <section className="about-mission-vision section">
        <div className="mission-vision-grid">
          <Reveal className="mv-card mission-card">
            <div className="mv-icon" style={{ background: 'rgba(144, 124, 255, 0.1)', color: '#907cff' }}>
              <Target size={28} />
            </div>
            <h2>Our Mission</h2>
            <p>To empower students with AI-driven educational tools that simplify learning, career planning, and skill development.</p>
          </Reveal>
          <Reveal delay={0.15} className="mv-card vision-card">
            <div className="mv-icon" style={{ background: 'rgba(116, 229, 255, 0.1)', color: '#74e5ff' }}>
              <Eye size={28} />
            </div>
            <h2>Our Vision</h2>
            <p>To become a trusted educational platform that connects students with the right opportunities through intelligent recommendations and modern technology.</p>
          </Reveal>
        </div>
      </section>

      {/* Features Section */}
      <section className="about-features section">
        <Reveal>
          <div className="section-title">
            <Pill>FEATURES</Pill>
            <h2>What We <span>Offer</span></h2>
            <p>Comprehensive tools designed to guide students through every step of their educational journey.</p>
          </div>
        </Reveal>
        <div className="about-features-grid">
          {features.map((feat, i) => (
            <Reveal key={feat.title} delay={i * 0.06}>
              <motion.div
                className="about-feature-card"
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <div className="about-feature-icon" style={{ background: `${feat.color}18`, color: feat.color }}>
                  <feat.icon size={24} />
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="about-tech section">
        <div className="tech-bg-orb" />
        <Reveal>
          <div className="section-title">
            <Pill>TECHNOLOGY STACK</Pill>
            <h2>Built With <span>Modern Tech</span></h2>
            <p>A powerful combination of cutting-edge technologies powering the EduMatch platform.</p>
          </div>
        </Reveal>
        <div className="tech-grid">
          <TechCategory title="Frontend" items={techStack.frontend} icon={Code} delay={0} />
          <TechCategory title="Backend" items={techStack.backend} icon={Server} delay={0.05} />
          <TechCategory title="Database" items={techStack.database} icon={Database} delay={0.1} />
          <TechCategory title="AI" items={techStack.ai} icon={Cpu} delay={0.15} />
          <TechCategory title="Tools" items={techStack.tools} icon={GitBranch} delay={0.2} />
          <TechCategory title="Deployment" items={techStack.deployment} icon={Globe} delay={0.25} />
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="about-team section">
        <Reveal>
          <div className="section-title">
            <Pill>MEET OUR TEAM</Pill>
            <h2>Behind <span>EduMatch</span></h2>
            <p>Passionate individuals working together to transform education through technology and innovation.</p>
          </div>
        </Reveal>
        <div className="team-grid">
          {team.map((member, i) => (
            <TeamCard key={member.name} member={member} index={i} />
          ))}
        </div>
      </section>

      {/* Project Highlights Section */}
      <section className="about-highlights section">
        <div className="highlights-bg" />
        <Reveal>
          <div className="section-title">
            <Pill>PROJECT HIGHLIGHTS</Pill>
            <h2>By the <span>Numbers</span></h2>
            <p>Key metrics that define the EduMatch platform and its capabilities.</p>
          </div>
        </Reveal>
        <div className="highlights-grid">
          {highlights.map((h, i) => (
            <AnimatedCounter
              key={h.label}
              value={h.value}
              suffix={h.suffix}
              label={h.label}
              icon={h.icon}
              color={
                i === 0 ? '#907cff' :
                i === 1 ? '#74e5ff' :
                i === 2 ? '#c8ff79' :
                '#ff9f7c'
              }
            />
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="about-cta section">
        <div className="cta-bg-orb" />
        <Reveal>
          <div className="cta-content">
            <h2>Ready to Start Your<br />Learning <span>Journey?</span></h2>
            <p>
              Join EduMatch and experience AI-powered education with personalized guidance, 
              smart career recommendations, and modern learning tools.
            </p>
            <div className="cta-actions">
              <button className="button" onClick={handleGetStarted}>
                Get Started <ArrowRight size={16} />
              </button>
              <button className="button ghost" onClick={handleContact}>
                Contact Us <Mail size={16} />
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
