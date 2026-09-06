import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

declare const google: any;

export interface MapMarker {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  content?: ReactNode;
  status?: "verified" | "pending" | "analyzing";
}

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  style?: React.CSSProperties;
  mapType?: "roadmap" | "satellite" | "terrain" | "hybrid";
}

const MARKER_COLORS: Record<string, string> = {
  verified: "#111113", // neutral-950
  pending: "#5aa2f2", // accent-400
  analyzing: "#969aa3", // earth-400
};

/**
 * GoogleMap component that displays an interactive Google Map.
 * Requires VITE_GOOGLE_MAPS_API_KEY environment variable to be set.
 */
export default function GoogleMap({
  center,
  zoom,
  markers = [],
  onMarkerClick,
  style = { width: "100%", height: "100%" },
  mapType = "roadmap",
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    // Check if API key is configured
    if (!apiKey) {
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f2f6f2; color: #1f351f; font-family: system-ui; text-align: center; padding: 20px;">
            <div>
              <p style="margin: 0 0 10px 0; font-weight: 600;">Google Maps API Key Not Configured</p>
              <p style="margin: 0; font-size: 14px; color: #3f6f45;">
                Please set <code style="background: #e2d2b8; padding: 2px 6px; border-radius: 4px;">VITE_GOOGLE_MAPS_API_KEY</code> in your .env file
              </p>
            </div>
          </div>
        `;
      }
      return;
    }

    // Load Google Maps API
    const loadGoogleMaps = async () => {
      try {
        // Use the modern Google Maps API approach with importLibrary
        if (!(window as any).google?.maps) {
          const mapScriptId = "google-maps-script";
          if (!document.getElementById(mapScriptId)) {
            const script = document.createElement("script");
            script.id = mapScriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
            script.async = true;
            document.head.appendChild(script);

            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
            });
          }
        }

        if (!mapRef.current || !(window as any).google?.maps) return;

        // Create map
        const mapOptions: any = {
          center,
          zoom,
          mapTypeId: mapType,
          styles: [
            {
              elementType: "geometry",
              stylers: [{ color: "#f2f6f2" }],
            },
            {
              elementType: "labels.text.stroke",
              stylers: [{ color: "#dfe9df" }],
            },
            {
              elementType: "labels.text.fill",
              stylers: [{ color: "#2f5233" }],
            },
            {
              featureType: "administrative.land_parcel",
              elementType: "labels.text.fill",
              stylers: [{ color: "#3f6f45" }],
            },
            {
              featureType: "water",
              elementType: "geometry.fill",
              stylers: [{ color: "#b9d0ba" }],
            },
          ],
        };

        googleMapRef.current = new google.maps.Map(mapRef.current, mapOptions);

        // Clear existing markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        // Add markers
        markers.forEach((marker) => {
          const markerColor = MARKER_COLORS[marker.status || "pending"] || MARKER_COLORS.pending;

          const gMarker = new google.maps.Marker({
            position: { lat: marker.lat, lng: marker.lng },
            map: googleMapRef.current!,
            title: marker.title,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: markerColor,
              fillOpacity: 0.8,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });

          if (marker.content) {
            const infoWindow = new google.maps.InfoWindow({
              content: `<div style="color: #1f351f; font-family: system-ui;"><strong>${marker.title}</strong><br/>${marker.content}</div>`,
            });

            gMarker.addListener("click", () => {
              infoWindow.open(googleMapRef.current!, gMarker);
              onMarkerClick?.(marker);
            });
          } else if (onMarkerClick) {
            gMarker.addListener("click", () => onMarkerClick(marker));
          }

          markersRef.current.push(gMarker);
        });
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        if (mapRef.current) {
          mapRef.current.innerHTML =
            '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f2f6f2; color: #c97b2c; font-family: system-ui;">Failed to load map</div>';
        }
      }
    };

    loadGoogleMaps();
  }, [apiKey, center, zoom, markers, mapType, onMarkerClick]);

  return <div ref={mapRef} style={style} />;
}
