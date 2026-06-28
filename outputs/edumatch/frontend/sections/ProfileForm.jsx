import { ArrowRight, BookOpen, Compass, Gauge, GraduationCap, MapPin, Shapes, Target, WalletCards } from 'lucide-react';
import { streamOptionsFor } from '../data/edumatchData';
import { Pill, Reveal } from '../components/ui';


const validateLocation = (loc) => {
  if (!loc || !loc.trim()) return { isValid: true, error: null };
  const val = loc.toLowerCase().trim();
  
  const foreignKeywords = [
    'usa', 'united states', 'america', 'canada', 'toronto', 'vancouver', 'montreal',
    'london', 'united kingdom', ' uk', 'great britain', 'england', 'germany', 'berlin',
    'munich', 'frankfurt', 'france', 'paris', 'australia', 'sydney', 'melbourne',
    'dubai', 'uae', 'united arab emirates', 'singapore', 'malaysia', 'kuala lumpur',
    'china', 'beijing', 'shanghai', 'japan', 'tokyo', 'osaka', 'nepal', 'kathmandu',
    'pakistan', 'islamabad', 'lahore', 'karachi', 'bangladesh', 'dhaka', 'sri lanka',
    'colombo', 'russia', 'moscow', 'europe', 'africa', 'new york', 'california', 'texas'
  ];
  
  if (foreignKeywords.some(fk => val.includes(fk) || val === fk)) {
    return { isValid: false, error: "Please choose an Indian place. EduMatch currently supports India only." };
  }
  
  const indianKeywords = [
    'india', 'bharat',
    // States & UTs
    'andhra', 'arunachal', 'assam', 'bihar', 'chhattisgarh', 'goa', 'gujarat', 'haryana', 
    'himachal', 'jharkhand', 'karnataka', 'kerala', 'madhya pradesh', 'maharashtra', 
    'manipur', 'meghalaya', 'mizoram', 'nagaland', 'odisha', 'orissa', 'punjab', 'rajasthan', 
    'sikkim', 'tamil nadu', 'tamilnadu', 'telangana', 'tripura', 'uttar pradesh', 'up', 
    'uttarakhand', 'west bengal', 'bengal', 'andaman', 'nicobar', 'chandigarh', 'dadra', 
    'daman', 'diu', 'delhi', 'ncr', 'jammu', 'kashmir', 'ladakh', 'lakshadweep', 'puducherry', 
    'pondicherry',
    // Major cities
    'mumbai', 'bombay', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'secunderabad',
    'ahmedabad', 'chennai', 'madras', 'kolkata', 'calcutta', 'surat', 'pune', 'jaipur', 
    'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'vizag',
    'patna', 'vadodara', 'baroda', 'ghaziabad', 'ludhiana', 'agra', 'nashik', 'faridabad', 
    'meerut', 'rajkot', 'varanasi', 'srinagar', 'jammu', 'leh', 'port blair', 'kavaratti', 
    'silvassa', 'diu', 'daman'
  ];
  
  const hasIndianKeyword = indianKeywords.some(ik => val.includes(ik));
  if (!hasIndianKeyword) {
    return { isValid: false, error: "Please enter an Indian city/state, or append ', India' (e.g. 'YourCity, India')" };
  }
  
  return { isValid: true, error: null };
};

