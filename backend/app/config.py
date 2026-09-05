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
MODEL_PATH = os.getenv("MODEL_PATH", "")  # path to a trained .pt file (real mode only)

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
