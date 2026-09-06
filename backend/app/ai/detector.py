"""
Animal detector abstraction.

    AnimalDetector (interface)
          |
          +-- DemoDetector   -> produces realistic, clearly-labelled fake
          |                     detections so the app can be demoed without
          |                     a trained model.
          |
          +-- YOLODetector   -> wraps an Ultralytics YOLO model. Only used
                                 when DEMO_MODE=false and MODEL_PATH is set.

NOTE ON ACCURACY: a generic/pretrained YOLO model is NOT reliably able to
tell an impala from a springbok, or classify wildlife from directly overhead
aerial imagery. Real species-level detection needs a wildlife-specific
dataset and fine-tuned model - see /ai/README.md.
"""
import random
import time
from abc import ABC, abstractmethod
from typing import List, Dict

from app.config import SPECIES, YOLO_CONFIDENCE, YOLO_IMAGE_SIZE, DETECTABLE_SPECIES


class AnimalDetector(ABC):
    @abstractmethod
    def analyze(self, image_path: str, image_width: int, image_height: int) -> dict:
        """Run detection on an image and return a structured result dict."""
        raise NotImplementedError


class DemoDetector(AnimalDetector):
    """
    Generates plausible-looking, randomized detections for the species the
    currently deployed model can actually detect (DETECTABLE_SPECIES - see
    app/config.py), so simulated results don't overstate capability the real
    model doesn't have. Results are clearly flagged as simulated by the
    caller (the /api/analyze endpoint sets "demo": true, and the frontend
    displays a 'DEMO / SIMULATED AI RESULTS' banner).
    """

    # Roughly mimics real-world herd sizes: impala/springbok in bigger
    # groups, elephant/giraffe in smaller ones.
    COUNT_RANGES = {
        "elephant": (2, 14),
        "giraffe": (1, 8),
        "impala": (10, 40),
        "springbok": (5, 25),
    }
    CONFIDENCE_RANGES = {
        "elephant": (0.85, 0.96),
        "giraffe": (0.80, 0.93),
        "impala": (0.72, 0.90),
        "springbok": (0.70, 0.88),
    }

    def analyze(self, image_path: str, image_width: int, image_height: int) -> dict:
        start = time.time()

        detections = []
        species_counts: Dict[str, int] = {s: 0 for s in SPECIES}

        for species in DETECTABLE_SPECIES:
            lo, hi = self.COUNT_RANGES[species]
            count = random.randint(lo, hi)
            species_counts[species] = count

            conf_lo, conf_hi = self.CONFIDENCE_RANGES[species]
            for _ in range(count):
                box_w = random.randint(max(20, image_width // 20), max(30, image_width // 8))
                box_h = random.randint(max(20, image_height // 20), max(30, image_height // 8))
                x1 = random.randint(0, max(1, image_width - box_w))
                y1 = random.randint(0, max(1, image_height - box_h))
                detections.append(
                    {
                        "species": species,
                        "confidence": round(random.uniform(conf_lo, conf_hi), 2),
                        "bbox": {
                            "x1": x1,
                            "y1": y1,
                            "x2": x1 + box_w,
                            "y2": y1 + box_h,
                        },
                    }
                )

        total = sum(species_counts.values())
        avg_confidence = round(sum(d["confidence"] for d in detections) / len(detections), 2) if detections else 0.0
        processing_time = round(time.time() - start + random.uniform(1.2, 2.8), 2)  # simulate real work

        return {
            "success": True,
            "demo": True,
            "total_animals": total,
            "species_counts": species_counts,
            "detections": detections,
            "average_confidence": avg_confidence,
            "processing_time": processing_time,
        }


class YOLODetector(AnimalDetector):
    """
    Real detector backed by an Ultralytics YOLO model. Only imported/used
    when DEMO_MODE=false, so the `ultralytics` package is not a hard
    dependency for running the demo.
    """

    def __init__(self, model_path: str):
        from ultralytics import YOLO  # imported lazily, real-mode only

        self.model = YOLO(model_path or "yolov8n.pt")

        # Restrict inference to species this checkpoint can actually detect
        # (see DETECTABLE_SPECIES in app/config.py) so it doesn't report
        # unreliable guesses for classes it wasn't trained well enough on.
        names = self.model.names
        name_items = names.items() if isinstance(names, dict) else enumerate(names)
        name_to_id = {str(v).strip().lower(): k for k, v in name_items}
        self.active_class_ids = [name_to_id[s] for s in DETECTABLE_SPECIES if s in name_to_id]

    def analyze(self, image_path: str, image_width: int, image_height: int) -> dict:
        start = time.time()
        results = self.model.predict(
            source=image_path,
            conf=YOLO_CONFIDENCE,
            imgsz=YOLO_IMAGE_SIZE,
            classes=self.active_class_ids or None,
            verbose=False,
        )[0]

        detections = []
        species_counts: Dict[str, int] = {s: 0 for s in SPECIES}

        for box in results.boxes:
            cls_id = int(box.cls[0])
            names = self.model.names
            species = names.get(cls_id, "unknown") if isinstance(names, dict) else names[cls_id]
            species = str(species).strip().lower()
            if species not in DETECTABLE_SPECIES:
                continue  # ignore classes this checkpoint isn't trusted on
            confidence = float(box.conf[0])
            x1, y1, x2, y2 = [int(v) for v in box.xyxy[0]]

            species_counts[species] += 1
            detections.append(
                {
                    "species": species,
                    "confidence": round(confidence, 2),
                    "bbox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                }
            )

        total = sum(species_counts.values())
        avg_confidence = round(sum(d["confidence"] for d in detections) / len(detections), 2) if detections else 0.0

        return {
            "success": True,
            "demo": False,
            "total_animals": total,
            "species_counts": species_counts,
            "detections": detections,
            "average_confidence": avg_confidence,
            "processing_time": round(time.time() - start, 2),
        }


def get_detector(demo_mode: bool, model_path: str = "") -> AnimalDetector:
    if demo_mode:
        return DemoDetector()
    return YOLODetector(model_path)
