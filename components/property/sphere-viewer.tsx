"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface SphereViewerProps {
  imageUrl: string;
  title?: string;
  className?: string;
}

export default function SphereViewer({
  imageUrl,
  title,
  className = "",
}: SphereViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create an iframe to load the 360° viewer
    const iframe = document.createElement("iframe");
    iframe.src = `https://viewer.shapediver.com/v3/viewer?model=${encodeURIComponent(
      imageUrl
    )}`;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.borderRadius = "0.5rem";

    // Handle loading state
    iframe.onload = () => {
      setIsLoading(false);
    };

    // Handle errors
    iframe.onerror = () => {
      setError("Failed to load 360° image");
      setIsLoading(false);
    };

    // Clear previous content and append the iframe
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(iframe);

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [imageUrl]);

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {title && (
        <div className="absolute top-0 left-0 right-0 bg-black/50 text-white p-2 text-sm z-10">
          {title}
        </div>
      )}

      <div ref={containerRef} className="w-full h-[300px] bg-muted" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <p className="text-destructive">{error}</p>
        </div>
      )}
    </Card>
  );
}
