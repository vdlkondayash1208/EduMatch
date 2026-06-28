from __future__ import annotations

import hashlib
import json
import os
import re
import sqlite3
import uuid
from typing import Any

import httpx
import mysql.connector
from mysql.connector import Error as MySQLError
from supabase import Client, create_client, ClientOptions

from .data import COLLEGES, INTERMEDIATE_COLLEGES, ROADMAPS
from .models import AlternativeCollege, ChancePredictRequest, ChancePredictResponse, College, CustomQuestion, CustomQuestionsRequest, CustomQuestionsResponse, MatchRequest, MatchResponse, MentorRequest, MentorResponse, StudentProfile
from .settings import Settings


def infer_group(career: str | None) -> str:
    text = (career or "").lower()
    if re.search(r"engineer|tech|software|coding|robot|data|ai|machine|civil|mechanical|electrical", text):
        return "engineering"
    if re.search(r"film|media|design|music|photo|creator|game|animation|art|fashion", text):
        return "creative"
    return "general"


def route_from_text(text: str) -> str | None:
    lowered = text.lower()
    routes = {
        "/colleges": ["college", "cutoff", "rank", "eamcet", "eapcet", "jee", "bitsat", "admission"],
        "/roadmap": ["roadmap", "plan", "steps", "timeline", "prepare", "schedule"],
        "/profile": ["profile", "marks", "budget", "location", "stream", "exam result"],
        "/results": ["match", "recommend", "shortlist", "chance", "fit"],
        "/discover": ["career", "confused", "interest", "what should i become"],
    }
    for route, needles in routes.items():
        if any(needle in lowered for needle in needles):
            return route
    return None
def _sanitize_error(e: Exception, password: str | None = None) -> str:
    err_msg = getattr(e, "message", None) or str(e)
    if password and password in err_msg:
        err_msg = err_msg.replace(password, "[REDACTED]")
    return err_msg


