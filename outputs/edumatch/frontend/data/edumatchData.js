import { BrainCircuit, ChartNoAxesCombined, Route, ScanFace } from 'lucide-react';

export const careers = [
  'AI Engineer',
  'Indie Filmmaker',
  'Freelance Designer',
  'Content Creator',
  'Social Entrepreneur',
  'Wildlife Photographer',
  'Game Designer',
  'Music Producer',
  'Climate Innovator',
  'Build My Own Path'
];

export const careerInsights = {
  'AI Engineer': {merit:'Entrance + math foundation + projects', fit:'Best 11th-12th stream: PCM with coding/CS exposure.', proof:'Build Python, ML and systems projects early.', askExams:true},
  'Indie Filmmaker': {merit:'Portfolio, showreel and storytelling proof', fit:'Marks are secondary; admissions often judge creative aptitude, scripts, short films and interviews.', proof:'Create a 2-3 minute short film, scene breakdowns and editing reel.', askExams:false},
  'Freelance Designer': {merit:'Portfolio and client-style work', fit:'Design schools may test aptitude, but real growth comes from visual thinking and portfolio quality.', proof:'Build brand, poster, UI and case-study samples.', askExams:false},
  'Content Creator': {merit:'Audience, niche clarity and publishing consistency', fit:'No entrance exam defines this path; proof is content output and audience learning.', proof:'Publish a 30-day content experiment and track retention, saves and comments.', askExams:false},
  'Social Entrepreneur': {merit:'Community problem, pilot project and impact proof', fit:'Marks do not prove fit; field research and execution matter more.', proof:'Run a small community pilot and document outcomes.', askExams:false},
  'Wildlife Photographer': {merit:'Photo portfolio, fieldcraft and patience', fit:'Portfolio, observation skill and conservation awareness matter more than rank.', proof:'Build a 20-photo field portfolio with species notes.', askExams:false},
  'Game Designer': {merit:'Playable prototypes and game-jam proof', fit:'Game design is judged through systems thinking, playable demos and storytelling.', proof:'Ship one tiny playable game or level prototype.', askExams:false},
  'Music Producer': {merit:'Tracks, DAW skill and collaboration proof', fit:'A portfolio of tracks matters more than marks for most music-production paths.', proof:'Create a 3-track demo pack and remix/recreate one reference song.', askExams:false},
  'Climate Innovator': {merit:'Science foundation + climate projects', fit:'Can be exam-driven for science colleges, but project proof matters for innovation paths.', proof:'Build a climate case study, local audit or data project.', askExams:true},
  'Build My Own Path': {merit:'Self-designed proof-of-work', fit:'No default exam. The path is built from experiments, mentors and audience feedback.', proof:'Ship a public prototype around the dream.', askExams:false}
};

export const shouldAskEntranceExams = career => {
  const text = (career || '').toLowerCase().trim();
  if (career && careerInsights[career] && careerInsights[career].askExams !== undefined) {
    return careerInsights[career].askExams;
  }
  const group = inferExamGroup(career);
  return ['engineering', 'science', 'business', 'government', 'design', 'media'].includes(group);
};

export const isBusinessOrIndependentGoal = (career) => {
  const text = (career || '').toLowerCase().trim();
  if (career === 'Build My Own Path') return true;
  
  const independentKeywords = [
    'business', 'startup', 'cafe', 'restaurant', 'agency', 'shop', 'store', 
    'freelance', 'independent', 'creator', 'vlog', 'youtube', 'studio', 
    'indie', 'photographer', 'filmmaker', 'music producer', 'artist', 'maker',
    'boutique', 'brand', 'clothing line', 'saas', 'co-founder', 'founder',
    'entrepreneur'
  ];
  
  return independentKeywords.some(keyword => text.includes(keyword));
};

