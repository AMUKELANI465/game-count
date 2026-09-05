# GAME COUNT

AI-assisted wildlife population counting.

**Pilot environment:** Welgevonden Game Reserve, Limpopo, South Africa.

---

## 1. Overview

Game Count is a decision-support and counting-assistance tool for game
rangers and conservation teams. It is **not** a replacement for rangers,
and it does not claim to solve poaching, conservation management, or
wildlife protection as a whole.

## 2. Problem

Manually counting animals from aerial wildlife survey imagery can take
significant time and effort.

## 3. Solution

Game Count uses computer vision to analyse aerial photographs and produce
a first-pass estimate of the animals visible in the image, by species. The
ranger reviews the AI's result, corrects it where needed, and the verified
count is what gets saved as the official census record.

## 4. How Game Count works

```
Aerial Image
      |
      v
AI Detection
      |
      v
Species Count
      |
      v
Ranger Verification
      |
      v
Census Record
```

## 5. Key features

- Create a survey and upload aerial wildlife imagery (JPG/PNG/WEBP, up to
  20MB)
- AI analysis detects and classifies animals, drawing bounding boxes and
  confidence scores
- Species-level counts for elephant, giraffe, impala, and springbok
- Ranger verification step - every AI count can be corrected before saving
- Survey history with AI estimate vs. verified count for every record
- Dashboard and analytics showing recorded survey counts over time
- Runs entirely locally with **no paid AI API required** (demo mode by
  default; a real model can be swapped in later)

## 6. Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full
breakdown. In short:

```
React (Vite/TS/Tailwind) -> FastAPI -> AnimalDetector (Demo or YOLO) -> SQLite/Postgres
```

## 7. Technology stack

**Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, Lucide
React, Recharts, Leaflet.

**Backend:** Python, FastAPI, Uvicorn, Pydantic, Pillow.

**AI:** Ultralytics YOLO (optional/real mode) with a `DemoDetector`
fallback that requires no trained model.

**Database:** SQLite (local, zero-config) or PostgreSQL/Supabase.

## 8. Project structure

```
game-count/
├── frontend/            React app
├── backend/              FastAPI app
│   ├── app/
│   │   ├── ai/           detector abstraction (Demo + YOLO)
│   │   ├── database/     SQLite access layer
│   │   ├── services/     image annotation
│   │   └── main.py       API routes
│   ├── uploads/          uploaded images (gitignored)
│   ├── results/          annotated images (gitignored)
│   └── tests/
├── ai/                   dataset + model training docs
├── docs/                 architecture, database, demo docs
├── .env.example
├── docker-compose.yml    optional
└── README.md
```

## 9. Installation

Requirements: Node.js 18+, Python 3.10+.

```bash
git clone <this-repo>
cd game-count
cp .env.example backend/.env
```

## 10. Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. In development, Vite proxies `/api`,
`/uploads`, and `/results` to the backend at `http://localhost:8000` (see
`frontend/vite.config.ts`).

## 11. Running the backend

**Windows:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Linux/macOS:**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Runs at `http://localhost:8000`.

## 12. Demo mode

By default, `DEMO_MODE=true`, which uses a built-in `DemoDetector` that
produces realistic, randomized species counts and bounding boxes so the
full application flow can be demonstrated without a trained model or any
paid AI API. The UI always displays a clear **DEMO / SIMULATED AI
RESULTS** banner whenever demo results are shown, and simulated results
are never presented as if they came from a real model.

## 13. AI model setup

To use a real, trained detection model instead of the demo detector, see
[`ai/README.md`](ai/README.md) for the full training workflow, then set:

```
DEMO_MODE=false
MODEL_PATH=ai/models/your-model.pt
```

**Note:** a generic/pretrained YOLO model cannot reliably identify
elephant, giraffe, impala, or springbok from aerial imagery. A
wildlife-specific dataset and fine-tuned model are required for reliable
species-level detection - see `ai/README.md`.

## 14. Database setup

SQLite is used automatically if `DATABASE_URL` is not set - no setup
required. To use PostgreSQL/Supabase instead, set `DATABASE_URL` in
`backend/.env` and see [`docs/database.md`](docs/database.md) for the
schema. (Swapping the storage backend requires updating
`backend/app/database/db.py`, which is the only file that talks to the
database directly.)

## 15. API documentation

With the backend running, interactive Swagger docs are available at:

```
http://localhost:8000/docs
```

## 16. Testing

```bash
cd backend
source venv/bin/activate   # or venv\Scripts\activate on Windows
pytest
```

Tests cover the health check, image analysis (including validation of bad
uploads), full survey CRUD, species counting totals, and the ranger
verification difference calculation.

## 17. Limitations

- AI-generated counts are **estimates** and should be reviewed by
  qualified conservation personnel before being used for management
  decisions.
- AI accuracy depends on image quality, altitude, and lighting.
- Species classification accuracy depends on the training dataset used.
- Animals may overlap or be partially hidden, and small animals can be
  difficult to detect.
- A zero-detection result is not proof that no animals are present in an
  image - it may reflect an unsupported species or a difficult image.
- Recorded survey counts reflect what was seen and detected in a specific
  survey - not a guaranteed measure of population trend, since results can
  vary with location, weather, visibility, methodology, and animal
  movement.

## 18. Future improvements

Documented, not built in this MVP: drone integration, video analysis,
automatic survey-area segmentation, animal movement tracking, more
advanced species recognition, individual animal identification, GPS
integration, an offline field mode, a dedicated mobile app, automated
reporting, reserve-wide population analytics, and integration with other
conservation management systems.

## 19. Hackathon demonstration

See [`docs/hackathon-demo.md`](docs/hackathon-demo.md) for a 3-minute demo
script.

## 20. Team / contribution

Built as a hackathon prototype for **ManTech Media**. Contributions,
issues, and pull requests are welcome - please open an issue describing
the change before submitting a large pull request.

### Git workflow

```bash
git checkout -b feature/your-feature-name
git commit -m "Describe your change"
git push origin feature/your-feature-name
```

Then open a pull request against `main`.
