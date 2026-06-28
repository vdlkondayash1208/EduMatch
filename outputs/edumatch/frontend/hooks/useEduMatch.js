import { useState, useEffect } from 'react';
import { careers, colleges, examsFor, intermediateColleges, pathMeta, shouldAskEntranceExams, streamOptionsFor, streamRoadmaps, isBusinessOrIndependentGoal } from '../data/edumatchData';
import { api } from '../lib/api';

const explorationCareer = "I'm not sure yet";

const initialProfile = {
  educationStage:'Seeking 11th–12th admission',
  board:'CBSE',
  stream:'Science — PCM',
  class10:'85–90%',
  class10Detail:'',
  class12:'85–90%',
  class12Detail:'',
  exams:[{name:'JEE Main',status:'Expected',result:''}],
  budget:'₹3–5 lakh / year',
  currentLocation:'',
  locationMode:'Open to anywhere',
  preferredLocation:'',
  experience:'A few personal projects',
  learning:'Learn by building',
  priority:'Strong career outcomes',
  dreamWhy:'',
  prototype:'',
  audience:'',
  mentor:'',
  income:'',
  admissionBasis:'Class 10 marks + interview',
  scholarshipNeed:'Need scholarship options',
  coachingPlan:'Integrated coaching preferred',
  campusPreference:'Day scholar / near home',
  supportNeed:'Stream selection counselling',
  proofSignal:'',
  skillSignal:'',
  reviewSignal:'',
  customAnswers: {}
};

const initialInterestProfile = {
  hobby:'Making or fixing things',
  subject:'Not sure yet',
  activity:'I like trying many things',
  problem:'Finding what fits me',
  environment:'Flexible / still exploring'
};



