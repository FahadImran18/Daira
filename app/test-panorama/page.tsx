"use client";

import PanoramaViewer from "@/components/property/panorama-viewer";

export default function TestPanoramaPage() {
  // Sample panorama image from the Photo Sphere Viewer documentation
  const samplePanoramaUrl =
    "https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Panorama Viewer Test</h1>
      <p className="mb-4">
        This is a test page to verify that the PanoramaViewer works correctly.
      </p>

      <div className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-300">
        <PanoramaViewer
          imageUrl={samplePanoramaUrl}
          height="100%"
          width="100%"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Instructions</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Click and drag to look around</li>
          <li>Use the mouse wheel to zoom in/out</li>
          <li>On mobile, use touch gestures to navigate</li>
        </ul>
      </div>
    </div>
  );
}
