# Architecture

GameCount follows a simple, three-tier architecture deliberately kept free
of microservices so a small student/hackathon team can understand and
extend it easily:

```
React (Vite + TypeScript + Tailwind)
              |
              | REST / JSON over HTTP
              v
FastAPI backend (Python)
              |
              | model abstraction
              v
AnimalDetector -> DemoDetector | YOLODetector
              |
              v
SQLite (local) or PostgreSQL / Supabase (production)
```

## Frontend

- **React Router** drives navigation between pages (`/`, `/dashboard`,
  `/new-survey`, `/analysis`, `/results`, `/surveys`, `/surveys/:id`,
  `/map`, `/analytics`, `/settings`).
- **services/api.ts** is the single place that talks to the backend - pages
  never call `fetch` directly.
- **components/** holds shared, reusable UI: the sidebar, stat cards, and
  the bounding-box image overlay used on both the Analysis and Results
  pages.

## Backend

- **app/main.py** wires up the REST endpoints and CORS.
- **app/ai/detector.py** defines the `AnimalDetector` interface and its two
  implementations (`DemoDetector`, `YOLODetector`), so swapping in a real
  trained model later requires no changes to the API layer.
- **app/database/db.py** is the only file that talks to the database
  directly. Every other module goes through its functions
  (`create_survey`, `list_surveys`, etc.), so migrating from SQLite to
  Postgres/Supabase only touches this one file.
- **app/services/annotate.py** draws bounding boxes onto a copy of the
  uploaded image for display and archival.

## Storage

Uploaded images and annotated results are written to `backend/uploads/`
and `backend/results/` for local development. In production, that folder
logic can be swapped for a Supabase Storage (or S3-compatible) client
without touching the rest of the app, since all file writes go through a
small storage boundary in `app/main.py`.

## Why no microservices

The MVP's job is to prove the workflow end-to-end - upload, detect, review,
verify, save, review history - not to scale to production traffic. A
single FastAPI service and a single React app keep the moving parts to a
minimum while the product is still being validated.