export const fieldProofOptionsFor = career => {
  const base = careerInsights[career] || careerInsights['Build My Own Path'];
  const text = career.toLowerCase();
  if (/film|cinema|director|filmmaker/.test(text)) return {
    proof:['2-3 minute short film','Scene-by-scene script breakdown','Editing/showreel sample','Behind-the-scenes production plan'],
    skill:['Storytelling and screenplay','Cinematography basics','Editing and sound design','Directing actors/non-actors'],
    review:['Film mentor/director','Editor or cinematographer','Film-school portfolio reviewer','Audience screening feedback']
  };
  if (/design|ui|ux|fashion|graphic/.test(text)) return {
    proof:['Brand identity case study','Poster/social campaign set','UI app redesign','Freelance-style client brief'],
    skill:['Visual hierarchy','User research','Typography and layout','Business/client communication'],
    review:['Senior designer','Design-school mentor','Potential client','Portfolio reviewer']
  };
  if (/content|creator|youtube|influencer|vlog/.test(text)) return {
    proof:['30-day content sprint','Three-video pilot series','Niche research board','Analytics and retention review'],
    skill:['Script hooks','Editing rhythm','Audience research','Distribution strategy'],
    review:['Creator in your niche','Video editor','Brand/content strategist','Real audience comments']
  };
  if (/music|producer|beat|audio/.test(text)) return {
    proof:['3-track demo pack','Remix/recreate reference song','Beat tape snippet set','Collaboration with vocalist/rapper'],
    skill:['DAW workflow','Mixing basics','Arrangement','Artist branding'],
    review:['Music producer','Mix engineer','Vocalist/artist','Small listening group']
  };
  if (/game|gaming/.test(text)) return {
    proof:['Tiny playable prototype','Game-jam submission','Level design mockup','Mechanic test video'],
    skill:['Game systems','Narrative design','Unity/Godot basics','Player feedback loops'],
    review:['Game designer','Developer friend','Game-jam community','Players/testers']
  };
  if (/wildlife|photo|photography/.test(text)) return {
    proof:['20-photo field portfolio','Species observation journal','Photo essay','Conservation story pitch'],
    skill:['Composition','Field patience','Editing workflow','Nature ethics'],
    review:['Wildlife photographer','Conservationist','Photo editor','Local nature club']
  };
  return {
    proof:[base.proof,'7-day public experiment','Interview 5 real people','Mini portfolio / case study'],
    skill:['Core craft practice','Communication','Distribution','Business basics'],
    review:['Practitioner in this field','Mentor or teacher','Potential user/client','Peer community']
  };
};

export const pathMeta = {
  'AI Engineer': ['97%', '₹18–32L', 'IIIT Hyderabad', 'Python · ML · Systems'],
  'Indie Filmmaker': ['93%', '₹8–40L', 'Whistling Woods', 'Story · Direction · Editing'],
  'Freelance Designer': ['96%', '₹6–30L', 'NID Ahmedabad', 'Brand · UI/UX · Business'],
  'Content Creator': ['91%', '₹4L–1Cr+', 'MICA Ahmedabad', 'Story · Audience · Strategy'],
  'Social Entrepreneur': ['90%', 'Impact-led', 'TISS Mumbai', 'Systems · Community · Finance'],
  'Wildlife Photographer': ['89%', '₹5–25L', 'Srishti Manipal', 'Visuals · Fieldcraft · Story'],
  'Game Designer': ['94%', '₹10–28L', 'NID Bengaluru', 'Narrative · 3D · Game Systems'],
  'Music Producer': ['92%', '₹6–35L', 'KM Music Conservatory', 'Composition · DAW · Branding'],
  'Climate Innovator': ['95%', '₹10–26L', 'TERI SAS', 'Climate · Policy · Venture'],
  'Build My Own Path': ['100%', 'Path designed by you', 'Personal Path Studio', 'Curiosity - Proof-of-work - Tribe']
};

