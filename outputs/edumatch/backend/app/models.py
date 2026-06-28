from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field


class AuthRequest(BaseModel):
    email: EmailStr
    name: str | None = None
    password: str = ""
    mode: Literal["login", "register"] = "login"

class AuthResponse(BaseModel):
    id: str | None = None
    email: EmailStr
    name: str
    persisted: bool
    error: str | None = None


class ExamResult(BaseModel):
    name: str
    status: str = "Expected"
    result: str = ""


class StudentProfile(BaseModel):
    educationStage: str = "Class 11 or 12"
    board: str | None = None
    stream: str | None = None
    class10: str | None = None
    class10Detail: str | None = None
    class12: str | None = None
    class12Detail: str | None = None
    exams: list[ExamResult] = Field(default_factory=list)
    budget: str | None = None
    currentLocation: str | None = None
    locationMode: str | None = None
    preferredLocation: str | None = None
    experience: str | None = None
    learning: str | None = None
    priority: str | None = None
    dreamWhy: str | None = None
    prototype: str | None = None
    audience: str | None = None
    mentor: str | None = None
    income: str | None = None
    admissionBasis: str | None = None
    scholarshipNeed: str | None = None
    coachingPlan: str | None = None
    campusPreference: str | None = None
    supportNeed: str | None = None
    proofSignal: str | None = None
    skillSignal: str | None = None
    reviewSignal: str | None = None
    customAnswers: dict[str, str] = Field(default_factory=dict)
    extracurriculars: str | None = None
    preferredWorkStyle: str | None = None
    personalStrengths: str | None = None


class MatchRequest(BaseModel):
    userEmail: EmailStr | None = None
    career: str
    profile: StudentProfile


class College(BaseModel):
    name: str
    city: str
    state: str | None = None
    field: str = "General"
    exams: list[str] = Field(default_factory=list)
    cutoffHint: str
    score: int = Field(ge=0, le=100)
    chance: str
    roi: str
    placement: str
    color: str = "#66d9ff"
    sourceNote: str = "Seeded public-data placeholder. Verify live cutoffs from official counselling portals."
    courseProfile: list[str] = Field(default_factory=list)
    scholarshipsAvailable: list[str] = Field(default_factory=list)


class MatchResponse(BaseModel):
    colleges: list[College]
    analysis: str
    roadmap: list[list[str]]
    pathMeta: list[str] | None = None
    dayInLife: list[list[str]] | None = None
    redirectTo: str = "/results"
    persisted: bool = False
    realtime: bool = False
    jobProgression: list[dict[str, Any]] | None = Field(default_factory=list)

class ChancePredictRequest(BaseModel):
    userEmail: EmailStr | None = None
    targetCollege: str
    targetCourse: str
    credentials: dict[str, Any] = Field(default_factory=dict)
    category: str | None = None


class AlternativeCollege(BaseModel):
    name: str
    matchPercentage: int
    reason: str

class ChancePredictResponse(BaseModel):
    status: str
    chancePercentage: int
    cutoffDetail: str
    analysis: str
    alternatives: list[AlternativeCollege] = Field(default_factory=list)


class MentorMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class MentorRequest(BaseModel):
    userEmail: EmailStr | None = None
    sessionId: str = "default"
    message: str
    career: str | None = None
    profile: dict[str, Any] = Field(default_factory=dict)
    history: list[MentorMessage] = Field(default_factory=list)


class MentorResponse(BaseModel):
    answer: str
    redirectTo: str | None = None
    suggestions: list[str] = Field(default_factory=list)
    persisted: bool = False
    model: str | None = None


class CollegeSearchRequest(BaseModel):
    userEmail: EmailStr | None = None
    query: str = ""
    career: str | None = None
    filters: dict[str, Any] = Field(default_factory=dict)
    profile: dict[str, Any] = Field(default_factory=dict)


class CollegeSearchResponse(BaseModel):
    colleges: list[College]
    analysis: str
    realtime: bool
    persisted: bool = False


class CustomQuestion(BaseModel):
    id: str
    small: str
    title: str
    note: str
    options: list[str] = Field(default_factory=list)


class CustomQuestionsRequest(BaseModel):
    career: str
    educationStage: str | None = None
    userEmail: EmailStr | None = None
    profile: StudentProfile | None = None


class CustomQuestionsResponse(BaseModel):
    questions: list[CustomQuestion]


class ProfileSaveRequest(BaseModel):
    userEmail: EmailStr
    career: str
    profile: StudentProfile
    matchResult: dict | None = None


class ProfileLoadRequest(BaseModel):
    userEmail: EmailStr


class ProfileLoadResponse(BaseModel):
    career: str | None = None
    profile: StudentProfile | None = None
    matchResult: dict | None = None
    success: bool = False

