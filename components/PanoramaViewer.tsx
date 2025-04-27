"use client";

import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";

interface PanoramaViewerProps {
  imageUrl: string;
  height?: string;
  width?: string;
}

export default function PanoramaViewer({
  imageUrl,
  height = "500px",
  width = "100%",
}: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    // Clean up previous viewer if it exists
    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }

    // Create a new viewer instance
    if (containerRef.current) {
      // Use the exact configuration from the documentation
      viewerRef.current = new Viewer({
        container: containerRef.current,
        panorama: imageUrl,
      });
    }

    // Cleanup function
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [imageUrl]);

  return (
    <div
      ref={containerRef}
      style={{
        height,
        width,
        position: "relative",
      }}
    />
  );
}
