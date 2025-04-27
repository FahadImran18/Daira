"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase/provider";
import { PropertyService } from "@/lib/services/property-service";
import { Property, PropertyStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ImageUpload from "./image-upload";
import SphereViewer from "./sphere-viewer";
import PanoramaViewer from "@/components/property/panorama-viewer";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PropertyFormProps {
  propertyId?: string;
}

const propertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  location: z.string().min(1, "Location is required"),
  city: z.string().min(1, "City is required"),
  property_type: z.string().min(1, "Property type is required"),
  area: z.string().min(1, "Area is required"),
  bedrooms: z.string().min(1, "Number of bedrooms is required"),
  bathrooms: z.string().min(1, "Number of bathrooms is required"),
  status: z.string().default("active"),
  is_featured: z.boolean().default(false),
  panorama: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema> & {
  images: string[];
  panorama?: string;
};

const propertyService = new PropertyService();

export function PropertyForm({ propertyId }: PropertyFormProps) {
  const router = useRouter();
  const { user } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState<Partial<Property>>({
    title: "",
    description: "",
    price: "",
    location: "",
    city: "",
    property_type: "house",
    status: "active" as PropertyStatus,
    bedrooms: 0,
    bathrooms: 0,
    area: "",
    features: [],
    images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedPanorama, setUploadedPanorama] = useState<string>();

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const loadProperty = async () => {
    if (!propertyId) return;
    try {
      setLoading(true);
      const data = await propertyService.getPropertyById(propertyId);
      if (data) {
        setProperty(data);
      }
    } catch (error) {
      console.error("Error loading property:", error);
      toast.error("Failed to load property");
    } finally {
      setLoading(false);
    }
  };

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      location: "",
      city: "",
      property_type: "",
      area: "",
      bedrooms: "",
      bathrooms: "",
      images: [],
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    if (!user) {
      toast.error("You must be logged in to upload a property");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Submitting property data:", {
        ...data,
        images: uploadedImages,
        panorama: uploadedPanorama || data.panorama,
      });

      const propertyData = {
        ...data,
        realtor_id: user.id,
        images: uploadedImages,
        panorama: uploadedPanorama || data.panorama || undefined,
        features: [],
        status: "active" as PropertyStatus,
        is_featured: false,
        price: data.price,
        area: data.area,
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms),
      };

      console.log("Sending property data to service:", propertyData);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 10000);
      });

      await Promise.race([
        propertyService.createProperty(propertyData),
        timeoutPromise,
      ]);

      toast.success("Property uploaded successfully");
      form.reset();
      setUploadedImages([]);
      setUploadedPanorama(undefined);
    } catch (error) {
      console.error("Error uploading property:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload property"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageUrls = e.target.value.split(",").map((url) => url.trim());
    setProperty({ ...property, images: imageUrls });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter property title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter property description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area (sq ft)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter area" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="property_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Number of bedrooms"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Number of bathrooms"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormLabel>Property Images</FormLabel>
          <ImageUpload
            onImagesChange={(urls) => {
              setUploadedImages(urls);
              form.setValue("images", urls);
            }}
            onPanoramaChange={(url) => {
              if (url) {
                setUploadedPanorama(url);
                form.setValue("panorama", url);
              } else {
                setUploadedPanorama(undefined);
                form.setValue("panorama", undefined);
              }
            }}
          />
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {uploadedImages.map((url, index) => (
                <SphereViewer
                  key={index}
                  imageUrl={url}
                  title={`Property Image ${index + 1}`}
                />
              ))}
            </div>
          )}
          {form.watch("panorama") && (
            <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-300">
              <PanoramaViewer
                imageUrl={form.watch("panorama")}
                height="100%"
                width="100%"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="panorama">360° Panorama URL</Label>
          <Input
            id="panorama"
            value={property.panorama || ""}
            onChange={(e) =>
              setProperty({ ...property, panorama: e.target.value })
            }
            placeholder="https://example.com/panorama.jpg"
          />
          <p className="text-sm text-muted-foreground">
            Enter the URL of a 360° panorama image for virtual tour
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload Property"
          )}
        </Button>
      </form>
    </Form>
  );
}
