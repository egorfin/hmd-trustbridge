from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import AssessmentInput, AssessmentResponse
from app.scoring import compute_assessment

app = FastAPI(
    title="TrustBridge API",
    version="0.1.0",
    description="Digital Readiness Assessment backend for HMD TrustBridge.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/assessment", response_model=AssessmentResponse)
async def create_assessment(body: AssessmentInput) -> AssessmentResponse:
    return compute_assessment(body)
