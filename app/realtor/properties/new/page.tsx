"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NewPropertyPage() {
  const router = useRouter();
  const { user } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const propertyService = new PropertyService();
  const [property, setProperty] = useState<Partial<Property>>({
    title: "",
    description: "",
    price: 0,
    location: "",
    city: "",
    property_type: "house",
    status: "active" as PropertyStatus,
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    features: [],
    images: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to add a property");
      return;
    }

    try {
      setIsLoading(true);
      await propertyService.createProperty({
        ...property,
        realtor_id: user.id,
      } as Property);
      toast.success("Property added successfully");
      router.push("/realtor/dashboard");
    } catch (error: any) {
      console.error("Error adding property:", error);
      toast.error(error.message || "Failed to add property");
    } finally {
      setIsLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold">Add New Property</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>
            Fill in the details of your property listing
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
                  value={property.price?.toString() || "0"}
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
                  value={property.bedrooms?.toString() || "0"}
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
                  value={property.bathrooms?.toString() || "0"}
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
                  value={property.area?.toString() || "0"}
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Adding Property..." : "Add Property"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
