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
  UserProfile,
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
  bedrooms: z.coerce.number().min(0).default(0),
  bathrooms: z.coerce.number().min(0).default(0),
  area: z.string().min(1, "Area is required"),
  images: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

export default function RoleDashboard() {
  const { user } = useSupabase();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [adviceRequests, setAdviceRequests] = useState<AdviceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [newProperty, setNewProperty] = useState<
    Omit<Property, "id" | "created_at" | "updated_at" | "realtor_id" | "status">
  >({
    title: "",
    description: "",
    price: "",
    location: "",
    city: "",
    property_type: "house",
    bedrooms: 0,
    bathrooms: 0,
    area: "",
    images: [],
    features: [],
    is_featured: false,
  });

  const userService = new UserService();
  const propertyService = new PropertyService();
  const chatService = new ChatService();
  const adviceService = new AdviceService();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      location: "",
      city: "",
      property_type: "house",
      bedrooms: 0,
      bathrooms: 0,
      area: "",
      images: [],
      features: [],
      is_featured: false,
    },
  });

  const loadUserProfile = async () => {
    if (!user) {
      console.debug("No user found, redirecting to login");
      router.push("/login");
      return;
    }

    try {
      console.debug(`Loading user profile for user ${user.id}`);
      const profile = await userService.getUserProfile(user.id);
      console.debug(`Loaded user profile:`, profile);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error("Error loading user profile:", error);
      setError("Failed to load user profile. Please try refreshing the page.");
      return null;
    }
  };

  const loadUserData = async () => {
    if (!user) {
      console.debug("No user found, redirecting to login");
      router.push("/login");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First load the user profile to get the correct role
      const profile = await loadUserProfile();
      if (!profile) {
        throw new Error("Failed to load user profile");
      }

      console.debug(
        `Loading dashboard data for user ${user.id} with role ${profile.role}`
      );

      if (profile.role === "realtor") {
        console.debug("Loading realtor data...");
        const [propertiesData, chatsData, adviceData] = await Promise.all([
          propertyService
            .getPropertiesByRealtor(user.id)
            .catch((err: Error) => {
              console.error("Failed to load realtor properties:", err);
              throw new Error("Failed to load properties");
            }),
          chatService.getChatsByRealtor(user.id).catch((err: Error) => {
            console.error("Failed to load realtor chats:", err);
            throw new Error("Failed to load chats");
          }),
          adviceService
            .getAdviceRequests(user.id, "advisor")
            .catch((err: Error) => {
              console.error("Failed to load realtor advice requests:", err);
              throw new Error("Failed to load advice requests");
            }),
        ]);

        console.debug(
          `Loaded ${propertiesData.length} properties, ${chatsData.length} chats, ${adviceData.length} advice requests`
        );

        setProperties(propertiesData);
        setChats(chatsData);
        setAdviceRequests(adviceData as unknown as AdviceRequest[]);
      } else if (profile.role === "customer") {
        console.debug("Loading customer data...");
        const [propertiesData, chatsData, adviceData] = await Promise.all([
          propertyService
            .searchProperties({ status: "active" })
            .catch((err: Error) => {
              console.error("Failed to load customer properties:", err);
              throw new Error("Failed to load properties");
            }),
          chatService.getChatsByUser(user.id).catch((err: Error) => {
            console.error("Failed to load customer chats:", err);
            throw new Error("Failed to load chats");
          }),
          adviceService
            .getAdviceRequests(user.id, "customer")
            .catch((err: Error) => {
              console.error("Failed to load customer advice requests:", err);
              throw new Error("Failed to load advice requests");
            }),
        ]);

        console.debug(
          `Loaded ${propertiesData.length} properties, ${chatsData.length} chats, ${adviceData.length} advice requests`
        );

        setProperties(propertiesData);
        setChats(chatsData);
        setAdviceRequests(adviceData as unknown as AdviceRequest[]);
      } else {
        throw new Error(`Invalid user role: ${profile.role}`);
      }
    } catch (error) {
      console.error("Error in loadUserData:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load dashboard data"
      );
      toast.error(
        "Failed to load dashboard data. Please try refreshing the page."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.debug("Dashboard component mounted");
    loadUserData();
  }, [user]);

  const handlePropertyUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsUploading(true);
      const propertyData: Omit<Property, "id" | "created_at" | "updated_at"> = {
        title: newProperty.title,
        description: newProperty.description,
        price: newProperty.price,
        location: newProperty.location,
        city: newProperty.city,
        property_type: newProperty.property_type,
        bedrooms: Number(newProperty.bedrooms) || 0,
        bathrooms: Number(newProperty.bathrooms) || 0,
        area: newProperty.area,
        realtor_id: user.id,
        status: "active" as PropertyStatus,
        images: [],
        features: [],
        is_featured: false,
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
        bedrooms: 0,
        bathrooms: 0,
        area: "",
        images: [],
        features: [],
        is_featured: false,
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error uploading property:", error);
      toast.error("Failed to upload property. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!user) return;

    try {
      const propertyData: Omit<Property, "id" | "created_at" | "updated_at"> = {
        title: data.title,
        description: data.description,
        price: data.price,
        location: data.location,
        city: data.city,
        property_type: data.property_type,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        images: data.images,
        features: data.features,
        is_featured: data.is_featured,
        status: "active" as PropertyStatus,
        realtor_id: user.id,
      };

      if (editingProperty) {
        await propertyService.updateProperty(editingProperty.id, propertyData);
        toast.success("Property updated successfully");
      } else {
        await propertyService.createProperty(propertyData);
        toast.success("Property created successfully");
      }

      const updatedProperties = await propertyService.getPropertiesByRealtor(
        user.id
      );
      setProperties(updatedProperties);
      setShowPropertyForm(false);
      setEditingProperty(null);
      form.reset();
    } catch (error) {
      console.error("Error saving property:", error);
      toast.error("Failed to save property. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <Button
          onClick={() => {
            setError(null);
            loadUserData();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
        <div className="text-muted-foreground">Loading dashboard data...</div>
      </div>
    );
  }

  if (!userProfile) {
    return <div>User profile not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="text-xs text-muted-foreground mb-4">
        Role: {userProfile?.role || "Unknown"} | User ID:{" "}
        {user?.id || "Not logged in"}
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {userProfile.role === "realtor"
            ? "Realtor Dashboard"
            : userProfile.role === "advisor"
            ? "Advisor Dashboard"
            : "Customer Dashboard"}
        </h1>

        {userProfile.role === "realtor" && (
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
          userProfile.role === "realtor"
            ? "properties"
            : userProfile.role === "advisor"
            ? "advice"
            : "chats"
        }
      >
        <TabsList className="mb-6">
          {userProfile.role === "realtor" && (
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
          {userProfile.role === "advisor" && (
            <TabsTrigger value="advice">Advice Requests</TabsTrigger>
          )}
          {userProfile.role === "customer" && (
            <>
              <TabsTrigger value="chats">My Chats</TabsTrigger>
              <TabsTrigger value="advice">My Advice Requests</TabsTrigger>
            </>
          )}
        </TabsList>

        {userProfile.role === "realtor" && (
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

        {userProfile.role === "advisor" && (
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

        {userProfile.role === "customer" && (
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