class Store:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._supabase: Client | None = None
        
        # Initialize local SQLite database
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.db_path = os.path.join(backend_dir, "edumatch.db")
        self._init_sqlite()

    def _init_sqlite(self):
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS local_profiles (
                        user_email TEXT PRIMARY KEY,
                        career TEXT,
                        profile TEXT,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS local_matches (
                        user_email TEXT PRIMARY KEY,
                        career TEXT,
                        response TEXT,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS local_users (
                        id TEXT PRIMARY KEY,
                        email TEXT UNIQUE,
                        password TEXT,
                        name TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.commit()
        except Exception as e:
            print("SQLite initialization error:", e)

    @property
    def supabase(self) -> Client | None:
        if self.settings.supabase_url and self.settings.supabase_service_role_key:
            return create_client(
                self.settings.supabase_url,
                self.settings.supabase_service_role_key,
                options=ClientOptions(persist_session=False)
            )
        return None

    def _register_user_local(self, email: str, password: str, name: str) -> tuple[str | None, bool, str | None]:
        try:
            hashed_pw = hashlib.sha256(password.encode()).hexdigest()
            user_id = str(uuid.uuid4())
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT id FROM local_users WHERE email = ?", (email,))
                if cursor.fetchone():
                    return None, False, "User already registered locally"
                
                cursor.execute(
                    "INSERT INTO local_users (id, email, password, name) VALUES (?, ?, ?, ?)",
                    (user_id, email, hashed_pw, name)
                )
                conn.commit()
            return user_id, False, None
        except Exception as e:
            err_msg = _sanitize_error(e, password)
            return None, False, f"Local register failed: {err_msg}"

    def _login_user_local(self, email: str, password: str) -> tuple[str | None, bool, str | None, str | None]:
        try:
            hashed_pw = hashlib.sha256(password.encode()).hexdigest()
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute("SELECT id, name, password FROM local_users WHERE email = ?", (email,))
                user_row = cursor.fetchone()
                if not user_row:
                    return None, False, "Invalid credentials or account not found locally.", None
                if user_row["password"] != hashed_pw:
                    return None, False, "Invalid credentials", None
                return user_row["id"], False, None, user_row["name"]
        except Exception as e:
            err_msg = _sanitize_error(e, password)
            return None, False, f"Local login failed: {err_msg}", None

    def insert(self, table: str, payload: dict[str, Any]) -> bool:
        persisted = False
        client = self.supabase
        if client:
            try:
                client.table(table).insert(payload).execute()
                persisted = True
            except Exception:
                persisted = False
        self._mirror_mysql(table, payload)
        return persisted

    def register_user(self, email: str, password: str, name: str) -> tuple[str | None, bool, str | None]:
        client = self.supabase
        if not client:
            return self._register_user_local(email, password, name)
        try:
            # Check if user already exists
            result = client.table("app_users").select("id").eq("email", email).execute()
            if result.data and len(result.data) > 0:
                return None, False, "User already registered"

            try:
                auth_res = client.auth.sign_up({"email": email, "password": password})
                user_id = auth_res.user.id if auth_res.user else None
            except Exception as e:
                err_msg = _sanitize_error(e, password)
                # If they are already registered in auth but not in app_users
                if "already registered" in err_msg.lower():
                    # Attempt to fetch their ID via admin api or just let them login
                    return None, False, "Account exists but is incomplete. Please try logging in, or use a different email."
                return None, False, err_msg
                
            if not user_id:
                return None, False, "Failed to register"
            
            # Use a fresh service_role client to bypass RLS for the insert
            service_client = self.supabase
            service_client.table("app_users").upsert({"id": user_id, "email": email, "name": name}, on_conflict="email").execute()
            return user_id, True, None
        except Exception as e:
            err_msg = _sanitize_error(e, password)
            print(f"Supabase register failed ({type(e).__name__}: {err_msg}), trying local SQLite fallback...")
            return self._register_user_local(email, password, name)

    def login_user(self, email: str, password: str) -> tuple[str | None, bool, str | None, str | None]:
        client = self.supabase
        if not client:
            return self._login_user_local(email, password)
        try:
            auth_res = client.auth.sign_in_with_password({"email": email, "password": password})
            user_id = auth_res.user.id if auth_res.user else None
            if not user_id:
                return None, False, "Invalid credentials", None
            
            # Now check app_users with a fresh service client
            service_client = self.supabase
            user_check = service_client.table("app_users").select("id, name").eq("id", user_id).execute()
            
            # Self-heal if the previous bug caused them to be missing from app_users
            if not user_check.data or len(user_check.data) == 0:
                name = email.split("@")[0]
                service_client.table("app_users").upsert({"id": user_id, "email": email, "name": name}).execute()
            else:
                name = user_check.data[0].get("name")
                
            return user_id, True, None, name
        except Exception as e:
            err_msg = _sanitize_error(e, password)
            if "Invalid login credentials" in err_msg or "Invalid credentials" in err_msg:
                return None, False, "Invalid credentials or account not found.", None
            print(f"Supabase login failed ({type(e).__name__}: {err_msg}), trying local SQLite fallback...")
            return self._login_user_local(email, password)

    def save_user_profile(self, email: str, career: str, profile: Any, match_result: Any | None = None) -> bool:
        profile_data = profile.model_dump() if hasattr(profile, "model_dump") else (profile.dict() if hasattr(profile, "dict") else profile)
        match_data = match_result.model_dump() if hasattr(match_result, "model_dump") else (match_result.dict() if hasattr(match_result, "dict") else match_result) if match_result else None

        # 1. Save in local SQLite database
        sqlite_success = False
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT OR REPLACE INTO local_profiles (user_email, career, profile) VALUES (?, ?, ?)",
                    (email, career, json.dumps(profile_data))
                )
                if match_data:
                    cursor.execute(
                        "INSERT OR REPLACE INTO local_matches (user_email, career, response) VALUES (?, ?, ?)",
                        (email, career, json.dumps(match_data))
                    )
                conn.commit()
                sqlite_success = True
        except Exception as e:
            print("SQLite save profile error:", e)

        # 2. Save to Supabase (if configured and tables exist)
        supabase_success = False
        client = self.supabase
        if client:
            try:
                res = client.table("profiles").select("id").eq("user_email", email).execute()
                if res.data and len(res.data) > 0:
                    profile_id = res.data[0]["id"]
                    client.table("profiles").update({
                        "career": career,
                        "profile": profile_data
                    }).eq("id", profile_id).execute()
                else:
                    client.table("profiles").insert({
                        "user_email": email,
                        "career": career,
                        "profile": profile_data
                    }).execute()
                
                if match_data:
                    res_match = client.table("match_requests").select("id").eq("user_email", email).execute()
                    if res_match.data and len(res_match.data) > 0:
                        match_id = res_match.data[0]["id"]
                        client.table("match_requests").update({
                            "career": career,
                            "profile": profile_data,
                            "response": match_data
                        }).eq("id", match_id).execute()
                    else:
                        client.table("match_requests").insert({
                            "user_email": email,
                            "career": career,
                            "profile": profile_data,
                            "response": match_data
                        }).execute()
                supabase_success = True
            except Exception as e:
                print("Supabase save profile failed (using local SQLite fallback):", e)
        
        return sqlite_success or supabase_success

    def get_user_profile(self, email: str) -> dict | None:
        # 1. Try to read from Supabase first
        client = self.supabase
        if client:
            try:
                res_profile = client.table("profiles").select("career, profile").eq("user_email", email).order("created_at", desc=True).limit(1).execute()
                if res_profile.data and len(res_profile.data) > 0:
                    career = res_profile.data[0].get("career")
                    profile = res_profile.data[0].get("profile")
                    
                    match_res = client.table("match_requests").select("response").eq("user_email", email).order("created_at", desc=True).limit(1).execute()
                    match_result = None
                    if match_res.data and len(match_res.data) > 0:
                        match_result = match_res.data[0].get("response")
                    
                    return {
                        "career": career,
                        "profile": profile,
                        "matchResult": match_result
                    }
            except Exception as e:
                print("Supabase load profile failed (falling back to SQLite):", e)

        # 2. SQLite Fallback
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute("SELECT career, profile FROM local_profiles WHERE user_email = ?", (email,))
                profile_row = cursor.fetchone()
                if profile_row:
                    career = profile_row["career"]
                    profile = json.loads(profile_row["profile"])
                    
                    cursor.execute("SELECT response FROM local_matches WHERE user_email = ?", (email,))
                    match_row = cursor.fetchone()
                    match_result = json.loads(match_row["response"]) if match_row else None
                    
                    return {
                        "career": career,
                        "profile": profile,
                        "matchResult": match_result
                    }
        except Exception as e:
            print("SQLite load profile error:", e)

        return None

    def _mirror_mysql(self, table: str, payload: dict[str, Any]) -> None:
        if not self.settings.mysql_dsn:
            return
        try:
            conn = mysql.connector.connect(self.settings.mysql_dsn)
            cursor = conn.cursor()
            cursor.execute(
                """
                create table if not exists request_audit (
                  id bigint primary key auto_increment,
                  table_name varchar(80) not null,
                  payload json not null,
                  created_at timestamp default current_timestamp
                )
                """
            )
            cursor.execute(
                "insert into request_audit (table_name, payload) values (%s, %s)",
                (table, json.dumps(payload, default=str)),
            )
            conn.commit()
            cursor.close()
            conn.close()
        except (MySQLError, Exception):
            return


class OpenRouterClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    @property
    def enabled(self) -> bool:
        return bool(self.settings.openrouter_api_key)

    async def chat_json(self, messages: list[dict[str, str]], fallback: dict[str, Any]) -> dict[str, Any]:
        if not self.enabled:
            return fallback
        try:
            content = await self.chat_text(messages)
            match = re.search(r"\{.*\}", content, re.S)
            res = json.loads(match.group(0) if match else content)
            if isinstance(res, dict):
                return {k: v for k, v in res.items() if v is not None}
            return res
        except Exception:
            return fallback

    async def chat_text(self, messages: list[dict[str, str]]) -> str:
        if not self.enabled:
            raise RuntimeError("OpenRouter is not configured")
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.settings.openrouter_api_key}",
                    "HTTP-Referer": self.settings.openrouter_site_url,
                    "X-Title": self.settings.openrouter_app_name,
                },
                json={
                "model": self.settings.openrouter_model,
                "messages": messages,
                "temperature": 0.35,
                "max_tokens": 1800,
            },
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]


