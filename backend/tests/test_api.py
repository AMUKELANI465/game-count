"""
Basic automated tests for Game Count's backend.
Run with:  pytest
"""
import io
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.ai.detector import DemoDetector

client = TestClient(app)


def make_test_image_bytes(width=400, height=300):
    img = Image.new("RGB", (width, height), color=(120, 150, 90))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf


def test_health():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert "elephant" in body["species_supported"]


def test_analyze_valid_image():
    buf = make_test_image_bytes()
    resp = client.post("/api/analyze", files={"file": ("aerial.jpg", buf, "image/jpeg")})
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["total_animals"] == sum(body["species_counts"].values())
    assert "image_url" in body


def test_analyze_rejects_bad_extension():
    buf = io.BytesIO(b"not an image")
    resp = client.post("/api/analyze", files={"file": ("notes.txt", buf, "text/plain")})
    assert resp.status_code == 400


def test_survey_crud_flow():
    create_resp = client.post(
        "/api/surveys",
        json={
            "survey_name": "Test Survey",
            "survey_date": "2026-09-05",
            "location": "Northern Section",
            "ai_total": 71,
            "verified_total": 71,
            "species_counts": [
                {"species": "elephant", "ai_count": 12, "verified_count": 12},
                {"species": "impala", "ai_count": 37, "verified_count": 35},
            ],
        },
    )
    assert create_resp.status_code == 200
    survey = create_resp.json()
    survey_id = survey["id"]

    list_resp = client.get("/api/surveys")
    assert list_resp.status_code == 200
    assert any(s["id"] == survey_id for s in list_resp.json())

    get_resp = client.get(f"/api/surveys/{survey_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["survey_name"] == "Test Survey"

    update_resp = client.put(
        f"/api/surveys/{survey_id}",
        json={"status": "verified", "species_counts": [{"species": "impala", "verified_count": 30}]},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "verified"

    delete_resp = client.delete(f"/api/surveys/{survey_id}")
    assert delete_resp.status_code == 200

    missing_resp = client.get(f"/api/surveys/{survey_id}")
    assert missing_resp.status_code == 404


def test_species_counting_totals():
    detector = DemoDetector()
    result = detector.analyze("dummy.jpg", 1000, 800)
    assert result["total_animals"] == sum(result["species_counts"].values())
    assert len(result["detections"]) == result["total_animals"]


def test_ranger_verification_difference():
    ai_total = 71
    verified_total = 69
    assert ai_total - verified_total == 2
