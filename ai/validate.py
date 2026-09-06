"""
Evaluate a trained (or base) YOLO checkpoint against the validation split
and print real precision/recall/mAP - never fabricate these numbers.

Usage:
    python ai/validate.py --weights ai/runs/gamecount/weights/best.pt
    python ai/validate.py --weights yolov8n.pt   # sanity-check the base model
"""
import argparse
from pathlib import Path

from train import resolve_data_yaml

AI_DIR = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser(description="Validate a GameCount detection model")
    parser.add_argument("--weights", required=True)
    parser.add_argument("--data", default=str(AI_DIR / "dataset" / "classes.yaml"))
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", default="cpu")
    args = parser.parse_args()

    import torch

    if args.device == "cpu":
        torch.backends.mkldnn.enabled = False  # see train.py - avoids SIGILL on non-AVX CPUs

    from ultralytics import YOLO

    model = YOLO(args.weights)
    metrics = model.val(
        data=resolve_data_yaml(args.data),
        imgsz=args.imgsz,
        device=args.device,
        workers=0 if args.device == "cpu" else 8,
    )

    print("\n--- Real validation results (not fabricated) ---")
    print(f"mAP50:    {metrics.box.map50:.4f}")
    print(f"mAP50-95: {metrics.box.map:.4f}")
    print(f"Precision (mean): {metrics.box.mp:.4f}")
    print(f"Recall (mean):    {metrics.box.mr:.4f}")
    print("\nPer-class mAP50:")
    for i, name in model.names.items():
        try:
            print(f"  {name}: {metrics.box.maps[i]:.4f}")
        except (IndexError, KeyError):
            pass


if __name__ == "__main__":
    main()
