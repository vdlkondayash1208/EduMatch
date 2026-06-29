const API_BASE = import.meta.env.VITE_API_BASE || 'https://edumatch-zufb.onrender.com';

async function request(path, body){
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
  } catch (err) {
    const hint = `Cannot reach the API server at ${API_BASE}. Make sure the backend is running and VITE_API_BASE is set correctly in your .env file.`;
    throw new Error(hint);
  }
  if (!response.ok) throw new Error(`API ${path} failed with ${response.status}`);
  return response.json();
}

export const api = {
  auth: account => request('/api/auth', account),
  match: payload => request('/api/match', payload),
  mentor: payload => request('/api/mentor', payload),
  searchColleges: payload => request('/api/colleges/search', payload),
  customQuestions: payload => request('/api/custom-questions', payload),
  predictChance: payload => request('/api/chance', payload),
  saveProfile: payload => request('/api/profile/save', payload),
  loadProfile: payload => request('/api/profile/get', payload)
};
