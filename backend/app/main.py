"""
Game Count backend - FastAPI application.

Endpoints:
    GET    /api/health
    POST   /api/analyze
    POST   /api/surveys
    GET    /api/surveys
    GET    /api/surveys/{id}
    PUT    /api/surveys/{id}
    DELETE /api/surveys/{id}
"""
import shutil
import uuid
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image

from app.config import (
    DEMO_MODE, MODEL_PATH, UPLOAD_DIR, RESULTS_DIR,
    MAX_IMAGE_SIZE_MB, ALLOWED_EXTENSIONS, SPECIES,
)
from app.ai.detector import get_detector
from app.services.annotate import draw_annotations
from app.database import db
from app.schemas import SurveyCreate, SurveyUpdate

app = FastAPI(title="Game Count API", description="AI-assisted wildlife population counting")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hackathon prototype - tighten before real deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/results", StaticFiles(directory=str(RESULTS_DIR)), name="results")

detector = get_detector(DEMO_MODE, MODEL_PATH)

# Initialise the database at import time (not just on server startup) so
# that test clients and scripts that import `app` directly also get the
# tables created before they run.
db.init_db()


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "demo_mode": DEMO_MODE,
        "species_supported": SPECIES,
    }


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type '{ext}'. Use JPG, PNG or WEBP.")

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_IMAGE_SIZE_MB:
        raise HTTPException(400, f"Image too large ({size_mb:.1f}MB). Max is {MAX_IMAGE_SIZE_MB}MB.")

    file_id = uuid.uuid4().hex
    image_filename = f"{file_id}{ext}"
    image_path = UPLOAD_DIR / image_filename

    with open(image_path, "wb") as f:
        f.write(contents)

    try:
        with Image.open(image_path) as img:
            width, height = img.size
    except Exception:
        raise HTTPException(400, "Could not read image. The file may be corrupted or not a real image.")

    try:
        result = detector.analyze(str(image_path), width, height)
    except Exception as exc:
        raise HTTPException(500, f"AI analysis failed: {exc}")

    annotated_filename = f"{file_id}_annotated.jpg"
    annotated_path = RESULTS_DIR / annotated_filename
    try:
        draw_annotations(str(image_path), str(annotated_path), result["detections"])
        annotated_url = f"/results/{annotated_filename}"
    except Exception:
        # Annotation is a nice-to-have; if it fails, still return raw detections.
        annotated_url = f"/uploads/{image_filename}"

    if not result["detections"]:
        result["message"] = (
            "No animals detected. The image may not contain detectable wildlife, "
            "or the current AI model may not support the species shown. "
            "Please review the image manually."
        )

    result["image_url"] = f"/uploads/{image_filename}"
    result["annotated_image_url"] = annotated_url
    result["image_path"] = f"/uploads/{image_filename}"
    result["annotated_image_path"] = annotated_url
    return result


@app.post("/api/surveys")
def create_survey(survey: SurveyCreate):
    survey_id = db.create_survey(survey.model_dump())
    return db.get_survey(survey_id)


@app.get("/api/surveys")
def list_surveys():
    return db.list_surveys()


@app.get("/api/surveys/{survey_id}")
def get_survey(survey_id: int):
    survey = db.get_survey(survey_id)
    if not survey:
        raise HTTPException(404, "Survey not found")
    return survey


@app.put("/api/surveys/{survey_id}")
def update_survey(survey_id: int, survey: SurveyUpdate):
    data = {k: v for k, v in survey.model_dump().items() if v is not None}
    if "species_counts" in data:
        data["species_counts"] = [sc for sc in data["species_counts"]]
        data["verified_total"] = sum(sc["verified_count"] for sc in data["species_counts"])
    updated = db.update_survey(survey_id, data)
    if not updated:
        raise HTTPException(404, "Survey not found")
    return db.get_survey(survey_id)


@app.delete("/api/surveys/{survey_id}")
def delete_survey(survey_id: int):
    deleted = db.delete_survey(survey_id)
    if not deleted:
        raise HTTPException(404, "Survey not found")
    return {"success": True}