export const examGroups = {
  engineering: [['JEE Main','Percentile (0–100)','e.g. 96.42'],['JEE Advanced','All India Rank (AIR)','e.g. 4850'],['BITSAT','Score out of 390','e.g. 285'],['VITEEE','Rank','e.g. 12000'],['MET (Manipal)','Score out of 240','e.g. 165'],['SRMJEEE','Rank','e.g. 8500'],['MHT CET','PCM percentile','e.g. 97.10'],['KCET','Rank','e.g. 6200'],['WBJEE','GMR rank','e.g. 4100'],['COMEDK UGET','Rank','e.g. 7200'],['AP EAPCET','Rank','e.g. 9500'],['TS EAPCET','Rank','e.g. 8800'],['CUET UG','Normalized score shown on scorecard','e.g. 685'],['IISER IAT','Rank / score shown on result','e.g. 2100'],['University-specific online test','Score or rank shown on result','Enter your result'],['Not taking an entrance exam','Not applicable','No exam required']],
  design: [['NID DAT','Score / rank shown on result','e.g. AIR 320'],['UCEED','All India Rank (AIR)','e.g. 740'],['NIFT Entrance','Common Merit Rank (CMR)','e.g. 1250'],['CUET UG','Normalized score shown on scorecard','e.g. 640'],['MITID DAT','Score / rank shown on result','Enter your result'],['Pearl Academy Entrance','Score / interview result','Enter your result'],['University-specific design test','Score or rank shown on result','Enter your result'],['Portfolio-based admission','Portfolio stage / rating','e.g. Shortlisted'],['Not taking an entrance exam','Not applicable','No exam required']],
  media: [['FTII JET','Score / rank shown on result','Enter your result'],['SRFTI Entrance Test','Score / rank shown on result','Enter your result'],['CUET UG','Normalized score shown on scorecard','e.g. 620'],['Whistling Woods Entrance','Creative aptitude result','e.g. Shortlisted'],['University-specific media test','Score or rank shown on result','Enter your result'],['Audition / portfolio admission','Portfolio or audition stage','e.g. Final round'],['Not taking an entrance exam','Not applicable','No exam required']],
  business: [['IPMAT Indore','Aptitude Test Score (ATS)','Enter ATS'],['IPMAT Rohtak','Score / rank shown on result','Enter your result'],['JIPMAT','NTA score / percentile','Enter your result'],['SET','Score shown on scorecard','Enter your result'],['NPAT','Score / merit rank','Enter your result'],['CUET UG','Normalized score shown on scorecard','e.g. 680'],['CLAT','All India Rank (AIR)','e.g. 2400'],['University-specific aptitude test','Score or rank shown on result','Enter your result'],['Not taking an entrance exam','Not applicable','No exam required']],
  science: [['IISER IAT','Rank / score shown on result','Enter your result'],['NEST','Merit rank / score','Enter your result'],['JEE Main','Percentile (0–100)','e.g. 96.42'],['CUET UG','Normalized score shown on scorecard','e.g. 670'],['ICAR AIEEA / CUET Agriculture','NTA score shown on scorecard','Enter your result'],['University-specific science test','Score or rank shown on result','Enter your result'],['Not taking an entrance exam','Not applicable','No exam required']],
  creative: [['CUET UG','Normalized score shown on scorecard','e.g. 610'],['NID DAT','Score / rank shown on result','e.g. AIR 520'],['UCEED','All India Rank (AIR)','e.g. 900'],['NIFT Entrance','Common Merit Rank (CMR)','e.g. 1700'],['Audition / portfolio admission','Portfolio or audition stage','e.g. Shortlisted'],['University-specific creative test','Score or rank shown on result','Enter your result'],['Not taking an entrance exam','Not applicable','No exam required']],
  government: [['UPSC Civil Services (IAS/IPS)','Rank / prelims score','e.g. Rank 150'],['State PSC (SI/Group 1/2)','Aptitude / written score','e.g. 210 Marks'],['SSC CGL / CHSL','Tier 1/2 score','e.g. 145 Marks'],['Defense Exams (NDA/CDS)','Rank / score','e.g. Recommended / Rank 110'],['Police Recruitment Exam','Physical + written score','e.g. Qualified / 85 Marks'],['Bank PO / Clerk (IBPS/SBI)','Score','e.g. 68 Marks'],['CUET UG','Normalized score shown on scorecard','e.g. 650'],['Not taking an entrance exam','Not applicable','No exam required']]
};

const careerExamGroup = {
  'AI Engineer':'engineering',
  'Indie Filmmaker':'media',
  'Freelance Designer':'design',
  'Content Creator':'media',
  'Social Entrepreneur':'business',
  'Wildlife Photographer':'creative',
  'Game Designer':'design',
  'Music Producer':'creative',
  'Climate Innovator':'science',
  'Build My Own Path':'creative'
};

export const inferExamGroup = career => {
  const text = career.toLowerCase();
  if (/engineer|tech|software|coding|robot|data|ai|machine|civil|mechanical|electrical/.test(text)) return 'engineering';
  if (/police|cop|ias|ips|upsc|ssc|psc|civil service|military|soldier|army|navy|air force|defense|government|officer|clerk|bank/.test(text)) return 'government';
  if (/business|startup|entrepreneur|finance|law|management|marketing|commerce/.test(text)) return 'business';
  if (/film|media|journal|creator|youtube|actor|writer|story|cinema/.test(text)) return 'media';
  if (/design|fashion|ui|ux|game|animation|product|architecture/.test(text)) return 'design';
  if (/science|doctor|medical|bio|climate|research|space|agri|psychology/.test(text)) return 'science';
  return careerExamGroup[career] || 'creative';
};

