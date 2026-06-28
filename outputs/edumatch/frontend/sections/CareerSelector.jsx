import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { careerInsights, careers } from '../data/edumatchData';
import { Pill, Reveal } from '../components/ui';

const discoveryQuestions = [
  ['hobby','What do you naturally do in free time?', ['Making or fixing things','Drawing, designing or decorating','Watching films / editing videos','Helping people solve problems','Playing or analyzing games','Music, beats or instruments','Nature, animals or travel','Posting, explaining or entertaining']],
  ['subject','Which subject feels least boring?', ['Not sure yet','Math / Computer Science','Art / Design','English / Stories','Business / Social Studies','Biology / Environment','Music / Performing arts','Sports / Media']],
  ['activity','What kind of work gives you energy?', ['I like trying many things','Building something with tools','Creating visuals','Telling stories','Leading people','Solving puzzles','Exploring outdoors','Making content for an audience']],
  ['problem','What problem would you enjoy solving?', ['Finding what fits me','Automating boring work','Making things look better','Creating emotions through stories','Growing a small business','Protecting nature','Designing fun experiences','Teaching or influencing people']],
  ['environment','Where can you imagine yourself working?', ['Flexible / still exploring','Laptop + projects','Studio / design room','Film set / creator setup','Community / field work','Gaming or product team','Outdoor field work','Stage, studio or social media']]
];

export function CareerSelector({career,customGoal,setCustomGoal,interestProfile,updateInterestProfile,isExplorationPath,discoverPrompt,clearDiscoverPrompt,pick,beginCustomGoal,beginInterestAnalysis}){
  const chooseCareer = value => {
    clearDiscoverPrompt?.();
    pick(value);
  };
  const startCustom = () => {
    clearDiscoverPrompt?.();
    beginCustomGoal();
  };
  const startAnalysis = () => {
    clearDiscoverPrompt?.();
    beginInterestAnalysis();
  };
  return (
    <section className="career-section section" id="discover">
      <Reveal className="section-title">
        <Pill>START WITH AMBITION</Pill>
        <h2>Who do you want<br/>to <span>become?</span></h2>
        <p>Choose a ready-made direction, or type any random, unusual, half-formed goal and EduMatch will build the data below around that input.</p>
        {discoverPrompt && <div className="discover-lock-prompt"><b>Choose your direction first.</b><span>Profile unlocks after you select a career, type a custom goal, or use “I do not know yet”.</span></div>}
        <div className="custom-goal-box">
          <label>TYPE YOUR OWN GOAL</label>
          <div>
            <input value={customGoal} onChange={e=>setCustomGoal(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') startCustom()}} placeholder="e.g. ethical hacker, cafe owner, sports analyst, manga artist, drone farmer"/>
            <button type="button" onClick={startCustom}>Start custom path <ArrowRight size={15}/></button>
          </div>
          <small>Works with normal careers, weird blends, freelance ideas, creator paths, startup goals or something that does not exist yet.</small>
        </div>
        <div className={`interest-analyzer ${isExplorationPath ? 'active' : ''}`}>
          <div className="interest-head">
            <span><Sparkles size={15}/></span>
            <div>
              <label>I DO NOT KNOW YET</label>
              <h3>Analyze me from hobbies</h3>
            </div>
          </div>
          <p>For students who cannot choose a career yet. Answer these vibe-check questions and EduMatch will start with a likely direction, then refine it in Build your profile.</p>
          <div className="interest-grid">
            {discoveryQuestions.map(([key,label,options]) => (
              <div key={key}>
                <small>{label}</small>
                <select value={interestProfile[key]} onChange={e=>updateInterestProfile(key,e.target.value)}>
                  {options.map(option => <option key={option}>{option}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button type="button" onClick={startAnalysis}>{isExplorationPath ? "I'm not sure yet selected" : 'Analyze and build my profile'} <ArrowRight size={15}/></button>
        </div>
      </Reveal>
      <div className="career-list">{careers.map((c,i)=>{const info=careerInsights[c];return <motion.button key={c} onClick={()=>chooseCareer(c)} whileHover={{x:10}} className={career===c?'active':''}><span>{String(i+1).padStart(2,'0')}</span><b>{c}</b><em>{info?.merit}</em><small>{info?.fit}</small><ArrowRight/></motion.button>})}</div>
    </section>
  );
}
