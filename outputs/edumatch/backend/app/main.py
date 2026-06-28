from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    AuthRequest,
    AuthResponse,
    CollegeSearchRequest,
    CollegeSearchResponse,
    MatchRequest,
    MatchResponse,
    MentorRequest,
    MentorResponse,
    CustomQuestionsRequest,
    CustomQuestionsResponse,
    ChancePredictRequest,
    ChancePredictResponse,
    ProfileSaveRequest,
    ProfileLoadRequest,
    ProfileLoadResponse,
)
from .services import OpenRouterClient, Store, build_match, generate_custom_questions, mentor_reply, seeded_colleges, predict_chance
from .settings import Settings, get_settings


app = FastAPI(title="EduMatch API", version="1.0.0")


def get_store(settings: Settings = Depends(get_settings)) -> Store:
    return Store(settings)


def get_ai(settings: Settings = Depends(get_settings)) -> OpenRouterClient:
    return OpenRouterClient(settings)


settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins + ["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):\d+|https://.*\.github\.io",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health(settings: Settings = Depends(get_settings)):
    return {
        "ok": True,
        "environment": settings.app_env,
        "openrouter": bool(settings.openrouter_api_key),
        "supabase": bool(settings.supabase_url and settings.supabase_service_role_key),
        "mysqlAudit": bool(settings.mysql_dsn),
    }


@app.post("/api/auth", response_model=AuthResponse)
def auth(request: AuthRequest, store: Store = Depends(get_store)):
    if request.mode == "register":
        fallback_name = request.email.split("@")[0]
        name = request.name or fallback_name
        user_id, persisted, error = store.register_user(str(request.email), request.password, name)
        return AuthResponse(id=user_id, email=request.email, name=name, persisted=persisted, error=error)
    else:
        user_id, persisted, error, name = store.login_user(str(request.email), request.password)
        fallback_name = name or request.email.split("@")[0]
        return AuthResponse(id=user_id, email=request.email, name=fallback_name, persisted=persisted, error=error)


@app.post("/api/match", response_model=MatchResponse)
async def match(request: MatchRequest, ai: OpenRouterClient = Depends(get_ai), store: Store = Depends(get_store)):
    return await build_match(request, ai, store)


@app.post("/api/mentor", response_model=MentorResponse)
async def mentor(request: MentorRequest, ai: OpenRouterClient = Depends(get_ai), store: Store = Depends(get_store)):
    return await mentor_reply(request, ai, store)


@app.post("/api/colleges/search", response_model=CollegeSearchResponse)
def college_search(request: CollegeSearchRequest, store: Store = Depends(get_store), ai: OpenRouterClient = Depends(get_ai)):
    colleges = seeded_colleges(request.career or request.query, request.profile, request.query)
    analysis = (
        "Results are ranked against career, stream, entrance exam and location signals. "
        "Exact real-time cutoffs should be pulled from official counselling APIs or portals."
    )
    response = CollegeSearchResponse(colleges=colleges, analysis=analysis, realtime=ai.enabled)
    response.persisted = store.insert(
        "college_searches",
        {
            "user_email": str(request.userEmail) if request.userEmail else None,
            "query": request.query,
            "filters": request.filters,
            "response": response.model_dump(),
        },
    )
    return response


@app.post("/api/custom-questions", response_model=CustomQuestionsResponse)
async def custom_questions(request: CustomQuestionsRequest, ai: OpenRouterClient = Depends(get_ai)):
    return await generate_custom_questions(request, ai)


@app.post("/api/chance", response_model=ChancePredictResponse)
async def chance(request: ChancePredictRequest, ai: OpenRouterClient = Depends(get_ai), store: Store = Depends(get_store)):
    return await predict_chance(request, ai, store)


@app.post("/api/profile/save")
def save_profile(request: ProfileSaveRequest, store: Store = Depends(get_store)):
    success = store.save_user_profile(
        email=str(request.userEmail),
        career=request.career,
        profile=request.profile,
        match_result=request.matchResult
    )
    return {"success": success}


@app.post("/api/profile/get", response_model=ProfileLoadResponse)
def get_profile(request: ProfileLoadRequest, store: Store = Depends(get_store)):
    data = store.get_user_profile(str(request.userEmail))
    if data:
        return ProfileLoadResponse(
            career=data.get("career"),
            profile=data.get("profile"),
            matchResult=data.get("matchResult"),
            success=True
        )
    return ProfileLoadResponse(success=False)
