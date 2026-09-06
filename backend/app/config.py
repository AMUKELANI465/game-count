"""
Central configuration for Game Count backend.
All values are read from environment variables so nothing sensitive
is hard-coded into the source.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# --- Demo mode -------------------------------------------------------------
# When true, the DemoDetector is used instead of a real YOLO model.
# This lets the whole app run with zero setup and no GPU / trained weights.
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"

# --- AI model ---------------------------------------------------------------
# Ultralytics downloads this checkpoint on first use when real mode is enabled.
# Replace it with a wildlife-trained .pt file for reliable species-level results.
MODEL_PATH = os.getenv("MODEL_PATH", "yolov8n.pt" if not DEMO_MODE else "")
YOLO_CONFIDENCE = float(os.getenv("YOLO_CONFIDENCE", "0.25"))
YOLO_IMAGE_SIZE = int(os.getenv("YOLO_IMAGE_SIZE", "960"))

# --- Storage -----------------------------------------------------------------
UPLOAD_DIR = BASE_DIR / "uploads"
RESULTS_DIR = BASE_DIR / "results"
UPLOAD_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)

MAX_IMAGE_SIZE_MB = int(os.getenv("MAX_IMAGE_SIZE_MB", "20"))
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# --- Database ------------------------------------------------------------
# SQLite is used as a zero-config local fallback. A DATABASE_URL pointing at
# Postgres/Supabase can be swapped in later without touching the rest of the
# app, since all DB access goes through app/database/db.py.
DATABASE_URL = os.getenv("DATABASE_URL", "")
SQLITE_PATH = BASE_DIR / "game_count.db"

# --- Species supported in the MVP -------------------------------------------
SPECIES = ["elephant", "giraffe", "impala", "springbok"]

# --- Species the currently deployed model can reliably detect ---------------
# gamecount-v1.pt was trained on only 4-5 photos per species; validation
# showed it only actually learned elephant (giraffe/impala/springbok had 0%
# recall - see ai/README.md). Restricting real inference to this list stops
# the model from reporting species it wasn't trained well enough to trust,
# rather than silently returning unreliable guesses for the others. Update
# as more species get a properly-sized, validated training set.
DETECTABLE_SPECIES = [s.strip().lower() for s in os.getenv("DETECTABLE_SPECIES", "elephant").split(",") if s.strip()]

# --- CORS --------------------------------------------------------------
# Comma-separated list of allowed origins, e.g. "https://app.example.com".
# Defaults to "*" for local development. Set explicitly before deploying
# publicly so the API doesn't accept requests from arbitrary origins.
_cors_env = os.getenv("CORS_ORIGINS", "*")
CORS_ORIGINS = ["*"] if _cors_env.strip() == "*" else [o.strip() for o in _cors_env.split(",") if o.strip()]