export const examsFor = career => {
  const text = (career || '').toLowerCase().trim();

  // 1. Merchant Navy / Marine / Maritime
  if (text.includes('merchant navy') || text.includes('maritime') || text.includes('marine engineer') || text.includes('nautical')) {
    return [
      ['IMU CET (Indian Maritime University Common Entrance Test)', 'All India Rank (AIR)', 'e.g. AIR 1250'],
      ['Not taking an entrance exam', 'Not applicable', 'No exam required']
    ];
  }

  // 2. Navy / Naval
  if (text.includes('navy') || text.includes('naval')) {
    return [
      ['INET (Indian Navy Entrance Test)', 'Rank / score', 'e.g. Recommended / Rank 450'],
      ['NDA (National Defence Academy - Navy)', 'Rank / score', 'e.g. Recommended / Rank 110'],
      ['CDS (Combined Defence Services - Navy)', 'Rank / score', 'e.g. Recommended / Rank 95'],
      ['Indian Navy Agniveer (SSR/MR)', 'Written + Physical qualification status', 'e.g. Qualified / 72 Marks'],
      ['Not taking an entrance exam', 'Not applicable', 'No exam required']
    ];
  }

  // 3. Air Force / AFCAT / Aviation / Pilot / IAF
  if (text.includes('air force') || text.includes('afcat') || text.includes('pilot') || text.includes('aviation') || text.includes('iaf') || text.includes('flying')) {
    return [
      ['AFCAT (Air Force Common Admission Test)', 'Score out of 300 / Rank', 'e.g. 165 Marks / Rank 320'],
      ['NDA (National Defence Academy - Air Force)', 'Rank / score', 'e.g. Recommended / Rank 85'],
      ['CDS (Combined Defence Services - Air Force)', 'Rank / score', 'e.g. Recommended / Rank 120'],
      ['Indian Air Force Agniveer (Vayu)', 'Written + Physical qualification status', 'e.g. Qualified'],
      ['Commercial Pilot License (CPL) Entrance', 'Entrance test score / Rank', 'Enter your result'],
      ['Not taking an entrance exam', 'Not applicable', 'No exam required']
    ];
  }

  // 4. Army / Military / Defence / Soldier
  if (text.includes('army') || text.includes('military') || text.includes('soldier') || text.includes('defence') || text.includes('defense')) {
    return [
      ['NDA (National Defence Academy - Army)', 'Rank / score', 'e.g. Recommended / Rank 140'],
      ['CDS (Combined Defence Services - Army)', 'Rank / score', 'e.g. Recommended / Rank 115'],
      ['Technical Entry Scheme (TES)', 'Class 12 PCM percentage / shortlisting status', 'e.g. 88% / Shortlisted'],
      ['Indian Army Agniveer', 'Written + Physical qualification status', 'e.g. Qualified'],
      ['Not taking an entrance exam', 'Not applicable', 'No exam required']
    ];
  }

  // 5. Law / Lawyer / Advocate / Legal / Judge / LL.B
  if (text.includes('law') || text.includes('lawyer') || text.includes('advocate') || text.includes('legal') || text.includes('judge') || text.includes('clat') || text.includes('llb') || text.includes('ll.b')) {
    return [
      ['CLAT (Common Law Admission Test)', 'All India Rank (AIR)', 'e.g. AIR 2400'],
      ['AILET (All India Law Entrance Test)', 'All India Rank (AIR)', 'e.g. AIR 350'],
      ['LSAT India', 'Percentile score (0–100)', 'e.g. 92 Percentile'],
      ['MH CET Law', 'Score / Rank', 'e.g. 108 Marks'],
      ['SLAT (Symbiosis Law Admission Test)', 'Score', 'e.g. 42 Marks'],
      ['Not taking an entrance exam', 'Not applicable', 'No exam required']
    ];
  }

  // 6. Medical / Doctor / MBBS / BDS / Dentist / Vet / Pharmacy
  if (text.includes('doctor') || text.includes('medical') || text.includes('mbbs') || text.includes('bds') || text.includes('dentist') || text.includes('veterinary') || text.includes('physiotherapy') || text.includes('bams') || text.includes('bhms') || text.includes('pharmacy') || text.includes('neet') || text.includes('clinical') || text.includes('surgeon')) {
    return [
      ['NEET UG (National Eligibility cum Entrance Test)', 'All India Rank (AIR)', 'e.g. AIR 15400'],
      ['NEET UG Score', 'Score out of 720', 'e.g. 612 Marks'],
      ['Not taking an entrance exam', 'Not applicable', 'No exam required']
    ];
  }

  // 7. Police / Cop / Constable / Sub-Inspector / SI / CAPF / Officer / Inspector
  if (text.includes('police') || text.includes('cop') || text.includes('constable') || text.includes('sub-inspector') || text.includes('sub inspector') || text.includes('inspector') || /\bsi\b/.test(text)) {
    return [
      ['State Police SI Exam (Sub-Inspector)', 'Written + Physical score', 'e.g. 240 Marks / Qualified'],
      ['State Police Constable Exam', 'Written + Physical score', 'e.g. 85 Marks'],
      ['SSC CPO (Sub-Inspector in Delhi Police & CAPFs)', 'Tier 1/2 score / Rank', 'e.g. 265 Marks'],
      ['UPSC CAPF (Assistant Commandant)', 'Written + Personality test score', 'e.g. 210 Marks'],
      ['Not taking an entrance exam', 'Not applicable', 'No exam required']
    ];
  }

  // 8. Bank / Banking / PO / Clerk / SBI / IBPS / RBI
  if (text.includes('bank') || text.includes('banking') || text.includes('finance officer') || /\bpo\b/.test(text) || text.includes('clerk') || text.includes('sbi') || text.includes('ibps') || text.includes('rbi')) {
    return [
      ['SBI PO (Probationary Officer)', 'Main exam score / interview result', 'e.g. 88.5 Marks'],
      ['SBI Clerk (Junior Associate)', 'Main exam score', 'e.g. 76 Marks'],
      ['IBPS PO', 'Main exam score / interview result', 'e.g. 82 Marks'],
      ['IBPS Clerk', 'Main exam score', 'e.g. 78 Marks'],
      ['IBPS RRB (Regional Rural Bank PO/Clerk)', 'Main exam score', 'e.g. 115 Marks'],
      ['RBI Grade B Officer', 'Phase 2 score / interview result', 'e.g. 195 Marks'],
      ['RBI Assistant', 'Main exam score', 'e.g. 86 Marks'],
      ['Not taking an entrance exam', 'Not applicable', 'No exam required']
    ];
  }

  // 9. Civil Services / IAS / IPS / UPSC / PSC / Government Collector
  if (text.includes('civil service') || text.includes('ias') || text.includes('ips') || text.includes('ifs') || text.includes('upsc') || text.includes('psc') || text.includes('collector') || text.includes('government officer') || text.includes('govt officer')) {
    return [
      ['UPSC Civil Services Exam (IAS/IPS/IFS)', 'Prelims score / Mains rank', 'e.g. Rank 150 / 105 Marks'],
      ['State PSC (Group 1 / Administrative)', 'Written score / Rank', 'e.g. 340 Marks / Rank 45'],
      ['State PSC (Group 2 / Executive)', 'Written score / Rank', 'e.g. 280 Marks'],
      ['Not taking an entrance exam', 'Not applicable', 'No exam required']
    ];
  }

  // 10. SSC / Staff Selection / CGL / CHSL
  if (text.includes('ssc') || text.includes('cgl') || text.includes('chsl') || text.includes('mts') || text.includes('stenographer')) {
    return [
      ['SSC CGL (Combined Graduate Level)', 'Tier 1/2 score', 'e.g. 295 Marks'],
      ['SSC CHSL (Combined Higher Secondary Level)', 'Tier 1/2 score', 'e.g. 142 Marks'],
      ['SSC MTS (Multi-Tasking Staff)', 'Written score', 'e.g. 82 Marks'],
      ['SSC Stenographer', 'Written + skill test status', 'e.g. Grade C/D Qualified'],
      ['Not taking an entrance exam', 'Not applicable', 'No exam required']
    ];
  }

  // 11. Management / BBA / IPMAT / MBA
  if (text.includes('management') || text.includes('bba') || text.includes('ipmat') || text.includes('jipmat') || text.includes('npat') || text.includes('mba') || text.includes('cat exam')) {
    return [
      ['IPMAT Indore', 'Aptitude Test Score (ATS)', 'e.g. 185 ATS'],
      ['IPMAT Rohtak', 'Score / Rank', 'e.g. 310 Marks / Rank 120'],
      ['JIPMAT', 'NTA score / percentile', 'e.g. 345 Marks / 95.8 Percentile'],
      ['NPAT (NMIMS)', 'Score / Merit Rank', 'e.g. Merit Rank 1800'],
      ['SET (Symbiosis Entrance Test)', 'Score out of 60', 'e.g. 46 Marks'],
      ['CUET UG (Management Section)', 'Normalized score shown on scorecard', 'e.g. 680'],
      ['Not taking an entrance exam', 'Not applicable', 'No exam required']
    ];
  }

  // 12. Architecture / NATA / B.Arch
  if (text.includes('architect') || text.includes('nata') || text.includes('b.arch') || text.includes('planning')) {
    return [
      ['NATA (National Aptitude Test in Architecture)', 'Score out of 200', 'e.g. 145 Marks'],
      ['JEE Main Paper 2 (B.Arch / B.Planning)', 'Percentile (0–100)', 'e.g. 98.4 Percentile'],
      ['Not taking an entrance exam', 'Not applicable', 'No exam required']
    ];
  }

  // 13. Agriculture / Farming / Forestry / Fishery / Horticulture
  if (text.includes('agricult') || text.includes('farming') || text.includes('forestry') || text.includes('fishery') || text.includes('horticult')) {
    return [
      ['ICAR AIEEA / CUET Agriculture', 'NTA score shown on scorecard', 'e.g. 580 Marks'],
      ['State Agriculture Common Entrance', 'Rank / score', 'e.g. Rank 3200'],
      ['CUET UG', 'Normalized score shown on scorecard', 'e.g. 620'],
      ['Not taking an entrance exam', 'Not applicable', 'No exam required']
    ];
  }

  // 14. CA / Chartered Accountant / Accounting / Auditor
  if (text.includes('chartered accountant') || /\bca\b/.test(text) || text.includes('audit') || text.includes('accounting') || text.includes('bookkeeper')) {
    return [
      ['CA Foundation', 'Aptitude / result status', 'e.g. Cleared / 280 Marks'],
      ['Not taking an entrance exam', 'Not applicable', 'No exam required']
    ];
  }

  // Fallbacks based on inferExamGroup
  const group = inferExamGroup(career);
  return examGroups[group] || examGroups.creative;
};

