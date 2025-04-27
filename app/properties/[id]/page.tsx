"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { PropertyService } from "@/lib/services/property-service";
import { ViewingService } from "@/lib/services/viewing-service";
import { ChatService } from "@/lib/services/chat-service";
import { Property } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  MessageSquare,
  Clock,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ChatButton from "@/components/property/chat-button";
import { useSupabase } from "@/lib/supabase/provider";
import SphereViewer from "@/components/property/sphere-viewer";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";
import PanoramaViewer from "@/components/property/panorama-viewer";
import { AdvisorService } from "@/lib/services/advisor-service";
import { loadStripe } from "@stripe/stripe-js";

// Define the Advisor type
interface Advisor {
  id: string;
  name: string;
  expertise: string;
  city: string;
  bio: string;
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewingDate, setViewingDate] = useState("");
  const [viewingTime, setViewingTime] = useState("");
  const [message, setMessage] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const propertyService = new PropertyService();
  const viewingService = new ViewingService();
  const chatService = new ChatService();
  const advisorService = new AdvisorService();

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const propertyData = await propertyService.getPropertyById(
          params.id as string
        );
        if (propertyData) {
          setProperty(propertyData);
          // Load advisors for this property's area
          try {
            const advisorData = await advisorService.getAdvisorsByArea(
              propertyData.location,
              propertyData.city
            );
            setAdvisors(advisorData);
          } catch (advisorError) {
            console.error("Error loading advisors:", advisorError);
            // If there's an error loading advisors, add a test advisor
            console.log("Adding test advisor due to error");
            setAdvisors([
              {
                id: "test-advisor-id",
                name: "Test Advisor",
                expertise: "Residential",
                city: propertyData.city,
                bio: "I'm a test advisor with expertise in residential properties. I can help you evaluate this property and provide valuable insights.",
              } as any,
            ]);
          }
        }
      } catch (error) {
        console.error("Error loading property:", error);
        toast.error("Failed to load property");
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [params.id]);

  const handleScheduleViewing = async () => {
    if (!user || !property) return;

    try {
      setIsScheduling(true);
      const scheduledAt = new Date(`${viewingDate}T${viewingTime}`);

      await viewingService.scheduleViewing({
        property_id: property.id,
        user_id: user.id,
        scheduled_at: scheduledAt.toISOString(),
      });

      toast.success("Viewing scheduled successfully");
      setViewingDate("");
      setViewingTime("");
    } catch (error) {
      console.error("Error scheduling viewing:", error);
      toast.error("Failed to schedule viewing");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !property) return;

    try {
      setIsMessaging(true);

      // Get or create a chat between the user and realtor
      const chat = await chatService.getOrCreateChat(
        property.id,
        user.id,
        property.realtor_id
      );

      // Send the message
      await chatService.sendMessage(chat.id, user.id, message);

      toast.success("Message sent successfully");
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsMessaging(false);
    }
  };

  const handleConsultation = async (advisorId: string) => {
    if (!user) {
      toast.error("Please log in to request a consultation");
      router.push("/login");
      return;
    }

    try {
      console.log("Creating consultation for advisor:", advisorId);
      const response = await fetch("/api/stripe/create-consultation-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          advisorId,
          propertyId: property!.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create consultation");
      }

      const session = await response.json();
      console.log("Stripe session created:", session);

      if (!session.url) {
        throw new Error("No checkout URL returned from Stripe");
      }

      // Redirect directly to the Stripe checkout URL
      window.location.href = session.url;
    } catch (error) {
      console.error("Error creating consultation:", error);
      toast.error("Failed to create consultation");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-96 bg-gray-200 rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Property not found</h1>
          <p className="text-muted-foreground">
            The property you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Property Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.images?.map((image, index) => (
              <div
                key={index}
                className="relative aspect-video cursor-pointer group"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image}
                  alt={`${property.title} - Image ${index + 1}`}
                  className="object-cover w-full h-full rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white">View in 360°</span>
                </div>
              </div>
            ))}
          </div>

          {/* 360° Panorama Modal */}
          {selectedImage && (
            <div className="fixed inset-0 bg-black/80 z-50 p-4">
              <div className="absolute right-4 top-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="w-full h-full max-w-7xl mx-auto flex items-center justify-center">
                <div className="w-full h-[80vh]">
                  <PanoramaViewer
                    imageUrl={selectedImage}
                    height="100%"
                    width="100%"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dedicated 360° Panorama Section */}
          {property.panorama && (
            <div>
              <h3 className="text-xl font-semibold mb-4">360° Virtual Tour</h3>
              <div className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-300">
                <PanoramaViewer
                  imageUrl={property.panorama}
                  height="100%"
                  width="100%"
                />
              </div>
            </div>
          )}
        </div>

        {/* Property Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{property.title}</h1>
                <Badge
                  variant={
                    property.status === "active" ? "default" : "secondary"
                  }
                >
                  {property.status}
                </Badge>
              </div>
              <div className="flex items-center text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {property.location}, {property.city}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">
                      {property.bedrooms} Beds
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">
                      {property.bathrooms} Baths
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Maximize className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{property.area} sq ft</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium capitalize">
                      {property.property_type}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground whitespace-pre-line">
                      {property.description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {property.features?.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="location" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="aspect-video bg-muted rounded-lg">
                      {/* Add map component here */}
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Map will be displayed here
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  ${Number(property.price).toLocaleString()}
                </div>
                <div className="flex items-center text-muted-foreground mt-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    Listed on{" "}
                    {format(new Date(property.created_at), "MMMM d, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {user && user.role !== "realtor" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Contact Realtor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ChatButton
                    propertyId={property.id}
                    realtorId={property.realtor_id}
                    propertyTitle={property.title}
                  />

                  <div className="text-center text-sm text-muted-foreground">
                    or schedule a viewing
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Viewing
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule a Viewing</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={viewingDate}
                            onChange={(e) => setViewingDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time">Time</Label>
                          <Input
                            id="time"
                            type="time"
                            value={viewingTime}
                            onChange={(e) => setViewingTime(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add any specific questions or requirements..."
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={handleScheduleViewing}
                          disabled={
                            isScheduling || !viewingDate || !viewingTime
                          }
                        >
                          {isScheduling ? "Scheduling..." : "Schedule Viewing"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            {user?.role === "realtor" && property.realtor_id === user.id && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Property</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full"
                    onClick={() =>
                      router.push(`/realtor/properties/${property.id}`)
                    }
                  >
                    Edit Property
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      router.push(`/realtor/properties/${property.id}/viewings`)
                    }
                  >
                    View Scheduled Viewings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      router.push(`/realtor/properties/${property.id}/messages`)
                    }
                  >
                    View Messages
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Add this section after the property information */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Available Advisors</h2>
          {advisors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advisors.map((advisor) => (
                <Card key={advisor.id}>
                  <CardHeader>
                    <CardTitle>{advisor.name}</CardTitle>
                    <CardDescription>
                      {advisor.expertise} Expert • {advisor.city}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {advisor.bio}
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => handleConsultation(advisor.id)}
                    >
                      Get Consultation ($15)
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  No advisors available for this area at the moment. Please
                  check back later.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
