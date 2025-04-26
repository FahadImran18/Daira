"use client";

import { useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import { VirtualTourPlugin } from "@photo-sphere-viewer/virtual-tour-plugin";
import { ZoomPlugin } from "@photo-sphere-viewer/zoom-plugin";
import { LoadingPlugin } from "@photo-sphere-viewer/loading-plugin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface PanoramaViewerProps {
  imageUrl: string;
  onClose?: () => void;
  height?: string;
  width?: string;
}

export default function PanoramaViewer({
  imageUrl,
  onClose,
  height = "400px",
  width = "100%",
}: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the viewer
    const newViewer = new Viewer({
      container: containerRef.current,
      plugins: [AutorotatePlugin, VirtualTourPlugin, ZoomPlugin, LoadingPlugin],
      defaultZoomLvl: 50,
      touchmoveTwoFingers: true,
      mousewheelCtrlKey: true,
      navbar: false,
    });

    // Load the image
    newViewer
      .setPanorama(imageUrl)
      .then(() => {
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading panorama:", err);
        setError("Failed to load 360° image. Please try again.");
        setIsLoading(false);
      });

    setViewer(newViewer);

    // Cleanup
    return () => {
      if (newViewer) {
        newViewer.destroy();
      }
    };
  }, [imageUrl]);

  return (
    <Card className="relative overflow-hidden" style={{ height, width }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 p-4 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      )}

      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <CardContent className="p-0 h-full">
        <div ref={containerRef} className="h-full w-full" />
      </CardContent>
    </Card>
  );
}