export const streamOptionsFor = career => {
  const group = inferExamGroup(career);
  if (group === 'engineering') return [
    'Science — PCM',
    'Diploma / Polytechnic in Computer Science',
    'Vocational IT / Coding track',
    'Undecided — guide me'
  ];
  if (group === 'science') return [
    'Science — PCM',
    'Science — PCB',
    'Science — PCMB',
    'Undecided — guide me'
  ];
  if (group === 'business') return [
    'Commerce with Mathematics',
    'Commerce without Mathematics',
    'Humanities / Arts',
    'Undecided — guide me'
  ];
  if (group === 'design' || group === 'media' || group === 'creative') return [
    'Design / Creative Studies',
    'Humanities / Arts',
    'Commerce without Mathematics',
    'Vocational / Skill-based',
    'Undecided — guide me'
  ];
  return [
    'Science — PCM',
    'Commerce with Mathematics',
    'Humanities / Arts',
    'Design / Creative Studies',
    'Vocational / Skill-based',
    'Undecided — guide me'
  ];
};

export const features = [
  {icon: BrainCircuit, title:'AI College Match', text:'See the colleges that fit your ambition—not just your rank.', tag:'01', wide:true, link:'/colleges'},
  {icon: ChartNoAxesCombined, title:'Chance Predictor', text:'Know where you stand before applications open.', tag:'02', link:'/chance'},
  {icon: ScanFace, title:'Future You', text:'Simulate the skills, salary and roles waiting ahead.', tag:'03', link:'/stories'},
  {icon: Route, title:'Career Roadmap', text:'One living plan from today to your first big role.', tag:'04', wide:true, link:'/roadmap'}
];