export function ProfileForm({state,navigate,user}){
  const {career, interestProfile, updateInterestProfile, profile, updateProfile, toggleExam, updateExam, generateMatches, isPreSeniorStage, needsIntermediate, isExplorationPath, isCustomPath, askEntranceExams, matchLoading, matchError, customQuestions, customQuestionsLoading} = state;
  const streamOptions = streamOptionsFor(career);
  const marksMatter = !isExplorationPath;
  
  const currentLocValidation = validateLocation(profile.currentLocation);
  const preferredLocValidation = !needsIntermediate && !['At home / near my house','Within my current city','Remote / hybrid learning'].includes(profile.locationMode)
    ? validateLocation(profile.preferredLocation)
    : { isValid: true, error: null };

  const isLocationInvalid = !currentLocValidation.isValid || !preferredLocValidation.isValid;
  const academicBoardStreamQuestions = !isExplorationPath && needsIntermediate ? (
    <>
      <label className="question-card"><span className="question-icon"><BookOpen/></span><span className="question-copy"><small>02 · PREFERRED BOARD</small><b>Which 11th–12th curriculum suits you?</b><em>We compare schools and junior colleges offering it.</em></span><select value={profile.board} onChange={e=>updateProfile('board',e.target.value)}><option>CBSE</option><option>ISC</option><option>State Intermediate Board</option><option>IB Diploma Programme</option><option>Cambridge AS & A Levels</option><option>NIOS / flexible schooling</option><option>Open to recommendations</option></select></label>
      <label className="question-card"><span className="question-icon"><Compass/></span><span className="question-copy"><small>03 · PREFERRED STREAM</small><b>Which direction do you want to explore?</b><em>Career guidance checks whether this stream supports your goal.</em></span><select value={profile.stream} onChange={e=>updateProfile('stream',e.target.value)}>{streamOptions.map(option=><option key={option}>{option}</option>)}</select></label>
    </>
  ) : null;
  const careerSpecificQuestions = isExplorationPath ? (
    <ExplorationQuestions interestProfile={interestProfile} updateInterestProfile={updateInterestProfile} profile={profile} updateProfile={updateProfile}/>
  ) : (
    <CustomPathQuestions career={career} profile={profile} updateProfile={updateProfile} questions={customQuestions} loading={customQuestionsLoading}/>
  );
  return (
    <section className="profile-section section" id="profile">
      <Reveal className="profile-heading"><Pill>MAKE IT PERSONAL</Pill><h2>Now, tell us where<br/><span>you're starting from.</span></h2><p>These signals turn a broad ambition into a realistic route.</p></Reveal>
      <Reveal className="profile-form">
        <div className="profile-progress"><span>YOUR PROFILE</span><div>{Array.from({length:14},(_,i)=><i key={i}/>)}</div><b>14 SIGNALS</b></div>
        <div className="question-grid">
          {marksMatter && (
            <label className="question-card stage-card"><span className="question-icon"><GraduationCap/></span><span className="question-copy"><small>01 · EDUCATION STAGE</small><b>Where are you in your education today?</b><em>This decides whether we match 11th–12th institutions, diploma routes or undergraduate colleges.</em></span><select value={profile.educationStage} onChange={e=>updateProfile('educationStage',e.target.value)}><option>Seeking 11th–12th admission</option><option>Diploma / Polytechnic</option><option>Completed Class 12</option><option>Undergraduate student</option><option>Gap year / returning learner</option></select></label>
          )}
          {academicBoardStreamQuestions}
          {needsIntermediate && !isExplorationPath && (
            <IntermediateAdmissionQuestions profile={profile} updateProfile={updateProfile}/>
          )}
          {marksMatter && (
            <>
              <ResultCard title="CLASS 10" value={profile.class10} detail={profile.class10Detail} marksMatter={marksMatter} onValue={v=>{updateProfile('class10',v);updateProfile('class10Detail','')}} onDetail={v=>updateProfile('class10Detail',v)} />
              {!isPreSeniorStage && <ResultCard title="CLASS 12 / DIPLOMA" value={profile.class12} detail={profile.class12Detail} senior marksMatter={marksMatter} onValue={v=>{updateProfile('class12',v);updateProfile('class12Detail','')}} onDetail={v=>updateProfile('class12Detail',v)} />}
            </>
          )}
          {careerSpecificQuestions}
          <SelectCard icon={<WalletCards/>} small="04 · ANNUAL BUDGET" title="What feels financially comfortable?" note="Combined tuition and living-cost preference." value={profile.budget} onChange={v=>updateProfile('budget',v)} options={['Up to ₹50,000 / year','₹50,000–1 lakh / year','₹1–2 lakh / year','₹2–3 lakh / year','₹3–5 lakh / year','₹5–10 lakh / year','₹10–20 lakh / year','₹20 lakh+ / year','Flexible if scholarships are available']}/>
          <label className="question-card">
            <span className="question-icon"><MapPin/></span>
            <span className="question-copy">
              <small>05 · CURRENT LOCATION</small>
              <b>Where are you currently based?</b>
              <em>City and state are enough.</em>
            </span>
            <input className="field-input" value={profile.currentLocation} onChange={e=>updateProfile('currentLocation',e.target.value)} placeholder="e.g. Hyderabad, Telangana"/>
            {!currentLocValidation.isValid && (
              <div style={{ color: '#ff5555', fontSize: '11px', marginTop: '6px', fontWeight: '500', width: '100%', gridColumn: '1 / -1' }}>
                {currentLocValidation.error}
              </div>
            )}
          </label>
          {!needsIntermediate && (
            <label className="question-card">
              <span className="question-icon"><Compass/></span>
              <span className="question-copy">
                <small>06 · STUDY LOCATION</small>
                <b>How far would you like to move?</b>
                <em>This shapes campus, commute and living-cost matches.</em>
              </span>
              <select value={profile.locationMode} onChange={e=>updateProfile('locationMode',e.target.value)}>
                <option>At home / near my house</option>
                <option>Within my current city</option>
                <option>Within my current state</option>
                <option>Another state in India</option>
                <option>Major Indian city</option>
                <option>Study abroad</option>
                <option>Open to anywhere</option>
                <option>Remote / hybrid learning</option>
              </select>
              {!['At home / near my house','Within my current city','Remote / hybrid learning'].includes(profile.locationMode) && (
                <>
                  <input className="field-input conditional-field" value={profile.preferredLocation} onChange={e=>updateProfile('preferredLocation',e.target.value)} placeholder="Preferred city, state, or region in India"/>
                  {!preferredLocValidation.isValid && (
                    <div style={{ color: '#ff5555', fontSize: '11px', marginTop: '6px', fontWeight: '500', width: '100%', gridColumn: '1 / -1' }}>
                      {preferredLocValidation.error}
                    </div>
                  )}
                </>
              )}
            </label>
          )}
          <div className="question-card goal-card required-card"><span className="question-icon"><Target/></span><span className="question-copy"><small>CAREER GOAL · REQUIRED</small><b>What future are we designing for?</b><em>Career guidance is compulsory at every education stage.</em></span><span className="selected-goal">{career}</span><button onClick={()=>navigate('/discover')}>Change goal</button></div>
        </div>
        <div className="profile-submit">
          <div>
            <span>OUTPUT</span>
            <p>{isLocationInvalid ? "Please enter a valid location in India to proceed." : (matchError || 'A college shortlist, admission outlook and tailored career roadmap.')}</p>
          </div>
          <button className="button" disabled={matchLoading || isLocationInvalid} onClick={()=>generateMatches(user?.email)}>
            {matchLoading?'Generating...':'Generate my matches'} <ArrowRight/>
          </button>
        </div>
      </Reveal>
    </section>
  );
}

