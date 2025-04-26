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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewingDate, setViewingDate] = useState("");
  const [viewingTime, setViewingTime] = useState("");
  const [message, setMessage] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const propertyService = new PropertyService();
  const viewingService = new ViewingService();
  const chatService = new ChatService();

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const propertyData = await propertyService.getPropertyById(
          params.id as string
        );
        if (propertyData) {
          setProperty(propertyData);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <img
              src={
                property.images?.[activeImageIndex] ||
                "https://via.placeholder.com/800x600"
              }
              alt={property.title}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {property.images?.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`relative aspect-square rounded-lg overflow-hidden ${
                  activeImageIndex === index ? "ring-2 ring-primary" : ""
                }`}
              >
                <img
                  src={image}
                  alt={`${property.title} - Image ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
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
      </div>
    </div>
  );
}