export function useEduMatch(navigate = () => {}, user, onAuth){
  const [career,setCareer] = useState('');
  const [customGoal,setCustomGoal] = useState('');
  const [interestProfile,setInterestProfile] = useState(initialInterestProfile);
  const [profile,setProfile] = useState(initialProfile);
  const [hasSelectedGoal,setHasSelectedGoal] = useState(false);
  const [matchesGenerated,setMatchesGenerated] = useState(false);
  const [sent,setSent] = useState(false);
  const [matchResult,setMatchResult] = useState(null);
  const [matchLoading,setMatchLoading] = useState(false);
  const [matchError,setMatchError] = useState('');
  const [customQuestions, setCustomQuestions] = useState([]);
  const [customQuestionsLoading, setCustomQuestionsLoading] = useState(false);
  const [loadingSavedProfile, setLoadingSavedProfile] = useState(false);
  const [mentorHistory, setMentorHistory] = useState([
    {role:'assistant', content:'Ask me about exams, colleges, streams, careers, scholarships or what to do next. I will keep it focused on your education path.'}
  ]);

  useEffect(() => {
    if (user && user.email) {
      const pendingProfileStr = localStorage.getItem('edumatch_pending_profile');
      const pendingCareer = localStorage.getItem('edumatch_pending_career');
      const pendingInterestStr = localStorage.getItem('edumatch_pending_interest');
      const pendingGenerate = localStorage.getItem('edumatch_pending_generate');

      if (pendingProfileStr || pendingCareer) {
        // Restore guest inputs
        if (pendingCareer) setCareer(pendingCareer);
        if (pendingProfileStr) setProfile(JSON.parse(pendingProfileStr));
        if (pendingInterestStr) setInterestProfile(JSON.parse(pendingInterestStr));
        setHasSelectedGoal(true);

        // Clear local storage items
        localStorage.removeItem('edumatch_pending_profile');
        localStorage.removeItem('edumatch_pending_career');
        localStorage.removeItem('edumatch_pending_interest');
        localStorage.removeItem('edumatch_pending_generate');

        const runPendingMatches = async (restoredCareer, restoredProfile) => {
          setMatchLoading(true);
          setMatchError('');
          try {
            const response = await api.match({ userEmail: user.email, career: restoredCareer, profile: restoredProfile });
            setMatchResult(response);
            setMatchesGenerated(true);
            
            // Save to backend database
            await api.saveProfile({
              userEmail: user.email,
              career: restoredCareer,
              profile: restoredProfile,
              matchResult: response
            });
            navigate('/results', { allowResults: true });
          } catch (e) {
            setMatchError('Backend is not reachable yet, so EduMatch used the local recommendation fallback.');
            setMatchesGenerated(true);
            try {
              await api.saveProfile({
                userEmail: user.email,
                career: restoredCareer,
                profile: restoredProfile,
                matchResult: null
              });
            } catch {}
            navigate('/results', { allowResults: true });
          } finally {
            setMatchLoading(false);
          }
        };

        if (pendingGenerate === 'true') {
          runPendingMatches(pendingCareer || career, pendingProfileStr ? JSON.parse(pendingProfileStr) : profile);
        }
      } else {
        const loadSavedData = async () => {
          setLoadingSavedProfile(true);
          try {
            const res = await api.loadProfile({ userEmail: user.email });
            if (res && res.success) {
              if (res.career) {
                setCareer(res.career);
                setHasSelectedGoal(true);
              }
              if (res.profile) {
                setProfile(res.profile);
              }
              if (res.matchResult) {
                setMatchResult(res.matchResult);
                setMatchesGenerated(true);
              }
            }
          } catch (e) {
            console.error("Error loading saved user profile:", e);
          } finally {
            setLoadingSavedProfile(false);
          }
        };
        loadSavedData();
      }
    } else {
      setCareer('');
      setCustomGoal('');
      setInterestProfile(initialInterestProfile);
      setProfile(initialProfile);
      setHasSelectedGoal(false);
      setMatchesGenerated(false);
      setMatchResult(null);
      setMentorHistory([
        {role:'assistant', content:'Ask me about exams, colleges, streams, careers, scholarships or what to do next. I will keep it focused on your education path.'}
      ]);
    }
  }, [user]);

  // Reactive hook to fetch custom career questions matching the user's specific education stage
  useEffect(() => {
    if (career && career !== explorationCareer) {
      const fetchQuestions = async () => {
        setCustomQuestionsLoading(true);
        try {
          const response = await api.customQuestions({ 
            career, 
            educationStage: profile.educationStage,
            profile
          });
          setCustomQuestions(response.questions || []);
        } catch (e) {
          console.error("Failed to fetch custom questions dynamically:", e);
          setCustomQuestions([]);
        } finally {
          setCustomQuestionsLoading(false);
        }
      };
      fetchQuestions();
    } else {
      setCustomQuestions([]);
    }
  }, [career, profile.educationStage, profile.stream, profile.board]);

  const saveProfileDraft = async (updatedProfile = profile, updatedCareer = career, updatedMatch = matchResult) => {
    if (!user || !user.email) return;
    try {
      await api.saveProfile({
        userEmail: user.email,
        career: updatedCareer,
        profile: updatedProfile,
        matchResult: updatedMatch
      });
    } catch (e) {
      console.error("Failed to save profile draft:", e);
    }
  };

  const pick = async c => {
    setHasSelectedGoal(true);
    setMatchesGenerated(false);
    setCareer(c);
    const streamOptions = streamOptionsFor(c);
    const askExams = shouldAskEntranceExams(c);
    setProfile(current => {
      const updated = {
        ...current,
        stream: streamOptions.includes(current.stream) ? current.stream : streamOptions[0],
        exams: askExams ? [{name:examsFor(c)[0][0], status:'Expected', result:''}] : [],
        proofSignal:'',
        skillSignal:'',
        reviewSignal:'',
        customAnswers: {}
      };
      if (updated.dreamWhy && updated.dreamWhy.startsWith('Exploration analysis:')) {
        updated.dreamWhy = '';
      }
      if (updated.prototype === 'Try 3 mini projects from different fields') {
        updated.prototype = '';
      }
      if (updated.audience === 'Explore multiple mini-paths before choosing') {
        updated.audience = '';
      }
      if (updated.mentor === 'Career counsellor + field mentors') {
        updated.mentor = '';
      }
      if (updated.income === 'No money pressure yet - test interests first') {
        updated.income = '';
      }
      return updated;
    });
    navigate('/profile', {allowProfile:true});
  };

  const beginCustomGoal = async () => {
    if (!user) {
      if (onAuth) onAuth('register');
      return;
    }
    const goal = customGoal.trim();
    if (!goal) return;
    setHasSelectedGoal(true);
    setMatchesGenerated(false);
    setCareer(goal);
    const streamOptions = streamOptionsFor(goal);
    setProfile(current => {
      const updated = {
        ...current,
        stream: streamOptions.includes(current.stream) ? current.stream : streamOptions[0],
        exams:[],
        customAnswers: {}
      };
      if (updated.dreamWhy && updated.dreamWhy.startsWith('Exploration analysis:')) {
        updated.dreamWhy = '';
      }
      if (updated.prototype === 'Try 3 mini projects from different fields') {
        updated.prototype = '';
      }
      if (updated.audience === 'Explore multiple mini-paths before choosing') {
        updated.audience = '';
      }
      if (updated.mentor === 'Career counsellor + field mentors') {
        updated.mentor = '';
      }
      if (updated.income === 'No money pressure yet - test interests first') {
        updated.income = '';
      }
      return updated;
    });
    navigate('/profile', {allowProfile:true});
  };

  const updateInterestProfile = (key,value) => setInterestProfile(current => ({...current,[key]:value}));

  const beginInterestAnalysis = () => {
    setHasSelectedGoal(true);
    setMatchesGenerated(false);
    setCareer(explorationCareer);
    setProfile(current => ({
      ...current,
      stream:'Undecided — guide me',
      exams:[],
      dreamWhy:`Exploration analysis: hobbies - ${interestProfile.hobby}; favourite subject - ${interestProfile.subject}; preferred activity - ${interestProfile.activity}; problem interest - ${interestProfile.problem}; environment - ${interestProfile.environment}.`,
      prototype:'Try 3 mini projects from different fields',
      audience:'Explore multiple mini-paths before choosing',
      mentor:'Career counsellor + field mentors',
      income:'No money pressure yet - test interests first',
      proofSignal:'',
      skillSignal:'',
      reviewSignal:''
    }));
    navigate('/profile', {allowProfile:true});
  };

  const updateProfile = (key,value) => {
    setMatchesGenerated(false);
    setProfile(current => ({...current,[key]:value}));
  };

  const generateMatches = async () => {
    if (!user) {
      // Save local entries to draft state before login prompt
      localStorage.setItem('edumatch_pending_profile', JSON.stringify(profile));
      localStorage.setItem('edumatch_pending_career', career);
      localStorage.setItem('edumatch_pending_interest', JSON.stringify(interestProfile));
      localStorage.setItem('edumatch_pending_generate', 'true');
      if (onAuth) onAuth('register');
      return;
    }
    setMatchLoading(true);
    setMatchError('');
    try {
      const response = await api.match({userEmail: user?.email, career, profile});
      setMatchResult(response);
      setMatchesGenerated(true);
      
      // Save profile and matches to backend
      try {
        await api.saveProfile({
          userEmail: user.email,
          career,
          profile,
          matchResult: response
        });
      } catch (saveErr) {
        console.error("Failed to save matches on backend:", saveErr);
      }
      
      navigate('/results', {allowResults:true});
    } catch {
      setMatchError('Backend is not reachable yet, so EduMatch used the local recommendation fallback.');
      setMatchesGenerated(true);
      
      // Try to save draft profile even if recommendation server had an issue
      try {
        await api.saveProfile({
          userEmail: user.email,
          career,
          profile,
          matchResult: null
        });
      } catch {}
      
      navigate('/results', {allowResults:true});
    } finally {
      setMatchLoading(false);
    }
  };

  const toggleExam = name => setProfile(current => {
    setMatchesGenerated(false);
    if (name === 'Not taking an entrance exam') return {...current, exams:[{name,status:'Not applicable',result:''}]};
    const active = current.exams.filter(exam => exam.name !== 'Not taking an entrance exam');
    const exists = active.some(exam => exam.name === name);
    return {...current, exams: exists ? active.filter(exam => exam.name !== name) : [...active,{name,status:'Expected',result:''}]};
  });

  const updateExam = (name,key,value) => {
    setMatchesGenerated(false);
    setProfile(current => ({
      ...current,
      exams: current.exams.map(exam => exam.name === name ? {...exam,[key]:value} : exam)
    }));
  };

  const isPreSeniorStage = ['Seeking 11th–12th admission'].includes(profile.educationStage);
  const isSchoolStage = ['Seeking 11th–12th admission'].includes(profile.educationStage);
  const needsIntermediate = isSchoolStage;
  const visibleColleges = matchResult?.colleges?.length ? matchResult.colleges : (needsIntermediate ? intermediateColleges : colleges);
  const isExplorationPath = career === explorationCareer;
  const isCustomPath = !isExplorationPath && (career === 'Build My Own Path' || (!careers.includes(career) && isBusinessOrIndependentGoal(career)));
  const askEntranceExams = shouldAskEntranceExams(career) && !isCustomPath && !isExplorationPath;
  const currentMeta = matchResult?.pathMeta?.length === 4
    ? matchResult.pathMeta
    : isExplorationPath
      ? ['EXPLORING', 'No fixed career yet', 'Interest Discovery Lab', `${profile.prototype || 'Multiple paths'} - hobbies - strengths - mini experiments`]
    : isSchoolStage
    ? ['LOCKED','After Class 12 + entrance results','11th-12th Pathway First',`${profile.stream} - foundations - exams - career clarity`]
    : (pathMeta[career] || ['100%', profile.income || 'Prototype your earning model', profile.prototype || 'Personal Path Studio', `${profile.audience || career} - ${profile.mentor || 'mentors'} - proof-of-work`]);
  const activeRoadmap = streamRoadmaps[profile.stream] || streamRoadmaps['Undecided — guide me'];

  return {
    career, customGoal, setCustomGoal, interestProfile, sent, setSent, profile, hasSelectedGoal, matchesGenerated, matchResult, matchLoading, matchError, loadingSavedProfile,
    mentorHistory, setMentorHistory,
    pick, beginCustomGoal, updateInterestProfile, beginInterestAnalysis, updateProfile, toggleExam, updateExam, generateMatches, saveProfileDraft,
    isPreSeniorStage, isSchoolStage, needsIntermediate, visibleColleges, isExplorationPath, isCustomPath, askEntranceExams, currentMeta, activeRoadmap, customQuestions, customQuestionsLoading
  };
}
