# GameCount - AI Model Documentation

## Current status: a real, trained model exists - and it is weak

`ai/models/gamecount-v1.pt` is a real YOLOv8n checkpoint, fine-tuned on a
real (tiny) hand-built dataset by actually running `ai/train.py` on this
machine. It is not fabricated, not copied from elsewhere, and its metrics
below are the unedited output of Ultralytics' own validation pass. It is
also not good enough to trust for real wildlife counts - see why below.

### The dataset

20 real photos total, 5 per species (4 train / 1 val), hand-picked and
hand-annotated (bounding boxes drawn by visual inspection, not auto-labeled):

| Species   | Train | Val | Source |
|-----------|-------|-----|--------|
| elephant  | 4     | 1   | Wikimedia Commons (CC-BY-SA) / Pexels (free-to-use) |
| giraffe   | 4     | 1   | Wikimedia Commons (CC-BY-SA) / Pexels (free-to-use) |
| impala    | 4     | 1   | Wikimedia Commons (CC-BY-SA) / Pexels (free-to-use) |
| springbok | 4     | 1   | Wikimedia Commons (CC-BY-SA) / Pexels (free-to-use) |

This is a proof-of-concept dataset, not a production one. It exists to prove
the full pipeline - dataset format, training script, CPU compatibility,
evaluation - genuinely works end to end. 20 images is roughly two orders of
magnitude too small to expect a reliable model; real deployments need
hundreds to thousands of annotated images per species, ideally from the
actual imagery conditions (altitude, angle, lighting) the model will see
in production.

### Training run

```
python ai/train.py --epochs 40 --imgsz 640 --batch 4
```

- Base checkpoint: `yolov8n.pt` (COCO-pretrained), fine-tuned on the 4
  species above.
- Hardware: CPU only (Intel Celeron N4500 - no CUDA GPU available), 40
  epochs, ~1.24 hours.
- Ran into and fixed three real bugs along the way: a dataset-path
  resolution bug in how Ultralytics interprets relative paths, and a
  genuine CPU-incompatibility crash (`Illegal instruction`) traced to the
  `polars` package requiring AVX2 instructions this CPU doesn't have -
  fixed by switching to `polars-lts-cpu`.

### Real validation results (not fabricated, not cherry-picked)

Evaluated on the 4-image held-out validation split (one image per species):

| Class     | Precision | Recall | mAP50  | mAP50-95 |
|-----------|-----------|--------|--------|----------|
| elephant  | 0.956     | 1.00   | 0.995  | 0.597    |
| giraffe   | 1.00      | 0.00   | 0.000  | 0.000    |
| impala    | 1.00      | 0.00   | 0.0995 | 0.0493   |
| springbok | 1.00      | 0.00   | 0.497  | 0.249    |
| **all**   | **0.989** | **0.25** | **0.398** | **0.224** |

**Read this honestly:** the elephant class learned well. The other three
classes have 0% recall on their single validation image - the model is
missing them entirely, most likely because 4 training images per class is
not enough to learn a robust visual pattern for anything but the easiest
case. Precision looks high across the board only because the model makes
very few predictions overall (a model that rarely fires can't rack up false
positives - that's not the same as being accurate). **Do not deploy this
checkpoint as if it reliably detects giraffe, impala, or springbok - it
does not, and this table proves it rather than hides it.**

### Using this model

```
MODEL_PATH=ai/models/gamecount-v1.pt
DEMO_MODE=false
YOLO_IMAGE_SIZE=640
```

Restart the backend to load it via `YOLODetector`. Detections will be real
inference, not random - but expect it to reliably find elephants only,
and to under-detect (or miss) the other three species until the dataset
grows substantially.

**`YOLO_IMAGE_SIZE=640` matters and is not optional for this checkpoint.**
The backend's default (`960`, tuned for the stock COCO model) silently
produces zero detections from `gamecount-v1.pt` - verified directly: the
same elephant validation image goes from 0 detections at imgsz=960 to a
correct detection at 0.67 confidence at imgsz=640, the size this model
was actually trained at. If a future checkpoint is trained at a different
`--imgsz`, this value needs to match it.

## How to actually make this production-ready

1. **Collect far more imagery per species** - hundreds of images minimum,
   ideally from the real conditions the app will be used in (altitude,
   angle, lighting, herd density), not just clean reference photos.
2. **Re-annotate at that scale** with a real tool (
   [Roboflow](https://roboflow.com), [CVAT](https://cvat.ai),
   [LabelImg](https://github.com/heartexlabs/labelImg)) rather than manual
   visual estimation - manual annotation does not scale past a proof of
   concept.
3. **Re-split train/val** (80/20 is a reasonable starting point), keeping
   images from the same shoot/day together to avoid leakage.
4. **Re-train** with more epochs and, ideally, a GPU - `ai/train.py --base
   yolov8s.pt --epochs 100 --imgsz 960 --device 0` if CUDA is available;
   the current run used `yolov8n` and CPU purely because that's what this
   machine has.
5. **Re-validate with `ai/validate.py`** and only trust the numbers it
   prints - never assume or round up.
6. **Replace `ai/models/gamecount-v1.pt`** once the new checkpoint's
   metrics are actually better, class by class, not just on average.

## Adding more species later

The detector abstraction (`AnimalDetector` in `backend/app/ai/detector.py`)
and the `SPECIES` list in `backend/app/config.py` are the only two places
that need updating to support additional species (e.g. zebra, buffalo,
rhino, kudu, wildebeest, lion, leopard) once a model trained on those
classes is available. The frontend reads species names from the API
response, so no species-specific frontend code needs to change.

## Known limitations to keep in mind

- This checkpoint was trained on ground-level reference photos, not aerial
  imagery - if the app's real use case is drone/aerial counting, expect
  a further accuracy drop until the dataset includes aerial shots.
- AI accuracy depends heavily on image quality, altitude, and lighting.
- Species classification accuracy depends entirely on the training dataset
  - right now, that dataset is 20 images, and it shows.
- Overlapping or clustered animals are harder to separate correctly.
- Partially hidden animals (under trees, in shadow) may be missed.
- Small animals are harder to detect at higher flight altitudes.
- AI results always require human review and verification before being
  used for any counting or management decision.