def get_fallback_job_progression(career: str) -> list[dict[str, Any]]:
    career_lower = (career or "").lower()
    if any(x in career_lower for x in ["film", "media", "creator", "video", "photo", "music"]):
        return [
            {"level": "Entry Level", "title": "Production Assistant / Content Intern", "salary": "₹3L–6L / year", "skills": "Video Editing, Camera handling, Storyboarding"},
            {"level": "Mid Level", "title": "Assistant Director / Main Editor", "salary": "₹8L–15L / year", "skills": "Color Grading, Creative Direction, Audio Mixing"},
            {"level": "Advanced Level", "title": "Director / Executive Producer", "salary": "₹20L–60L+ / year", "skills": "Pitching, Screenplay Development, Team Management"}
        ]
    elif any(x in career_lower for x in ["design", "artist", "ux", "ui", "game"]):
        return [
            {"level": "Entry Level", "title": "Junior UX/UI Designer", "salary": "₹4L–8L / year", "skills": "Figma, Visual Design, Prototyping"},
            {"level": "Mid Level", "title": "Product / Lead Designer", "salary": "₹12L–22L / year", "skills": "User Research, Design Systems, Client Consulting"},
            {"level": "Advanced Level", "title": "Design Director / Head of Product Design", "salary": "₹25L–50L+ / year", "skills": "Product Strategy, Leadership, Design Advocacy"}
        ]
    elif any(x in career_lower for x in ["business", "entrepreneur", "startup", "finance"]):
        return [
            {"level": "Entry Level", "title": "Marketing / Business Analyst", "salary": "₹5L–9L / year", "skills": "Excel, Market Research, Communication"},
            {"level": "Mid Level", "title": "Product Manager / Operations Lead", "salary": "₹14L–25L / year", "skills": "Product Strategy, SQL, Stakeholder Management"},
            {"level": "Advanced Level", "title": "Chief Operating Officer / VP of Growth", "salary": "₹30L–75L+ / year", "skills": "Scale Strategies, Financial Modeling, Board Leadership"}
        ]
    else: # Default/Engineering/Science
        return [
            {"level": "Entry Level", "title": "Junior Software / Systems Engineer", "salary": "₹6L–12L / year", "skills": "Programming basics, DSA, Git"},
            {"level": "Mid Level", "title": "Senior Engineer / Systems Architect", "salary": "₹15L–28L / year", "skills": "System Design, Cloud APIs, Project Ownership"},
            {"level": "Advanced Level", "title": "VP of Engineering / Principal Architect", "salary": "₹35L–80L+ / year", "skills": "Organizational Leadership, Tech Strategy, Mentorship"}
        ]


def get_fallback_course_profile(career: str) -> list[str]:
    career_lower = (career or "").lower()
    if any(x in career_lower for x in ["film", "media", "creator", "video", "photo", "music"]):
        return ["Introduction to Cinema Studies", "Screenwriting & Storytelling", "Cinematography & Sound", "Post-Production Editing"]
    elif any(x in career_lower for x in ["design", "artist", "ux", "ui", "game"]):
        return ["Visual Identity & Typography", "User Interface (UI) Design", "Interaction & Experience Design", "Design Systems & Research"]
    elif any(x in career_lower for x in ["business", "entrepreneur", "startup", "finance"]):
        return ["Principles of Accounting", "Corporate Finance & Valuation", "Marketing & Growth Strategy", "Leadership & Organizational Scale"]
    else:
        return ["Computer Science Core (DSA)", "Database Management Systems", "Artificial Intelligence & ML", "Software Engineering Methods"]


def get_fallback_scholarships(career: str) -> list[str]:
    return [
        "Central Sector Scheme of Scholarship",
        "National Scholarship Portal (NSP) Merit Aid",
        "State Government Fee Reimbursement Scheme",
        "Corporate Social Responsibility (CSR) Aid"
    ]


def seeded_colleges(career: str, profile: dict[str, Any], query: str = "") -> list[College]:
    stage = profile.get("educationStage", "")
    pool = INTERMEDIATE_COLLEGES if stage in {"Class 9 or 10", "Seeking 11th-12th admission", "Class 11 or 12"} else COLLEGES
    text = f"{career} {query} {profile.get('stream', '')} {' '.join(exam.get('name', '') for exam in profile.get('exams', []))}".lower()
    scored = []
    for item in pool:
        haystack = " ".join([item["name"], item["city"], item.get("state", ""), item["field"], " ".join(item["exams"])]).lower()
        overlap = sum(1 for token in set(re.findall(r"[a-z0-9]+", text)) if len(token) > 2 and token in haystack)
        scored.append((overlap, item))
    
    colleges_mapped = []
    for _, item in sorted(scored, key=lambda pair: (pair[0], pair[1]["score"]), reverse=True)[:6]:
        item_copy = dict(item)
        if "courseProfile" not in item_copy or not item_copy["courseProfile"]:
            item_copy["courseProfile"] = get_fallback_course_profile(career)
        if "scholarshipsAvailable" not in item_copy or not item_copy["scholarshipsAvailable"]:
            item_copy["scholarshipsAvailable"] = get_fallback_scholarships(career)
        colleges_mapped.append(College(**item_copy))
    return colleges_mapped


