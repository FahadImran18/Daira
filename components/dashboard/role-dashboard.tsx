"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/provider";
import { UserService } from "@/lib/services/user-service";
import { PropertyService } from "@/lib/services/property-service";
import { ChatService } from "@/lib/services/chat-service";
import { AdviceService } from "@/lib/services/advice-service";
import {
  UserRole,
  Property,
  PropertyStatus,
  Chat,
  AdviceRequest,
  ChatStatus,
  AdviceStatus,
} from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Plus,
  Building2,
  MessageSquare,
  BarChart3,
  Upload,
  DollarSign,
  MapPin,
  Bed,
  Bath,
  Square,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser } from "@/hooks/use-user";

const propertyFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  location: z.string().min(1, "Location is required"),
  city: z.string().min(1, "City is required"),
  property_type: z.string().min(1, "Property type is required"),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  area: z.string().min(1, "Area is required"),
  images: z.string().optional(),
  features: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

export default function RoleDashboard() {
  const { user, userRole } = useSupabase();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [adviceRequests, setAdviceRequests] = useState<AdviceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [newProperty, setNewProperty] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    city: "",
    property_type: "house",
    bedrooms: "",
    bathrooms: "",
    area: "",
    status: "active",
  });

  const userService = new UserService();
  const propertyService = new PropertyService();
  const chatService = new ChatService();
  const adviceService = new AdviceService();

  const form = useForm<z.infer<typeof propertyFormSchema>>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      location: "",
      city: "",
      property_type: "",
      bedrooms: "",
      bathrooms: "",
      area: "",
    },
  });

  const loadUserData = async () => {
    if (!user) return;

    try {
      if (user.role === "realtor") {
        const [properties, chats, adviceRequests] = await Promise.all([
          propertyService.getPropertiesByRealtor(user.id),
          chatService.getChatsByRealtor(user.id),
          adviceService.getAdviceRequests(user.id, "advisor"),
        ]);

        setProperties(properties as Property[]);
        setChats(chats as Chat[]);
        setAdviceRequests(adviceRequests as AdviceRequest[]);
      } else if (user.role === "user") {
        const [properties, chats, adviceRequests] = await Promise.all([
          propertyService.getPropertiesByUser(user.id),
          chatService.getChatsByUser(user.id),
          adviceService.getAdviceRequests(user.id, "user"),
        ]);

        setProperties(properties as Property[]);
        setChats(chats as Chat[]);
        setAdviceRequests(adviceRequests as AdviceRequest[]);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const handlePropertyUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsUploading(true);
      const propertyData = {
        ...newProperty,
        realtor_id: user.id,
        price: Number(newProperty.price),
        bedrooms: Number(newProperty.bedrooms),
        bathrooms: Number(newProperty.bathrooms),
        area: Number(newProperty.area),
      };

      await propertyService.createProperty(propertyData);
      toast.success("Property uploaded successfully");

      // Refresh properties list
      const updatedProperties = await propertyService.getPropertiesByRealtor(
        user.id
      );
      setProperties(updatedProperties);

      // Reset form
      setNewProperty({
        title: "",
        description: "",
        price: "",
        location: "",
        city: "",
        property_type: "house",
        bedrooms: "",
        bathrooms: "",
        area: "",
        status: "active",
      });
    } catch (error: any) {
      console.error("Error uploading property:", error);
      toast.error(error.message || "Failed to upload property");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!user) return;

    try {
      const propertyData: Partial<Property> = {
        ...data,
        price: parseFloat(data.price),
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        area: data.area ? parseFloat(data.area) : null,
        images: data.images
          ? data.images.split(",").map((img: string) => img.trim())
          : [],
        features: data.features ? JSON.parse(data.features) : {},
        status: "active" as PropertyStatus,
        realtor_id: user.id,
      };

      if (editingProperty) {
        await propertyService.updateProperty(editingProperty.id, propertyData);
      } else {
        await propertyService.createProperty({
          ...propertyData,
          images: propertyData.images || [],
          features: propertyData.features || {},
        } as Omit<Property, "id" | "created_at" | "updated_at">);
      }

      const updatedProperties = await propertyService.getProperties();
      setProperties(updatedProperties);
      setShowPropertyForm(false);
      setEditingProperty(null);
    } catch (error) {
      console.error("Error saving property:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  if (!userRole) {
    return <div>User role not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {userRole === "realtor"
            ? "Realtor Dashboard"
            : userRole === "advisor"
            ? "Advisor Dashboard"
            : "Customer Dashboard"}
        </h1>

        {userRole === "realtor" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Property</DialogTitle>
                <DialogDescription>
                  Fill in the details to list a new property
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Luxury Villa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="500000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the property..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
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
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="property_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="apartment">
                                Apartment
                              </SelectItem>
                              <SelectItem value="condo">Condo</SelectItem>
                              <SelectItem value="townhouse">
                                Townhouse
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
                            <Input
                              type="number"
                              placeholder="2000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="3" {...field} />
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
                            <Input type="number" placeholder="2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading}>
                      {isUploading ? "Uploading..." : "Upload Property"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs
        defaultValue={
          userRole === "realtor"
            ? "properties"
            : userRole === "advisor"
            ? "advice"
            : "chats"
        }
      >
        <TabsList className="mb-6">
          {userRole === "realtor" && (
            <>
              <TabsTrigger value="properties">
                <Building2 className="mr-2 h-4 w-4" />
                My Properties
              </TabsTrigger>
              <TabsTrigger value="chats">
                <MessageSquare className="mr-2 h-4 w-4" />
                Property Inquiries
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
            </>
          )}
          {userRole === "advisor" && (
            <TabsTrigger value="advice">Advice Requests</TabsTrigger>
          )}
          {userRole === "customer" && (
            <>
              <TabsTrigger value="chats">My Chats</TabsTrigger>
              <TabsTrigger value="advice">My Advice Requests</TabsTrigger>
            </>
          )}
        </TabsList>

        {userRole === "realtor" && (
          <>
            <TabsContent value="properties">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.length === 0 ? (
                  <Card className="col-span-full">
                    <CardHeader>
                      <CardTitle>No Properties</CardTitle>
                      <CardDescription>
                        You haven't added any properties yet. Click the "Add New
                        Property" button to get started.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Property
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          {/* Same form content as above */}
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ) : (
                  properties.map((property) => (
                    <Card
                      key={property.id}
                      className="group hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle className="line-clamp-1">
                          {property.title}
                        </CardTitle>
                        <CardDescription>
                          {property.city}, {property.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-2xl font-bold text-primary">
                            ${property.price.toLocaleString()}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{property.bedrooms} beds</span>
                            <span>•</span>
                            <span>{property.bathrooms} baths</span>
                            <span>•</span>
                            <span>{property.area} sq ft</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                property.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : property.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {property.status.charAt(0).toUpperCase() +
                                property.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.push(`/realtor/properties/${property.id}`)
                          }
                        >
                          Manage
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            router.push(`/properties/${property.id}`)
                          }
                        >
                          View
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="chats">
              <div className="space-y-4">
                {chats.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Inquiries</CardTitle>
                      <CardDescription>
                        You don't have any property inquiries yet.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  chats.map((chat) => (
                    <Card
                      key={chat.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle>Chat about {chat.property?.title}</CardTitle>
                        <CardDescription>
                          From: {chat.user?.email} • Last updated:{" "}
                          {format(new Date(chat.updated_at), "MMM d, yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/chats/${chat.id}`)}
                        >
                          View Chat
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Property Analytics</CardTitle>
                  <CardDescription>
                    Overview of your property performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Total Properties
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">
                          {properties.length}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Active Listings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">
                          {
                            properties.filter((p) => p.status === "active")
                              .length
                          }
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Total Inquiries
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{chats.length}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        {userRole === "advisor" && (
          <TabsContent value="advice">
            <div className="space-y-4">
              {adviceRequests.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Advice Requests</CardTitle>
                    <CardDescription>
                      You don't have any advice requests yet.
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                adviceRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <CardTitle>
                        Advice Request for {request.property?.title}
                      </CardTitle>
                      <CardDescription>
                        From: {request.user?.email} • Status: {request.status} •
                        Created:{" "}
                        {format(new Date(request.created_at), "MMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        )}

        {userRole === "customer" && (
          <>
            <TabsContent value="chats">
              <div className="space-y-4">
                {chats.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Chats</CardTitle>
                      <CardDescription>
                        You don't have any active chats yet.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  chats.map((chat) => (
                    <Card key={chat.id}>
                      <CardHeader>
                        <CardTitle>Chat about {chat.property?.title}</CardTitle>
                        <CardDescription>
                          With: {chat.realtor?.email} • Last updated:{" "}
                          {format(new Date(chat.updated_at), "MMM d, yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/chats/${chat.id}`)}
                        >
                          View Chat
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="advice">
              <div className="space-y-4">
                {adviceRequests.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Advice Requests</CardTitle>
                      <CardDescription>
                        You haven't requested any advice yet.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  adviceRequests.map((request) => (
                    <Card key={request.id}>
                      <CardHeader>
                        <CardTitle>
                          Advice Request for {request.property?.title}
                        </CardTitle>
                        <CardDescription>
                          Status: {request.status} • Created:{" "}
                          {format(new Date(request.created_at), "MMM d, yyyy")}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