function SelectCard({icon,small,title,note,value,onChange,options}){
  return <label className="question-card"><span className="question-icon">{icon}</span><span className="question-copy"><small>{small}</small><b>{title}</b><em>{note}</em></span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(option=><option key={option}>{option}</option>)}</select></label>;
}

function CustomPathQuestions({career,profile,updateProfile,questions,loading}){
  if (loading) {
    return <div className="custom-path-questions" style={{padding: '2rem', textAlign: 'center'}}>
      <p style={{opacity: 0.7, marginBottom: '1rem'}}>Generating customized AI questions for {career}...</p>
      <div className="loader" style={{margin: '0 auto', width: 24, height: 24, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
    </div>;
  }
  
  return <div className="custom-path-questions">
    <label className="question-card custom-dream-card"><span className="question-icon"><Target/></span><span className="question-copy"><small>DREAM BRIEF</small><b>Why does “{career}” matter to you?</b><em>Tell us about your motivation, interest, or vision for this path.</em></span><input className="field-input" value={profile.dreamWhy} onChange={e=>updateProfile('dreamWhy',e.target.value)} placeholder={`e.g. Why you want to pursue ${career} or what you want to achieve`}/></label>
    {(questions || []).map(q => (
      <SelectCard 
        key={q.id}
        icon={<Shapes/>} 
        small={q.small.toUpperCase()} 
        title={q.title} 
        note={q.note} 
        value={profile.customAnswers?.[q.id] || ''} 
        onChange={v => {
          const newAnswers = {...(profile.customAnswers || {}), [q.id]: v};
          updateProfile('customAnswers', newAnswers);
        }} 
        options={['Select an option...', ...q.options]}
      />
    ))}
  </div>;
}

function ExplorationQuestions({interestProfile,updateInterestProfile,profile,updateProfile}){
  return <div className="custom-path-questions exploration-questions">
    <label className="question-card custom-dream-card"><span className="question-icon"><Compass/></span><span className="question-copy"><small>UNCLEAR CAREER MODE</small><b>You do not need to choose a career yet</b><em>EduMatch will analyze your hobbies, energy, subjects and comfort zones first. No entrance-exam assumptions, no forced UG college prediction.</em></span><input className="field-input" value={profile.dreamWhy} onChange={e=>updateProfile('dreamWhy',e.target.value)} placeholder="Write anything: what you enjoy, what confuses you, or what you definitely do not want"/></label>
    <SelectCard icon={<Shapes/>} small="HOBBY SIGNAL" title="What do you keep doing without pressure?" note="This is often a better clue than a random career label." value={interestProfile.hobby} onChange={v=>updateInterestProfile('hobby',v)} options={['Making or fixing things','Drawing, designing or decorating','Watching films / editing videos','Helping people solve problems','Playing or analyzing games','Music, beats or instruments','Nature, animals or travel','Posting, explaining or entertaining','Nothing strongly yet']}/>
    <SelectCard icon={<BookOpen/>} small="SUBJECT ENERGY" title="Which subject feels least boring?" note="Not highest marks — actual interest." value={interestProfile.subject} onChange={v=>updateInterestProfile('subject',v)} options={['Not sure yet','Math / Computer Science','Art / Design','English / Stories','Business / Social Studies','Biology / Environment','Music / Performing arts','Sports / Media']}/>
    <SelectCard icon={<Gauge/>} small="ENERGY PATTERN" title="What kind of work feels natural?" note="This helps separate maker, creator, helper, analyst and explorer paths." value={interestProfile.activity} onChange={v=>updateInterestProfile('activity',v)} options={['I like trying many things','Building something with tools','Creating visuals','Telling stories','Leading people','Solving puzzles','Exploring outdoors','Making content for an audience']}/>
    <SelectCard icon={<Target/>} small="FIRST EXPERIMENT" title="What should we test for 14 days?" note="The output will be a discovery roadmap, not a fixed-career prescription." value={profile.prototype} onChange={v=>updateProfile('prototype',v)} options={['Try 3 mini projects from different fields','Build one small tech project','Create a visual/design portfolio sample','Make one short video or story project','Volunteer or interview people in a real problem area','Make one game/music/content experiment','Shadow a professional or senior student','Take a career clarity sprint']}/>
    <SelectCard icon={<Compass/>} small="GUIDANCE STYLE" title="How should EduMatch guide you?" note="Different confused students need different support." value={profile.supportNeed} onChange={v=>updateProfile('supportNeed',v)} options={['Help me discover strengths','Compare streams before I choose','Show creative/freelance paths too','Show safe career options first','Show unusual paths if they fit me','Give me parent-friendly explanations','Give me a low-cost exploration plan']}/>
  </div>;
}

function IntermediateAdmissionQuestions({profile,updateProfile}){
  return <div className="custom-path-questions intermediate-questions">
    <SelectCard icon={<BookOpen/>} small="INTERMEDIATE ADMISSION" title="How will your 11th-12th admission likely happen?" note="No UG entrance exams here — this is for school/junior-college admission." value={profile.admissionBasis} onChange={v=>updateProfile('admissionBasis',v)} options={['Class 10 marks + interview','Class 10 marks only','School-level entrance / aptitude test','Counselling-based admission','Open admission / direct admission','Not sure yet']}/>
    <SelectCard icon={<WalletCards/>} small="FEE / SCHOLARSHIP" title="Do you need scholarship or fee support?" note="Useful for intermediate college shortlisting." value={profile.scholarshipNeed} onChange={v=>updateProfile('scholarshipNeed',v)} options={['Need scholarship options','Need low-fee colleges','Can manage moderate fees','Flexible if quality is strong','Need hostel + fee planning','Not sure yet']}/>
    <SelectCard icon={<Target/>} small="COACHING STYLE" title="Do you want coaching integrated with 11th-12th?" note="Relevant for PCM, PCB, commerce aptitude and design foundation routes." value={profile.coachingPlan} onChange={v=>updateProfile('coachingPlan',v)} options={['Integrated coaching preferred','Separate coaching outside college','Only school academics for now','Foundation coaching, not intense','No coaching / self-study','Not sure yet']}/>
    <SelectCard icon={<Compass/>} small="CAMPUS FORMAT" title="What kind of 11th-12th setup do you prefer?" note="This affects day scholar, hostel, commute and learning environment matches." value={profile.campusPreference} onChange={v=>updateProfile('campusPreference',v)} options={['Day scholar / near home','Residential / hostel','Junior college with coaching culture','School campus with activities','Flexible / open schooling','Online or hybrid support']}/>
  </div>;
}

function ResultCard({title,value,detail,onValue,onDetail,senior=false, marksMatter=true}){
  const options = marksMatter 
    ? (senior ? ['Above 95%','90–95%','85–90%','75–85%','60–75%','Below 60%','Results pending','CGPA out of 10','CGPA out of 4','Diploma percentage','Diploma CGPA out of 10','Diploma CGPA out of 4','IB points out of 45','Letter grade / other system'] : ['Above 95%','90–95%','85–90%','75–85%','60–75%','Below 60%','CGPA out of 10','CGPA out of 4','Letter grade / other system','Prefer not to say'])
    : (senior ? ['Passed Class 12 / Diploma', 'Currently studying', 'Results pending'] : ['Passed Class 10', 'Currently studying', 'Results pending']);
  
  const displayValue = options.includes(value) ? value : options[0];
  const needsDetail = ['CGPA out of 10','CGPA out of 4','Diploma percentage','Diploma CGPA out of 10','Diploma CGPA out of 4','IB points out of 45','Letter grade / other system'].includes(displayValue);
  
  return <label className="question-card"><span className="question-icon"><BookOpen/></span><span className="question-copy"><small>{title}</small><b>{senior?'What is your latest senior-secondary result?':'What was your Class 10 result?'}</b><em>{senior?(marksMatter?'UG matching depends on this plus entrance results.':'Marks are secondary for this path.'):(marksMatter?'Used only as an academic reference.':'Passing is usually enough for this path.')}</em></span><select value={displayValue} onChange={e=>onValue(e.target.value)}>{options.map(option=><option key={option}>{option}</option>)}</select>{needsDetail&&<input className="field-input conditional-field" value={detail} onChange={e=>onDetail(e.target.value)} placeholder={displayValue.includes('percentage')?'e.g. 82%':displayValue.includes('out of 10')?'e.g. 8.4':displayValue.includes('out of 4')?'e.g. 3.5':displayValue.includes('IB points')?'e.g. 36':'Enter result and grading scale'}/>}</label>;
}