async def build_match(request: MatchRequest, ai: OpenRouterClient, store: Store) -> MatchResponse:
    profile = request.profile.model_dump()
    colleges = seeded_colleges(request.career, profile)
    group = infer_group(request.career)
    
    colleges_list = []
    for c in colleges:
        c_dict = c.model_dump()
        if not c_dict.get("courseProfile"):
            c_dict["courseProfile"] = get_fallback_course_profile(request.career)
        if not c_dict.get("scholarshipsAvailable"):
            c_dict["scholarshipsAvailable"] = get_fallback_scholarships(request.career)
        colleges_list.append(c_dict)

    fallback = {
        "colleges": colleges_list,
        "analysis": (
            "This shortlist is based on your stage, stream, exams, budget and career goal. "
            "For live ranks and cutoffs, connect official counselling or search APIs and re-run analysis."
        ),
        "roadmap": ROADMAPS.get(group, ROADMAPS["general"]),
        "pathMeta": ["100%", "Prototype your earning model", "Personal Path Studio", f"{request.career} - mentors - proof-of-work"],
        "dayInLife": [["08:00", "Morning class"], ["12:15", "Lunch break"], ["14:00", "Practical session"], ["17:30", "Club meeting"], ["21:00", "Self study"]],
        "redirectTo": "/results",
        "jobProgression": get_fallback_job_progression(request.career)
    }
    ai_payload = await ai.chat_json(
        [
            {
                "role": "system",
                "content": (
                    "You are EduMatch, an Indian education mentor. Return strict JSON with keys: "
                    "colleges (list of objects with name, city, state, field, exams list, cutoffHint, score 0-100, chance, roi, placement, color hex code, sourceNote, courseProfile (list of strings for key subjects), scholarshipsAvailable (list of strings)), "
                    "analysis, redirectTo, roadmap (list of lists with 3 strings each: timeframe, title, description), pathMeta (list of exactly 4 strings summarizing career stats: [Confidence, Salary Expectation, Primary Focus, Key Advice]), "
                    "dayInLife (list of exactly 5 lists with 2 strings each: time e.g. '08:00', title), "
                    "and jobProgression (list of objects with keys 'level' (Entry Level, Mid Level, Advanced Level), 'title', 'salary', 'skills'). "
                    "Make the colleges highly tailored to the user's career and profile. Do not invent exact real-time cutoffs, but provide highly realistic and specific predictions. "
                    "CRITICAL: Do not just echo sample colleges. Generate the absolute best, most accurate multiple college recommendations strictly based on the user's requirements (budget, location, stream, exams). "
                    "If the user's career goal is 'I'm not sure yet' or similar, you MUST analyze their interests/hobbies provided in the profile, explicitly suggest the top 2-3 best-fit career paths in the 'analysis' field, and recommend versatile colleges suited for those paths. "
                    "Tailor the 'roadmap' to the user's educationStage. If they are 'Seeking 11th-12th admission' or in 'Class 11 or 12', the roadmap MUST be a 2-year preparation timeline focusing on 11th/12th grade, board exams, and entrance prep, NOT a 4-year university degree timeline. "
                    "CRITICAL EVALUATION: Analyze the user's academic credentials (Class 10 and 12 marks, stream selection, and entrance exams/scores) against their target career goal. "
                    "Some careers require high merit or minimum qualifications (e.g. engineering at top colleges requiring high JEE ranks/PCM stream, medical requiring PCB/NEET). "
                    "If the user's qualifications make this target career highly difficult or unrealistic, or they fail to meet the standard stream/exam requirements: "
                    "1. You MUST explicitly state in the 'analysis' field that this may not be an ideal option based on their current qualifications. "
                    "2. You MUST suggest alternative, more realistic fields or colleges in the 'analysis' field that better fit their profile. "
                    "3. You MUST lower the Confidence rating returned in 'pathMeta[0]' to a lower value (e.g., a percentage like '45%' or a label like 'Low' or 'Moderate'). "
                    "CRITICAL pathMeta[0] FORMAT: Make sure 'pathMeta[0]' is just the clean confidence level/percentage (e.g., 'High', 'Moderate', 'Low', '85%'). DO NOT include any prefix like 'Confidence: ' in 'pathMeta[0]'."
                ),
            },
            {"role": "user", "content": json.dumps({"career": request.career, "profile": profile})},
        ],
        fallback,
    )
    
    returned_colleges = []
    for c in ai_payload.get("colleges", fallback["colleges"]):
        if not isinstance(c, dict):
            continue
        c_clean = {k: v for k, v in c.items() if v is not None}
        c_clean.setdefault("name", "Unknown College")
        c_clean.setdefault("city", "India")
        c_clean.setdefault("cutoffHint", "Verify cutoffs from official counselling portals.")
        c_clean.setdefault("chance", "Target")
        c_clean.setdefault("roi", "N/A")
        c_clean.setdefault("placement", "N/A")
        try:
            returned_colleges.append(College(**c_clean))
        except Exception as e:
            print("Error parsing college:", e, c_clean)
    
    response = MatchResponse(
        colleges=returned_colleges,
        analysis=ai_payload.get("analysis") or fallback["analysis"],
        roadmap=ai_payload.get("roadmap") or fallback["roadmap"],
        pathMeta=ai_payload.get("pathMeta") or fallback["pathMeta"],
        dayInLife=ai_payload.get("dayInLife") or fallback["dayInLife"],
        redirectTo=ai_payload.get("redirectTo") or "/results",
        realtime=ai.enabled,
        jobProgression=ai_payload.get("jobProgression") or fallback["jobProgression"]
    )
    response.persisted = store.insert(
        "match_requests",
        {
            "user_email": str(request.userEmail) if request.userEmail else None,
            "career": request.career,
            "profile": profile,
            "response": response.model_dump(),
        },
    )
    return response


