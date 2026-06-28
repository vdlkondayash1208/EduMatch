import { motion } from 'framer-motion';
import { ArrowRight, Play, TrendingUp } from 'lucide-react';
import { Pill } from '../components/ui';

export function Hero({navigate}){
  return (
    <section className="hero section">
      <div className="hero-grid"/><div className="orb orb-a"/><div className="orb orb-b"/>
      <motion.div className="hero-copy" initial="hidden" animate="show" variants={{show:{transition:{staggerChildren:.1}}}}>
        <motion.div variants={{hidden:{opacity:0,y:15},show:{opacity:1,y:0}}}><Pill>YOUR FUTURE, ENGINEERED</Pill></motion.div>
        <motion.h1 variants={{hidden:{opacity:0,y:30},show:{opacity:1,y:0}}}>Don't search for<br/>colleges. <span>Discover<br/>your future.</span></motion.h1>
        <motion.p variants={{hidden:{opacity:0,y:20},show:{opacity:1,y:0}}}>Tell us who you want to become. Our AI maps the colleges, skills and opportunities that can get you there.</motion.p>
        <motion.div className="hero-actions" variants={{hidden:{opacity:0},show:{opacity:1}}}><button className="button" onClick={()=>navigate('/discover')}>Find my future <ArrowRight size={17}/></button><button className="button ghost" onClick={()=>navigate('/mentor')}><Play size={15} fill="currentColor"/> Meet your AI mentor</button></motion.div>
        <motion.div className="proof" variants={{hidden:{opacity:0},show:{opacity:1}}}><div className="avatars"><i>AM</i><i>RK</i><i>SP</i><i>+</i></div><div><b>4.9/5</b><span>Trusted by ambitious students</span></div></motion.div>
      </motion.div>
      <motion.div className="hero-product" initial={{opacity:0,x:60,rotateY:-8}} animate={{opacity:1,x:0,rotateY:0}} transition={{duration:1,delay:.25}}>
        <div className="float-chip chip-1"><span>AI</span>12 paths analyzed</div><div className="float-chip chip-2"><TrendingUp size={16}/>Outcome +34%</div>
        <div className="product-head"><span className="mini-logo">E</span><div><small>YOUR BEST-FIT PATH</small><b>AI & Machine Learning</b></div><span className="online">LIVE</span></div>
        <div className="radar"><div className="radar-ring r1"/><div className="radar-ring r2"/><div className="radar-ring r3"/><div className="radar-center"><strong>96</strong><span>PATH SCORE</span></div><span className="node n1">Skills</span><span className="node n2">College</span><span className="node n3">Career</span></div>
        <div className="product-row"><div><small>TOP MATCH</small><b>IIIT Hyderabad</b></div><div><small>EXPECTED ROI</small><b className="cyan">9.4×</b></div><button><ArrowRight/></button></div>
      </motion.div>
      <div className="metrics"><div><strong>10,000<span>+</span></strong><small>STUDENTS GUIDED</small></div><div><strong>500<span>+</span></strong><small>COLLEGES MAPPED</small></div><div><strong>95<span>%</span></strong><small>MATCH ACCURACY</small></div></div>
    </section>
  );
}
