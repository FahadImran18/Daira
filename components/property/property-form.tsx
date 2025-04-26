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

interface PropertyFormProps {
  propertyId?: string;
}

const propertyService = new PropertyService();

export function PropertyForm({ propertyId }: PropertyFormProps) {
  const router = useRouter();
  const { user } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to save a property");
      return;
    }

    try {
      setSaving(true);
      if (propertyId) {
        await propertyService.updateProperty(propertyId, {
          ...property,
          realtor_id: user.id,
        } as Property);
        toast.success("Property updated successfully");
      } else {
        await propertyService.createProperty({
          ...property,
          realtor_id: user.id,
        } as Property);
        toast.success("Property created successfully");
      }
      router.push("/properties");
    } catch (error) {
      console.error("Error saving property:", error);
      toast.error("Failed to save property");
    } finally {
      setSaving(false);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={property.title || ""}
          onChange={(e) => setProperty({ ...property, title: e.target.value })}
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
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={property.price?.toString() || "0"}
            onChange={(e) =>
              setProperty({ ...property, price: Number(e.target.value) })
            }
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
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={property.city || ""}
            onChange={(e) => setProperty({ ...property, city: e.target.value })}
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

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            value={property.bedrooms?.toString() || "0"}
            onChange={(e) =>
              setProperty({ ...property, bedrooms: Number(e.target.value) })
            }
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
              setProperty({ ...property, bathrooms: Number(e.target.value) })
            }
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

      <Button type="submit" disabled={saving}>
        {saving
          ? "Saving..."
          : propertyId
          ? "Update Property"
          : "Create Property"}
      </Button>
    </form>
  );
}
