const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

async function request(path, body){
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
  } catch (err) {
    const isLocalhost = API_BASE.includes('127.0.0.1') || API_BASE.includes('localhost');
    const hint = isLocalhost
      ? 'Cannot reach the backend server. Make sure it is running locally (cd backend && python run_backend.py) and VITE_API_BASE is set in your .env file.'
      : `Cannot reach the API server at ${API_BASE}.`;
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
