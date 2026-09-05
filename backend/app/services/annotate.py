"""
Draws detection bounding boxes onto a copy of the uploaded image so the
frontend has a ready-made "annotated image" to display (in addition to
drawing boxes live on a <canvas> if it wants to).
"""
from PIL import Image, ImageDraw, ImageFont

SPECIES_COLORS = {
    "elephant": "#2F5233",   # dark green
    "giraffe": "#C97B2C",    # orange accent
    "impala": "#8C6239",     # earthy brown
    "springbok": "#4C7A5A",  # forest green
}


def draw_annotations(source_path: str, dest_path: str, detections: list) -> None:
    image = Image.open(source_path).convert("RGB")
    draw = ImageDraw.Draw(image)

    try:
        font = ImageFont.load_default()
    except Exception:
        font = None

    for det in detections:
        species = det["species"]
        bbox = det["bbox"]
        color = SPECIES_COLORS.get(species, "#FF6B00")
        label = f"{species} {int(det['confidence'] * 100)}%"

        draw.rectangle([bbox["x1"], bbox["y1"], bbox["x2"], bbox["y2"]], outline=color, width=3)
        text_bg = [bbox["x1"], max(0, bbox["y1"] - 16), bbox["x1"] + 8 * len(label), max(16, bbox["y1"])]
        draw.rectangle(text_bg, fill=color)
        draw.text((bbox["x1"] + 2, max(0, bbox["y1"] - 15)), label, fill="white", font=font)

    image.save(dest_path)