async def mentor_reply(request: MentorRequest, ai: OpenRouterClient, store: Store) -> MentorResponse:
    redirect = route_from_text(request.message)
    fallback_answer = (
        "I can help with that. Based on your profile, start by clarifying your target exam, current marks, "
        "budget and preferred location. For colleges and cutoffs, use the Colleges page and verify current "
        "round data from official counselling portals before making decisions."
    )
    answer = fallback_answer
    if ai.enabled:
        system_content = (
            "You are Edu, a friendly and humane AI mentor for Indian students. \n"
            "CRITICAL INSTRUCTIONS:\n"
            "1. Act like a real human in a chat app. Keep your responses EXTREMELY short, conversational, and direct (1-3 sentences maximum).\n"
            "2. NEVER write huge walls of text, bulleted lists, or essays unless the user explicitly asks for a detailed plan.\n"
            "3. Below is the user's current profile and career goal. Use this context ONLY when it is directly relevant to their question; do not list their details.\n"
            "4. Do not fabricate exact live cutoffs; say when official current data is needed. If a page helps, mention it naturally.\n"
        )
        if redirect:
            tool_names = {
                "/colleges": "Colleges Explorer",
                "/roadmap": "Personal Roadmap",
                "/profile": "Student Profile Setup",
                "/results": "EduMatch Recommendation Results",
                "/discover": "Career Discovery Hub"
            }
            tool_name = tool_names.get(redirect, "suggested tool")
            system_content += (
                f"5. IMPORTANT: We are providing a shortcut button to the '{tool_name}' page directly below your message. "
                f"You MUST explicitly mention the '{tool_name}' in your reply, explain how it is relevant, "
                f"and tell the user in a fancy and inviting way to click the card button below (do not assume automatic redirection).\n"
            )
        system_content += f"\nUser Context:\nCareer: {request.career}\nProfile: {json.dumps(request.profile)}"

        messages = [
            {
                "role": "system",
                "content": system_content,
            },
            *[m.model_dump() for m in request.history[-8:]],
        ]
        try:
            answer = await ai.chat_text(messages)
        except Exception:
            answer = fallback_answer
    persisted_user = store.insert(
        "mentor_messages",
        {
            "user_email": str(request.userEmail) if request.userEmail else None,
            "session_id": request.sessionId,
            "role": "user",
            "content": request.message,
            "metadata": {"career": request.career, "profile": request.profile},
        },
    )
    persisted_assistant = store.insert(
        "mentor_messages",
        {
            "user_email": str(request.userEmail) if request.userEmail else None,
            "session_id": request.sessionId,
            "role": "assistant",
            "content": answer,
            "metadata": {"redirectTo": redirect, "model": ai.settings.openrouter_model if ai.enabled else None},
        },
    )
    return MentorResponse(
        answer=answer,
        redirectTo=redirect,
        suggestions=["Show matching colleges", "Build my roadmap", "Check my exam strategy"],
        persisted=persisted_user or persisted_assistant,
        model=ai.settings.openrouter_model if ai.enabled else None,
    )


async def predict_chance(request: ChancePredictRequest, ai: OpenRouterClient, store: Store) -> ChancePredictResponse:
    category_label = request.category or "General"
    fallback = {
        "status": "Target",
        "chancePercentage": 65 + (5 if category_label != "General" else 0),
        "cutoffDetail": f"Typical cutoff for {category_label} is ~85%. Your credentials fit well within reservation ranges.",
        "analysis": f"You have a realistic chance at this institution under the {category_label} category. Cutoffs may vary based on exact counseling lists.",
        "alternatives": []
    }
    
    ai_payload = await ai.chat_json(
        [
            {
                "role": "system",
                "content": (
                    "You are an expert Indian college admission counselor. Evaluate the user's credentials against their target college, course, and reservation category. "
                    "CRITICAL: You must provide a realistic evaluation for ANY college the user inputs. This includes local tier-3 private colleges, regional state universities, as well as top-tier institutes like IITs. Do NOT reject or give generic answers for lesser-known colleges; deduce the requirements based on the type of college. "
                    "You MUST evaluate the candidate based on their specified category (General, OBC, SC, ST, EWS) as cutoffs are significantly different. "
                    "CRITICAL BUDGET/FINANCIAL EVALUATION: You MUST compare the candidate's yearly budget (provided in 'credentials.budget') against the estimated annual fees of the target college. For example, private universities like SRM, VIT, Manipal, BITS, etc., have high annual fees (~2.5L to 4.5L+ per year). If the user's budget is significantly less than the estimated annual fees of the college (e.g., a budget of '50000' or similar low number for SRM, VIT, BITS, etc.), you MUST set the 'status' to 'Unlikely' or 'Reach', lower the 'chancePercentage' to less than 30%, explicitly note in both 'cutoffDetail' and 'analysis' that the college's annual fees (specify estimated fee) exceed their yearly budget, and suggest lower-cost alternative colleges (like government colleges or cheaper local options) in the 'alternatives' list. "
                    "Return strict JSON with these EXACT keys: "
                    "1. 'status': (e.g. 'Safety', 'Target', 'Reach', 'Unlikely'). "
                    "2. 'chancePercentage': (integer 0-100). "
                    "3. 'cutoffDetail': A short, punchy sentence stating the estimated typical cutoff for their category vs the user's actual score (e.g. 'Typical OBC cutoff is ~94 percentile; your 92% is slightly below.'). "
                    "4. 'analysis': A concise, punchy, 2-3 sentence explanation. DO NOT write an essay. Be direct. CRITICAL: If the target college requires an entrance exam and the user didn't mention taking it, you MUST explicitly name the EXACT exam(s) required (e.g. 'CUET', 'JEE Mains', 'MHT-CET') and state that they need to take it. NEVER just say 'requires an entrance exam' without naming it. ALSO, explicitly mention if there is a 'management quota' or direct admission option by paying higher fees, so the student knows they can join without the test. "
                    "5. 'alternatives': If the user's performance is not matching (e.g., 'Reach' or 'Unlikely'), explicitly provide 2-3 other alternative colleges that are a better realistic fit for their credentials. "
                    "Each alternative must be an object with: 'name' (string), 'matchPercentage' (integer 0-100), and 'reason' (short string). If their performance is good, leave this array empty."
                )
            },
            {"role": "user", "content": json.dumps({"targetCollege": request.targetCollege, "targetCourse": request.targetCourse, "credentials": request.credentials, "category": category_label})}
        ],
        fallback
    )
    
    response = ChancePredictResponse(
        status=ai_payload.get("status") or fallback["status"],
        chancePercentage=ai_payload.get("chancePercentage") if ai_payload.get("chancePercentage") is not None else fallback["chancePercentage"],
        cutoffDetail=ai_payload.get("cutoffDetail") or fallback["cutoffDetail"],
        analysis=ai_payload.get("analysis") or fallback["analysis"],
        alternatives=[]
    )
    
    alternatives = []
    for alt in ai_payload.get("alternatives", []):
        if not isinstance(alt, dict):
            continue
        alt_clean = {k: v for k, v in alt.items() if v is not None}
        alt_clean.setdefault("name", "Alternative College")
        alt_clean.setdefault("matchPercentage", 70)
        alt_clean.setdefault("reason", "Good alternative option")
        try:
            alternatives.append(AlternativeCollege(**alt_clean))
        except Exception:
            pass
    response.alternatives = alternatives
    
    store.insert("chance_predictions", {
        "user_email": str(request.userEmail) if request.userEmail else None,
        "target_college": request.targetCollege,
        "target_course": request.targetCourse,
        "credentials": request.credentials,
        "category": category_label,
        "response": response.model_dump()
    })
    
    return response



