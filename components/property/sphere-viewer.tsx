"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const initScene = () => {
      // Create scene
      const newScene = new THREE.Scene();
      setScene(newScene);

      // Create camera
      const newCamera = new THREE.PerspectiveCamera(
        75,
        containerRef.current!.clientWidth / containerRef.current!.clientHeight,
        0.1,
        1000
      );
      newCamera.position.z = 0.1;
      setCamera(newCamera);

      // Create renderer
      const newRenderer = new THREE.WebGLRenderer({ antialias: true });
      newRenderer.setSize(
        containerRef.current!.clientWidth,
        containerRef.current!.clientHeight
      );
      containerRef.current!.appendChild(newRenderer.domElement);
      setRenderer(newRenderer);

      // Create controls
      const newControls = new OrbitControls(newCamera, newRenderer.domElement);
      newControls.enableZoom = false;
      newControls.enablePan = false;
      newControls.rotateSpeed = -0.5;
      setControls(newControls);

      // Load texture
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        imageUrl,
        (loadedTexture) => {
          setTexture(loadedTexture);
          setIsLoading(false);
        },
        undefined,
        (err) => {
          console.error("Error loading texture:", err);
          setError("Failed to load image");
          setIsLoading(false);
        }
      );
    };

    initScene();

    // Animation loop
    const animate = () => {
      if (renderer && scene && camera && controls) {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current && camera && renderer) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (renderer && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      if (texture) {
        texture.dispose();
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [imageUrl]);

  // Create sphere when texture is loaded
  useEffect(() => {
    if (scene && texture) {
      // Create sphere geometry
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1); // Invert the sphere so it's visible from the inside

      // Create material with the loaded texture
      const material = new THREE.MeshBasicMaterial({ map: texture });

      // Create mesh
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      return () => {
        scene.remove(sphere);
        geometry.dispose();
        material.dispose();
      };
    }
  }, [scene, texture]);

  return (
    <Card className={`overflow-hidden ${className}`}>
      {title && (
        <div className="p-2 bg-muted text-center text-sm font-medium">
          {title}
        </div>
      )}
      <CardContent className="p-0">
        <div
          ref={containerRef}
          className="w-full aspect-square relative"
          style={{ minHeight: "300px" }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <p className="text-destructive">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