export const colleges = [
  {name:'IIIT Hyderabad', city:'Hyderabad', score:96, chance:'High', roi:'9.4×', placement:'₹26.3L', color:'#9b8cff'},
  {name:'BITS Pilani', city:'Pilani', score:92, chance:'Strong', roi:'8.7×', placement:'₹20.9L', color:'#66d9ff'},
  {name:'IIT Madras', city:'Chennai', score:89, chance:'Reach', roi:'10.1×', placement:'₹21.5L', color:'#b8ff6a'}
];

export const intermediateColleges = [
  {name:'UWC Mahindra College', city:'Pune', score:95, chance:'Strong fit', roi:'IBDP', placement:'Residential', color:'#9b8cff'},
  {name:'Aga Khan Academy', city:'Hyderabad', score:92, chance:'Strong fit', roi:'IBDP', placement:'Residential', color:'#66d9ff'},
  {name:'Kodaikanal International', city:'Kodaikanal', score:88, chance:'Explore', roi:'IBDP', placement:'Residential', color:'#b8ff6a'}
];

export const customPathBlueprint = [
  ['MISSION LAB','Name the problem, audience or obsession you cannot stop thinking about.'],
  ['SKILL STACK','Blend college, online cohorts, apprenticeships, freelance work and self-study.'],
  ['PROOF ENGINE','Ship public projects, paid experiments and a portfolio OS instead of waiting for permission.'],
  ['MENTOR COUNCIL','Build a small circle of domain experts, creators, operators and alumni.']
];

