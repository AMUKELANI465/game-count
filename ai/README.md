# Game Count - AI Model Documentation

## Important limitation

A generic, pretrained YOLO model (trained on everyday photos like COCO) is
**not** reliably able to identify elephant, giraffe, impala, or springbok -
especially from directly-overhead aerial imagery, where animals look very
different than they do in ground-level photos. The `DemoDetector` used by
default in this prototype produces realistic-looking, randomized results
purely so the full application flow can be demonstrated; it does not run
real computer vision.

**A wildlife-specific dataset and model fine-tuning is required to achieve
reliable species-level detection for aerial imagery.** No accuracy numbers
are claimed anywhere in this project because no such model has been trained
or evaluated yet.

## Steps to train a real wildlife detection model

1. **Collect wildlife imagery.** Gather aerial photos/drone footage of the
   reserve, ideally covering different times of day, altitudes, and herd
   sizes for each of the four target species.
2. **Organize the dataset** under `ai/dataset/images/` (photos) and
   `ai/dataset/labels/` (YOLO-format `.txt` annotation files, one per image).
3. **Annotate animals with bounding boxes.** Tools like
   [Roboflow](https://roboflow.com), [CVAT](https://cvat.ai), or
   [LabelImg](https://github.com/heartexlabs/labelImg) all export YOLO-format
   labels directly.
4. **Create training and validation splits** (a common starting point is an
   80/20 split), keeping images from the same flight/day together to avoid
   leakage between the two sets.
5. **Define the four classes** in a dataset config file - see
   `ai/dataset/classes.yaml` in this folder for the exact format Ultralytics
   YOLO expects.
6. **Train/fine-tune YOLO**, for example:
   ```bash
   pip install ultralytics
   yolo detect train data=ai/dataset/classes.yaml model=yolov8n.pt epochs=100 imgsz=960
   ```
   Starting from a pretrained checkpoint (`yolov8n.pt`, `yolov8s.pt`, etc.)
   and fine-tuning is far more data-efficient than training from scratch.
7. **Evaluate the model** on the held-out validation set using YOLO's
   built-in `val` command, and review results on real aerial imagery before
   trusting the counts. Do not fabricate or assume accuracy figures - only
   report what evaluation actually shows.
8. **Export the trained weights** (`best.pt`).
9. **Place the weights** in `ai/models/` (e.g. `ai/models/gamecount-v1.pt`).
10. **Set the environment variable**:
    ```
    MODEL_PATH=ai/models/gamecount-v1.pt
    ```
11. **Disable demo mode**:
    ```
    DEMO_MODE=false
    ```
    Restart the backend - it will now use `YOLODetector` (see
    `backend/app/ai/detector.py`) instead of `DemoDetector`.

## Adding more species later

The detector abstraction (`AnimalDetector` in `backend/app/ai/detector.py`)
and the `SPECIES` list in `backend/app/config.py` are the only two places
that need updating to support additional species (e.g. zebra, buffalo,
rhino, kudu, wildebeest, lion, leopard) once a model trained on those
classes is available. The frontend reads species names from the API
response, so no species-specific frontend code needs to change.

## Known limitations to keep in mind

- AI accuracy depends heavily on image quality, altitude, and lighting.
- Species classification accuracy depends entirely on the training dataset.
- Overlapping or clustered animals are harder to separate correctly.
- Partially hidden animals (under trees, in shadow) may be missed.
- Small animals are harder to detect at higher flight altitudes.
- Aerial imagery conditions (glare, motion blur, cloud shadow) affect
  results.
- AI results always require ranger review and verification before being
  used for any management decision.
