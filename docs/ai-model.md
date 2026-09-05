# AI Model

See [`ai/README.md`](../ai/README.md) for:

- Why a generic YOLO model cannot reliably detect elephant, giraffe,
  impala, or springbok from aerial imagery out of the box
- The full workflow for collecting, annotating, and training a
  wildlife-specific model
- How to enable the real detector (`DEMO_MODE=false` + `MODEL_PATH`)
- Known limitations of AI-assisted counting

See [`backend/app/ai/detector.py`](../backend/app/ai/detector.py) for the
`AnimalDetector` abstraction (`DemoDetector` and `YOLODetector`) referenced
throughout this document.