export const customPathOptionsFor = dream => {
  const text = dream.toLowerCase();
  if (/cafe|food|bakery|restaurant|chef|coffee/.test(text)) return {
    prototype:['Run a 1-day pop-up stall','Create a 10-item tasting menu','Start Instagram pre-orders','Map suppliers and costing'],
    audience:['Students near colleges','Office crowd','Health-conscious buyers','Local neighborhood families'],
    mentors:['Cafe owner','Cloud-kitchen operator','Food photographer','Small business accountant'],
    income:['Pre-orders','Weekend stall','Subscription snack box','Catering for small events']
  };
  if (/hack|cyber|security|ethical/.test(text)) return {
    prototype:['Build a home security lab','Complete 3 CTF writeups','Audit a demo website ethically','Create a public security blog'],
    audience:['Startups needing security basics','Students learning cyber safety','Small businesses','Open-source projects'],
    mentors:['Bug bounty hunter','Security engineer','Network admin','Digital forensics expert'],
    income:['Bug bounty practice','Security content','Freelance hardening checklist','Internship-ready portfolio']
  };
  if (/manga|comic|artist|illustrat|animation|anime/.test(text)) return {
    prototype:['Publish a 5-page mini comic','Create 10 character sheets','Post a weekly art series','Build a webtoon pilot'],
    audience:['Anime communities','Young readers','Gaming fandoms','Indie comic fans'],
    mentors:['Comic artist','Storyboard artist','Publisher/editor','Social media art creator'],
    income:['Commissions','Digital prints','Patreon-style community','Merch pre-orders']
  };
  if (/sport|cricket|football|analyst|fitness/.test(text)) return {
    prototype:['Analyze 10 matches publicly','Build a stats dashboard','Create short tactical breakdowns','Volunteer with a local team'],
    audience:['Local clubs','Sports fans','School teams','Fantasy sports users'],
    mentors:['Coach','Sports analyst','Physio/fitness trainer','Data analyst'],
    income:['Team reports','Content channel','Local coaching support','Freelance analysis packs']
  };
  if (/travel|video|creator|youtube|vlog|content/.test(text)) return {
    prototype:['Shoot a 3-video pilot series','Create a niche travel map','Publish short-form reels for 30 days','Build a budget travel guide'],
    audience:['Students on budget trips','Local explorers','Solo travelers','Culture and food fans'],
    mentors:['Travel creator','Video editor','Brand partnerships manager','Tour operator'],
    income:['Affiliate guides','Sponsored local videos','Editing services','Paid itineraries']
  };
  return {
    prototype:['Build a public 7-day experiment','Interview 5 people in the field','Create a small portfolio page','Ship one paid or useful mini-project'],
    audience:['People with the same problem','Local community','Online niche community','Small businesses or creators'],
    mentors:['Practitioner in this field','Creator/operator','Teacher or senior student','Freelancer earning from this skill'],
    income:['First freelance offer','Paid workshop','Digital product','Apprenticeship or internship']
  };
};

