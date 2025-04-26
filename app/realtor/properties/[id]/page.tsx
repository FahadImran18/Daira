"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

// This function is required for static site generation with dynamic routes
export async function generateStaticParams() {
  // Return an empty array for now - we'll handle this dynamically
  // In a real implementation, you would fetch all property IDs and return them
  return [];
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const propertyService = new PropertyService();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadProperty = async () => {
      try {
        const propertyData = await propertyService.getPropertyById(
          params.id as string
        );
        if (!propertyData) {
          toast.error("Property not found");
          router.push("/realtor/dashboard");
          return;
        }
        setProperty(propertyData);
      } catch (error: any) {
        console.error("Error loading property:", error);
        toast.error(error.message || "Failed to load property");
        router.push("/realtor/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [user, params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    try {
      setIsSaving(true);
      await propertyService.updateProperty(property.id, property);
      toast.success("Property updated successfully");
    } catch (error: any) {
      console.error("Error updating property:", error);
      toast.error(error.message || "Failed to update property");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!property) return;

    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      setIsSaving(true);
      await propertyService.deleteProperty(property.id);
      toast.success("Property deleted successfully");
      router.push("/realtor/dashboard");
    } catch (error: any) {
      console.error("Error deleting property:", error);
      toast.error(error.message || "Failed to delete property");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          className="mr-2"
          onClick={() => router.push("/realtor/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Manage Property</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>
            Update your property listing details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={property.title || ""}
                onChange={(e) =>
                  setProperty({ ...property, title: e.target.value })
                }
                placeholder="Beautiful 3-bedroom house in downtown"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={property.description || ""}
                onChange={(e) =>
                  setProperty({ ...property, description: e.target.value })
                }
                placeholder="Describe the property in detail..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={property.price || 0}
                  onChange={(e) =>
                    setProperty({ ...property, price: Number(e.target.value) })
                  }
                  placeholder="500000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={property.location || ""}
                  onChange={(e) =>
                    setProperty({ ...property, location: e.target.value })
                  }
                  placeholder="123 Main St"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={property.city || ""}
                  onChange={(e) =>
                    setProperty({ ...property, city: e.target.value })
                  }
                  placeholder="New York"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type</Label>
                <Select
                  value={property.property_type || "house"}
                  onValueChange={(value) =>
                    setProperty({ ...property, property_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={property.bedrooms || 0}
                  onChange={(e) =>
                    setProperty({
                      ...property,
                      bedrooms: Number(e.target.value),
                    })
                  }
                  placeholder="3"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={property.bathrooms || 0}
                  onChange={(e) =>
                    setProperty({
                      ...property,
                      bathrooms: Number(e.target.value),
                    })
                  }
                  placeholder="2"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area (sq ft)</Label>
                <Input
                  id="area"
                  type="number"
                  value={property.area || 0}
                  onChange={(e) =>
                    setProperty({ ...property, area: Number(e.target.value) })
                  }
                  placeholder="2000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={property.status || "active"}
                onValueChange={(value: PropertyStatus) =>
                  setProperty({ ...property, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Image URLs (comma-separated)</Label>
              <Input
                id="images"
                value={property.images?.join(", ") || ""}
                onChange={(e) => {
                  const imageUrls = e.target.value
                    .split(",")
                    .map((url) => url.trim());
                  setProperty({ ...property, images: imageUrls });
                }}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSaving}
              >
                Delete Property
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