def get_local_custom_questions(career: str, profile: StudentProfile | None = None) -> list[dict[str, Any]]:
    c = (career or "").lower()
    stage = profile.educationStage if profile else None
    is_school = stage == "Seeking 11th–12th admission"
    
    # Category 1: Sports & Athletics
    if any(x in c for x in ["swim", "sport", "cricket", "athlet", "football", "run", "badminton", "tennis", "gym", "coach", "boxer", "wrestl", "hockey"]):
        return [
            {"id": "q1", "small": "Training Regime", "title": "How many hours do you train in a day?", "note": "Consistency is key in athletic careers.", "options": ["Under 2 hours", "2–4 hours", "4–6 hours", "Over 6 hours"]},
            {"id": "q2", "small": "Coaching & Academy", "title": "What is your current coaching support?", "note": "Professional guidance makes a huge difference.", "options": ["Self-trained / school coach", "Local private club/academy", "State-level academy", "Elite national-level academy"]},
            {"id": "q3", "small": "Competition Level", "title": "What is your target competition milestone?", "note": "Define your competitive horizon.", "options": ["District/School level", "State level trials", "National championships", "International / Olympics"]},
            {"id": "q4", "small": "Physical Fitness", "title": "How do you track your fitness and nutrition?", "note": "Athletes need custom diet and strength training.", "options": ["No strict track yet", "Basic self-managed diet", "Professional trainer / nutritionist", "Academy-provided sports science team"]},
            {"id": "q5", "small": "Injury Management", "title": "Do you have access to physiotherapy support?", "note": "Injury prevention is vital for career longevity.", "options": ["No access currently", "Basic first-aid / family doc", "Regular sports physiotherapist", "Full sports medicine center support"]},
            {"id": "q6", "small": "Education Balance", "title": "How do you plan to balance education with sports?", "note": "Many athletes choose flexible schooling options.", "options": ["Regular school/college", "Flexible attendance waiver", "NIOS / open schooling", "Sports scholarship / full-time sports academy"]}
        ]
    
    # Category 2: Business & Startup
    elif any(x in c for x in ["business", "cafe", "startup", "founder", "shop", "boutique", "store", "agency", "restaurant", "hotel", "franchise"]):
        return [
            {"id": "q1", "small": "Initial Capital", "title": "What is your source of starting capital?", "note": "Funding is key for physical or digital businesses.", "options": ["Self-funded / family loan", "Angel investors / Pitching", "Bank business loan", "Bootstrap (starting with zero/minimal cost)"]},
            {"id": "q2", "small": "Business Model", "title": "How will your business generate revenue?", "note": "Your primary monetization strategy.", "options": ["Direct product sales", "Service fees / subscriptions", "Commission / marketplace margin", "Advertising & sponsorship"]},
            {"id": "q3", "small": "Location / Space", "title": "Where will your business primarily operate?", "note": "Decide on physical vs digital setup.", "options": ["Purely online / website / social", "Physical rented commercial space", "Home-based / cloud kitchen / workshop", "Co-working space / shared hub"]},
            {"id": "q4", "small": "Target Customer", "title": "Who is your primary customer segment?", "note": "Focus on your ideal audience.", "options": ["Local neighborhood residents", "Students and young adults", "Corporate clients / B2B", "Global online market"]},
            {"id": "q5", "small": "Marketing Strategy", "title": "How will you get your first 100 customers?", "note": "Customer acquisition strategy.", "options": ["Word of mouth & local flyers", "Social media & organic content", "Paid online ads (Google/Insta)", "Strategic business partnerships"]},
            {"id": "q6", "small": "Scale & Growth", "title": "What is your goal for the first year?", "note": "Define your year 1 milestone.", "options": ["Break even / cover costs", "Open a second branch/location", "Scale online reach to other cities", "Build a small solid local client list"]}
        ]

    # Category 3: Creative & Arts
    elif any(x in c for x in ["act", "film", "music", "sing", "art", "paint", "writer", "book", "author", "design", "photograph", "danc", "content", "youtube"]):
        return [
            {"id": "q1", "small": "Portfolio Status", "title": "Do you have a portfolio/showreel ready?", "note": "Creative careers depend heavily on proof of work.", "options": ["No, starting from scratch", "A few personal pieces", "Curated digital portfolio (Behance/GitHub/YouTube)", "Professional work/freelance history"]},
            {"id": "q2", "small": "Core Tool / Medium", "title": "What is your primary creative medium?", "note": "Your main daily tool or instrument.", "options": ["Digital tools (Figma, Premiere, DAW)", "Physical mediums (Canvas, instruments, camera)", "Physical performance (Acting, dancing, vocals)", "Written word / scriptwriting / copywriting"]},
            {"id": "q3", "small": "Practice Routine", "title": "How much time do you spend honeing your craft?", "note": "Daily practice builds elite creative skills.", "options": ["Ad-hoc / when inspired", "1–2 hours daily", "3–5 hours daily", "Full-time immersive practice"]},
            {"id": "q4", "small": "Audience / Platform", "title": "Where do you plan to showcase your work first?", "note": "Getting visibility is key to early growth.", "options": ["Social media (Instagram, YouTube, TikTok)", "Self-hosted portfolio website", "Local galleries, open mics, or community groups", "Freelance platforms (Upwork, Fiverr)"]},
            {"id": "q5", "small": "Mentorship", "title": "What kind of guidance do you have?", "note": "Creative paths benefit from experienced feedback.", "options": ["Self-taught / online tutorials", "Peer circles / feedback groups", "Formal coaching / design-arts school", "One-on-one professional mentor"]},
            {"id": "q6", "small": "Monetization Plan", "title": "How do you plan to earn from your craft?", "note": "Turn your talent into a stable career.", "options": ["Full-time salary job (in-house designer/writer)", "Freelance contracts / client commissions", "Selling direct products / digital assets / merch", "Ad revenue / brand sponsorships / patronage"]}
        ]

    # Category 4: Academic / Exam-Based & General Fallback
    else:
        questions = []
        
        # 1. Entrance Exam (Skip or adjust if already provided or seeking 11th admission)
        has_exams = bool(profile.exams and any(e.name and e.name != 'Not taking an entrance exam' for e in profile.exams)) if profile else False
        if not has_exams and not is_school:
            questions.append({"id": "q1", "small": "Entrance Exams", "title": "Which entrance exam is mandatory for this path?", "note": "Most structured careers in India require exam scores.", "options": ["National level exam (JEE, NEET, UPSC, CLAT)", "State-level entrance test", "University-specific entrance test", "None / Admission based on board marks"]})
        else:
            questions.append({"id": "q1", "small": "Learning Resources", "title": "What is your primary resource for self-study?", "note": "Leverage the best tools for conceptual clarity.", "options": ["Standard textbooks & reference guides", "Online videos and tutorial platforms", "Coaching institute study material", "Peer study groups & senior guidance"]})
            
        # 2. Preparation Strategy
        questions.append({"id": "q2", "small": "Preparation Strategy", "title": "How do you plan to prepare for the exams?", "note": "Structure your study strategy.", "options": ["Self-study with standard reference books", "Local offline coaching center", "Online platform / video courses", "One-on-one personal home tutor"]})
        
        # 3. Academic Stream (Skip or adjust if stream already selected)
        has_stream = bool(profile and profile.stream and profile.stream != 'Undecided — guide me')
        if not has_stream:
            questions.append({"id": "q3", "small": "Academic Stream", "title": "Which stream fits this career goal best?", "note": "Ensure your high school stream matches eligibility.", "options": ["Science (PCM / PCB)", "Commerce (with/without Math)", "Arts / Humanities", "Any stream is eligible"]})
        else:
            questions.append({"id": "q3", "small": "Study Hours", "title": "How many hours of self-study do you allocate daily?", "note": "Consistent daily study hours build a strong academic foundation.", "options": ["1-2 hours daily", "3-4 hours daily", "5-6 hours daily", "More than 6 hours daily"]})
            
        # 4. Degree / Qualification (NEVER ask if seeking 11th admission!)
        if not is_school:
            questions.append({"id": "q4", "small": "Degree / Qualification", "title": "What level of college degree is required?", "note": "Understand the minimum educational milestone.", "options": ["Undergraduate degree (BA, BSc, BTech)", "Professional diploma / vocational training", "Postgraduate degree or specialization (MD, MBA)", "No college degree required (skill-based)"]})
        else:
            questions.append({"id": "q4", "small": "School Activities", "title": "What extracurriculars or clubs interest you?", "note": "Co-curricular activities build a well-rounded personality.", "options": ["Science / Debate / Coding clubs", "Sports and physical activities", "Music / Art / Drama groups", "Community service / Volunteering"]})
            
        # 5. Preparation Time
        questions.append({"id": "q5", "small": "Preparation Time", "title": "When do you plan to start preparing?", "note": "Timing determines your preparation schedule.", "options": ["Already preparing full-time", "Starting in Class 11", "Starting in Class 12", "After finishing Class 12"]})
        
        # 6. Fallback Plan
        questions.append({"id": "q6", "small": "Fallback Plan", "title": "What is your backup option if exam scores are low?", "note": "It is always good to have a backup route.", "options": ["Drop a year and re-attempt", "Private college direct admission", "Alternative related degree course", "Shift to a skill-based creative field"]})
        
        return questions


