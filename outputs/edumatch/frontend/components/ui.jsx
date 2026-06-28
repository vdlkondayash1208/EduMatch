import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function Logo({navigate}){
  return <a className="logo" href="/" onClick={e=>{if(navigate){e.preventDefault();navigate('/')}}}><span className="logo-mark"><span/></span>EduMatch</a>;
}

export function Pill({children}){
  return <div className="eyebrow"><Sparkles size={13}/>{children}</div>;
}

export function Reveal({children,className='',delay=0, ...rest}){
  return (
    <motion.div
      className={className}
      initial={{opacity:0,y:34}}
      whileInView={{opacity:1,y:0}}
      viewport={{once:true,margin:'-80px'}}
      transition={{duration:.75,delay,ease:[.2,.8,.2,1]}}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
