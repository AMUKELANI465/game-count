import { useEffect, useRef, useState } from "react";
import type { Detection } from "../types";
import { SPECIES_COLORS } from "../constants";

interface Props {
  imageUrl: string;
  detections: Detection[];
  alt?: string;
}

/**
 * Renders the source image and draws detection bounding boxes on top of it
 * using absolutely-positioned divs scaled to the image's rendered size.
 * (The backend also produces a pre-annotated JPEG, but drawing live lets us
 * keep boxes crisp at any display size.)
 */
export default function DetectionImage({ imageUrl, detections, alt = "Analyzed wildlife image" }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [renderedSize, setRenderedSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (imgRef.current) {
        setRenderedSize({ w: imgRef.current.clientWidth, h: imgRef.current.clientHeight });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onLoad = () => {
    if (imgRef.current) {
      setNaturalSize({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
      setRenderedSize({ w: imgRef.current.clientWidth, h: imgRef.current.clientHeight });
    }
  };

  const scaleX = naturalSize && renderedSize ? renderedSize.w / naturalSize.w : 1;
  const scaleY = naturalSize && renderedSize ? renderedSize.h / naturalSize.h : 1;

  return (
    <div className="relative inline-block w-full">
      <img
        ref={imgRef}
        src={imageUrl}
        alt={alt}
        onLoad={onLoad}
        className="w-full h-auto rounded-lg border border-earth-200 block"
      />
      {naturalSize &&
        detections.map((det, i) => {
          const color = SPECIES_COLORS[det.species] || "#b96922";
          const left = det.bbox.x1 * scaleX;
          const top = det.bbox.y1 * scaleY;
          const width = (det.bbox.x2 - det.bbox.x1) * scaleX;
          const height = (det.bbox.y2 - det.bbox.y1) * scaleY;
          return (
            <div
              key={i}
              className="absolute border-2 rounded-sm"
              style={{ left, top, width, height, borderColor: color }}
              title={`${det.species} · ${Math.round(det.confidence * 100)}%`}
            >
              <span
                className="absolute -top-5 left-0 text-[10px] font-semibold text-white px-1 rounded-sm whitespace-nowrap"
                style={{ backgroundColor: color }}
              >
                {det.species} {Math.round(det.confidence * 100)}%
              </span>
            </div>
          );
        })}
    </div>
  );
}