async def generate_custom_questions(request: CustomQuestionsRequest, ai: OpenRouterClient) -> CustomQuestionsResponse:
    fallback_questions = get_local_custom_questions(request.career, request.profile)
    fallback = {"questions": fallback_questions}
    
    education_stage_str = request.educationStage or "Not specified"
    
    profile_info = []
    if request.profile:
        p = request.profile
        if p.educationStage:
            profile_info.append(f"- Current Education Stage: {p.educationStage}")
        if p.board:
            profile_info.append(f"- Preferred Board Curriculum: {p.board}")
        if p.stream:
            profile_info.append(f"- Preferred High School Stream: {p.stream}")
        if p.exams:
            exams_str = ", ".join([e.name for e in p.exams if e.name])
            if exams_str:
                profile_info.append(f"- Target Entrance Exams already selected: {exams_str}")
        if p.budget:
            profile_info.append(f"- Financial Budget: {p.budget}")
        if p.currentLocation:
            profile_info.append(f"- Location: {p.currentLocation}")
            
    profile_context = "\n".join(profile_info) if profile_info else "No detailed profile info provided yet."
    
    ai_payload = await ai.chat_json(
        [
            {
                "role": "system",
                "content": (
                    "You are an expert career counselor talking to a student in India. "
                    "Your task is to analyze the requested career goal and dynamically generate 6 highly relevant, specific, and jargon-free questions suited to their path. "
                    "First, analyze and categorize the nature of the target career:\n"
                    "1. Sports & Athletics (e.g., swimmer, runner, cricketer, footballer): Ask about coaching, training hours, academies, selection trials, state/national tournament participation, and physical fitness/injury management.\n"
                    "2. Academic & Exam-Based Professional (e.g., IAS, doctor, lawyer, engineer): Ask about required degrees, high school streams, specific entrance exams (UPSC CSE, NEET, CLAT, JEE), and coaching/preparation strategy.\n"
                    "3. Creative, Arts, & Performance (e.g., actor, musician, writer, fashion designer, YouTuber): Ask about portfolios, auditions, practice routines, mentors, and platforms (YouTube, Spotify, publishing, freelancing).\n"
                    "4. Startup, Business, & Entrepreneurship (e.g., cafe owner, startup founder, shop keeper): Ask about capital/funding, business model, location, audience, and value proposition.\n\n"
                    "CRITICAL PATHWAYS & DE-DUPLICATION FIT:\n"
                    f"The user's current profile inputs are:\n{profile_context}\n\n"
                    "DO NOT ASK questions that duplicate or repeat these fields. Specifically:\n"
                    "- If the user has already provided a preferred high school stream (e.g. Science, Commerce, Humanities), do NOT ask what stream they want to choose.\n"
                    "- If the user has already specified target entrance exams they are taking, do NOT ask what entrance exam they plan to take.\n"
                    "- Do NOT ask about their current location, board, or budget, as these are already collected on the static form.\n"
                    "- Do NOT ask about qualifications or education stage if they have already provided them.\n\n"
                    "CRITICAL RULES FOR SCHOOL-LEVEL (SEEKING 11TH-12TH ADMISSION) STUDENTS:\n"
                    "If the student's stage is 'Seeking 11th–12th admission', they are entering high school (Junior College level in India). "
                    "You MUST NEVER ask them about:\n"
                    "- Undergraduate (UG) or Postgraduate (PG) degrees (e.g., BTech, MBBS, MBA, degree level, degree specifications, college specializations).\n"
                    "- College admissions, college placements, or college budgets.\n"
                    "- Professional internships, college specializations, or advanced industry projects they cannot have done.\n"
                    "Instead, focus on: high school stream alignment, choice of coaching classes, target board exam preparation, study schedules, early self-learning resources (like books or YouTube), or basic extracurricular interests/hobbies.\n\n"
                    "Ensure questions are non-repetitive, age-appropriate, realistic, and strictly relevant to their career and education stage. "
                    "Return strict JSON with a 'questions' key containing a list of 6 objects. Each object must have: "
                    "id (string, e.g., 'q1'), small (short category name, e.g., 'Training', 'Entrance Exam'), title (the actual question), "
                    "note (a short tip or context), and options (list of 4 distinct realistic choices suited to the question)."
                )
            },
            {
                "role": "user",
                "content": (
                    f"My target career is: {request.career}\n"
                    f"My current education stage is: {education_stage_str}\n\n"
                    "ACTUAL SIGNALS ALREADY PROVIDED BY THE USER (DO NOT ASK FOR THESE!):\n"
                    f"{profile_context}\n\n"
                    "Remember: If I already specified my stream, preferred board, or target entrance exams in the list above, "
                    "you MUST NOT ask me about them again. If my stage is 'Seeking 11th–12th admission', you MUST NOT ask "
                    "about undergraduate (UG) degrees, college admission, college degrees, PG specialization, or internships. "
                    "Generate 6 highly relevant, non-repetitive, correct, and stage-appropriate questions."
                )
            }
        ],
        fallback
    )
    
    questions = []
    for q in ai_payload.get("questions", fallback["questions"]):
        if not isinstance(q, dict):
            continue
        q_clean = {k: v for k, v in q.items() if v is not None}
        q_clean.setdefault("id", "q")
        q_clean.setdefault("small", "Question")
        q_clean.setdefault("title", "What is your preference?")
        q_clean.setdefault("note", "")
        q_clean.setdefault("options", ["Option A", "Option B", "Option C", "Option D"])
        try:
            questions.append(CustomQuestion(**q_clean))
        except Exception:
            pass
    return CustomQuestionsResponse(questions=questions)
