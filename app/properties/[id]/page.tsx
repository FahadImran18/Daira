"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "@/lib/supabase/provider";
import { PropertyService } from "@/lib/services/property-service";
import { Property } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Bed,
  Bath,
  Square,
  MapPin,
  Building2,
  MessageSquare,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const propertyService = new PropertyService();

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const propertyData = await propertyService.getPropertyById(
          params.id as string
        );
        if (!propertyData) {
          toast.error("Property not found");
          router.push("/properties");
          return;
        }
        setProperty(propertyData);
      } catch (error: any) {
        console.error("Error loading property:", error);
        toast.error(error.message || "Failed to load property");
        router.push("/properties");
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  if (!property) {
    return null;
  }

  const handleContactRealtor = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    // TODO: Implement chat creation
    router.push(`/chats/new?propertyId=${property.id}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/properties")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative aspect-video rounded-lg overflow-hidden mb-6 bg-muted">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    property.status === "active"
                      ? "bg-green-100 text-green-800"
                      : property.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : property.status === "sold"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {property.status.charAt(0).toUpperCase() +
                    property.status.slice(1)}
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <div className="flex items-center text-muted-foreground mb-6">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {property.location}, {property.city}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex items-center space-x-2">
                <Bed className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{property.bedrooms}</p>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Bath className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{property.bathrooms}</p>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Square className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{property.area} sq ft</p>
                  <p className="text-sm text-muted-foreground">Area</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p>{property.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="features">
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {property.features &&
                        Object.entries(property.features).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center space-x-2"
                            >
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <span className="capitalize">
                                {key.replace(/_/g, " ")}
                              </span>
                            </div>
                          )
                        )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl">
                  ${property.price.toLocaleString()}
                </CardTitle>
                <CardDescription>
                  Listed on{" "}
                  {format(new Date(property.created_at), "MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full mb-4" onClick={handleContactRealtor}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Realtor
                </Button>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Property Type</h3>
                    <p className="text-muted-foreground capitalize">
                      {property.property_type.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Location</h3>
                    <p className="text-muted-foreground">
                      {property.location}, {property.city}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