export const streamRoadmaps = {
  'Science — PCM': [['NEXT','Choose strong 11th-12th PCM support','Start with the right 11th-12th college before thinking UG.'],['CLASS 11','Build maths, physics and coding foundations','Keep concepts deep, not just marks-focused.'],['CLASS 12','Attempt JEE / BITSAT / CET / CUET as relevant','Use real entrance results, not generic percentages.'],['AFTER 12TH','UG college prediction unlocks','Based on Class 12 performance plus entrance rank/score.'],['FUTURE','Engineering, AI, data, robotics, architecture, research','Choose the lane after evidence builds.']],
  'Science — PCB': [['NEXT','Choose strong biology and chemistry faculty','Prioritize labs, discipline and medical/science counseling.'],['CLASS 11','Build biology, chemistry and lab discipline','Make diagrams, NCERT and recall systems strong.'],['CLASS 12','Attempt NEET / CUET / IISER as relevant','Track achieved or expected rank/score.'],['AFTER 12TH','UG college shortlist unlocks','College fit depends on board marks and entrance rank.'],['FUTURE','Medicine, biotech, psychology, pharmacy, research','Keep health and science routes visible.']],
  'Science — PCMB': [['NEXT','Keep engineering and medical doors open','Pick support that can handle workload.'],['CLASS 11','Balance PCM plus biology carefully','Protect sleep and revision time.'],['CLASS 12','Choose JEE / NEET / CUET by strongest interest','Avoid writing every exam without strategy.'],['AFTER 12TH','UG recommendations unlock','Only after final results are known.'],['FUTURE','Bioengineering, medicine, AI in health, research','Combine science breadth with focus.']],
  'Commerce with Mathematics': [['NEXT','Choose commerce with strong maths/accountancy','A good 11th-12th base matters.'],['CLASS 11','Build accounts, economics and aptitude','Start case studies and finance basics.'],['CLASS 12','Prepare CUET / IPMAT / NPAT / CA Foundation','Use real scorecard formats.'],['AFTER 12TH','UG shortlist unlocks','Based on board and entrance performance.'],['FUTURE','Finance, analytics, CA, entrepreneurship, economics','Aim for outcome plus affordability.']],
  'Commerce without Mathematics': [['NEXT','Choose practical commerce exposure','Focus on communication and business basics.'],['CLASS 11','Build accounts, business and digital skills','Create proof through projects.'],['CLASS 12','Prepare CUET / SET / university exams','Keep exam choices realistic.'],['AFTER 12TH','UG shortlist waits','Needs 12th marks and exam results.'],['FUTURE','Business, marketing, management, law, entrepreneurship','Multiple non-engineering routes stay open.']],
  'Humanities / Arts': [['NEXT','Choose writing and social science support','Look for debate, reading and mentorship.'],['CLASS 11','Build research, writing and argumentation','Projects matter here.'],['CLASS 12','Prepare CUET / law / media / design entrances','Pick exams by desired route.'],['AFTER 12TH','College prediction unlocks','Based on 12th plus entrance performance.'],['FUTURE','Law, civil services, psychology, media, policy','Strong route for thinkers and communicators.']],
  'Design / Creative Studies': [['NEXT','Choose a stream that protects portfolio time','Portfolio is not optional.'],['CLASS 11','Build sketching and visual thinking','Publish work early.'],['CLASS 12','Prepare NID DAT / UCEED / NIFT / portfolio rounds','Real portfolio feedback matters.'],['AFTER 12TH','Design college fit unlocks','Based on portfolio plus entrance result.'],['FUTURE','Design, animation, UX, fashion, gaming','Creative careers need proof.']],
  'Vocational / Skill-based': [['NEXT','Choose practical projects and internships','The college should support doing.'],['CLASS 11','Build one monetizable skill','Start a small portfolio.'],['CLASS 12','Use certificates and apprenticeships wisely','Results plus skill proof guide next steps.'],['AFTER 12TH','College or work route unlocks','Based on skill proof and results.'],['FUTURE','Freelance, trades, hospitality, media, tech support','A practical path can be powerful.']],
  'Undecided — guide me': [['NEXT','Try three mini-projects','Do not lock a stream blindly.'],['CLASS 11','Compare science, commerce, humanities and creative fit','Notice energy, marks and curiosity.'],['CLASS 12','Pick entrance exams after interests clarify','Avoid random exam overload.'],['AFTER 12TH','UG colleges unlock from actual results','No fake prediction before evidence.'],['FUTURE','A guided mix based on strengths and budget','Direction can be discovered.']]
};
