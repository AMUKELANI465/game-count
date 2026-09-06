"""
Fine-tune a YOLO model on GameCount's four species (elephant, giraffe,
impala, springbok).

Usage:
    python ai/train.py
    python ai/train.py --epochs 50 --imgsz 960 --base yolov8s.pt

Requires `ultralytics` (see backend/requirements.txt) and a populated
dataset under ai/dataset/images/{train,val} + ai/dataset/labels/{train,val}
in YOLO format - see ai/README.md for how to build one.

No GPU is assumed by default (device="cpu", small epoch count, yolov8n
base). Pass --device 0 if you have a CUDA GPU available.
"""
import argparse
import os
import tempfile
from pathlib import Path

import yaml

# Must be set before torch is imported anywhere (including in DataLoader
# worker subprocesses, which don't inherit in-memory torch.backends state on
# Windows/spawn). Restricts oneDNN's CPU dispatch below AVX/AVX2/FMA, which
# some low-power CPUs (e.g. Atom/Celeron "Gemini Lake" cores) don't support -
# without this, training crashes with "Illegal instruction" (SIGILL).
os.environ.setdefault("ONEDNN_MAX_CPU_ISA", "SSE41")
os.environ.setdefault("DNNL_MAX_CPU_ISA", "SSE41")

AI_DIR = Path(__file__).resolve().parent


def resolve_data_yaml(data_yaml_path: str) -> str:
    """
    Ultralytics resolves a relative `path:` in the dataset yaml against its
    own global datasets_dir setting, not against the yaml file's own folder -
    which silently points training at the wrong directory on any machine
    that hasn't customized that global setting. Rewrite train/val as
    absolute paths so the dataset actually used always matches this repo.
    """
    src = Path(data_yaml_path).resolve()
    with open(src) as f:
        cfg = yaml.safe_load(f)

    root = src.parent / cfg.get("path", ".")
    resolved = {
        "path": str(root.resolve()),
        "train": str((root / cfg["train"]).resolve()),
        "val": str((root / cfg["val"]).resolve()),
        "names": cfg["names"],
    }

    tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".yaml", delete=False)
    yaml.safe_dump(resolved, tmp)
    tmp.close()
    return tmp.name


def main():
    parser = argparse.ArgumentParser(description="Train GameCount's wildlife detector")
    parser.add_argument("--data", default=str(AI_DIR / "dataset" / "classes.yaml"))
    parser.add_argument("--base", default="yolov8n.pt", help="Pretrained checkpoint to fine-tune from")
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=4)
    parser.add_argument("--device", default="cpu", help="'cpu', '0' for first GPU, etc.")
    parser.add_argument("--project", default=str(AI_DIR / "runs"))
    parser.add_argument("--name", default="gamecount")
    args = parser.parse_args()

    import torch

    if args.device == "cpu":
        # Some low-power CPUs (e.g. Atom/Celeron cores with no AVX/AVX2/FMA)
        # crash with "Illegal instruction" under PyTorch's oneDNN-accelerated
        # CPU kernels, which assume that instruction set. Plain ATen kernels
        # work fine on the same hardware, just slower.
        torch.backends.mkldnn.enabled = False

    from ultralytics import YOLO

    model = YOLO(args.base)
    results = model.train(
        data=resolve_data_yaml(args.data),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=args.device,
        project=args.project,
        name=args.name,
        workers=0 if args.device == "cpu" else 8,
        amp=args.device != "cpu",
    )
    print("\nTraining complete. Best weights:")
    print(f"  {args.project}/{args.name}/weights/best.pt")
    print("\nCopy that file into ai/models/ and point MODEL_PATH at it to use it,")
    print("e.g. MODEL_PATH=ai/models/gamecount-v1.pt, DEMO_MODE=false.")
    return results


if __name__ == "__main__":
    main()
