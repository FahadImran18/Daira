"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, X, Image as ImageIcon, Globe } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import PanoramaViewer from "./panorama-viewer";
import { useSupabase } from "@/lib/supabase/provider";
import { Progress } from "@/components/ui/progress";

interface ImageUploadProps {
  initialImages?: string[];
  initialPanorama?: string | null;
  onImagesChange: (images: string[]) => void;
  onPanoramaChange: (panorama: string | null) => void;
  disabled?: boolean;
}

export default function ImageUpload({
  initialImages = [],
  initialPanorama = null,
  onImagesChange,
  onPanoramaChange,
  disabled,
}: ImageUploadProps) {
  const { supabase } = useSupabase();
  const [images, setImages] = useState<string[]>(initialImages);
  const [panorama, setPanorama] = useState<string | null>(initialPanorama);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPanorama, setSelectedPanorama] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const panoramaInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  // Initialize state from props
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only update local state if props change
    if (JSON.stringify(initialImages) !== JSON.stringify(images)) {
      setImages(initialImages);
    }

    if (initialPanorama !== panorama) {
      setPanorama(initialPanorama);
    }
  }, [initialImages, initialPanorama]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      const newImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `property-images/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from("images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(filePath);

        newImages.push(publicUrl);
        setProgress(((i + 1) / files.length) * 100);
      }

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages);
      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
      setProgress(0);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const handlePanoramaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `panorama-${Math.random()}.${fileExt}`;
      const filePath = `property-panoramas/${fileName}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      setPanorama(publicUrl);
      onPanoramaChange(publicUrl);
      setProgress(100);
      toast.success("360° panorama uploaded successfully");
    } catch (error) {
      console.error("Error uploading panorama:", error);
      toast.error("Failed to upload panorama");
    } finally {
      setUploading(false);
      setProgress(0);
      if (panoramaInputRef.current) {
        panoramaInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const removePanorama = () => {
    setPanorama(null);
    onPanoramaChange(null);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="images">Regular Images</TabsTrigger>
          <TabsTrigger value="panorama">360° Panorama</TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <Card key={index} className="relative group">
                <div className="relative aspect-square">
                  <Image
                    src={image}
                    alt={`Property image ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                    onClick={() => setSelectedImage(image)}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="bg-white/90 hover:bg-white"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            <Card className="flex items-center justify-center h-48 border-2 border-dashed hover:border-primary/50 transition-colors">
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <div className="text-center space-y-2">
                <Button
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading || disabled}
                  className="w-full"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Images
                </Button>
                <p className="text-sm text-muted-foreground">
                  {images.length} image{images.length !== 1 ? "s" : ""} uploaded
                </p>
              </div>
            </Card>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading... {Math.round(progress)}%
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="panorama" className="space-y-4">
          {panorama ? (
            <Card className="relative group">
              <div className="aspect-video relative">
                <iframe
                  src={panorama}
                  className="w-full h-full rounded-md"
                  allowFullScreen
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="bg-white/90 hover:bg-white"
                    onClick={removePanorama}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-48 border-2 border-dashed hover:border-primary/50 transition-colors">
              <input
                type="file"
                ref={panoramaInputRef}
                onChange={handlePanoramaUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="text-center space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => panoramaInputRef.current?.click()}
                  disabled={uploading || disabled}
                  className="w-full"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4 mr-2" />
                  )}
                  Upload 360° Panorama
                </Button>
                <p className="text-sm text-muted-foreground">
                  No panorama uploaded yet
                </p>
              </div>
            </Card>
          )}

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading... {Math.round(progress)}%
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full mx-4">
            <Image
              src={selectedImage}
              alt="Selected image"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
