"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/provider";
import { UserService } from "@/lib/services/user-service";
import { PropertyService } from "@/lib/services/property-service";
import { ChatService } from "@/lib/services/chat-service";
import { AdviceService } from "@/lib/services/advice-service";
import { UserRole, Property, Chat, AdviceRequest } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function RoleDashboard() {
  const { user } = useSupabase();
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [adviceRequests, setAdviceRequests] = useState<AdviceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userService = new UserService();
  const propertyService = new PropertyService();
  const chatService = new ChatService();
  const adviceService = new AdviceService();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadUserData = async () => {
      try {
        // Get user role
        const role = await userService.getUserRole(user.id);
        setUserRole(role);

        // Load data based on role
        if (role === "realtor") {
          // Load realtor's properties
          const realtorProperties =
            await propertyService.getPropertiesByRealtor(user.id);
          setProperties(realtorProperties);

          // Load realtor's chats
          const realtorChats = await chatService.getChats(user.id);
          setChats(realtorChats);
        } else if (role === "advisor") {
          // Load advisor's advice requests
          const advisorRequests = await adviceService.getAdviceRequests(
            user.id,
            "advisor"
          );
          setAdviceRequests(advisorRequests);
        } else {
          // Load customer's chats and advice requests
          const customerChats = await chatService.getChats(user.id);
          setChats(customerChats);

          const customerRequests = await adviceService.getAdviceRequests(
            user.id,
            "customer"
          );
          setAdviceRequests(customerRequests);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, router]);

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
      <h1 className="text-3xl font-bold mb-6">
        {userRole === "realtor"
          ? "Realtor Dashboard"
          : userRole === "advisor"
          ? "Advisor Dashboard"
          : "Customer Dashboard"}
      </h1>

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
              <TabsTrigger value="properties">My Properties</TabsTrigger>
              <TabsTrigger value="chats">Property Inquiries</TabsTrigger>
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
                  <Card>
                    <CardHeader>
                      <CardTitle>No Properties</CardTitle>
                      <CardDescription>
                        You haven't added any properties yet.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => router.push("/realtor/properties/new")}
                      >
                        Add Your First Property
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  properties.map((property) => (
                    <Card key={property.id}>
                      <CardHeader>
                        <CardTitle>{property.title}</CardTitle>
                        <CardDescription>
                          {property.city}, {property.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold">
                              ${property.price.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {property.bedrooms} beds • {property.bathrooms}{" "}
                              baths
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() =>
                              router.push(`/realtor/properties/${property.id}`)
                            }
                          >
                            Manage
                          </Button>
                        </div>
                      </CardContent>
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
                    <Card key={chat.id}>
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
                    <CardContent>
                      <div className="mb-4">
                        <p className="font-medium">Question:</p>
                        <p className="text-muted-foreground">
                          {request.question}
                        </p>
                      </div>
                      {request.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() =>
                              router.push(`/advisor/advice/${request.id}`)
                            }
                          >
                            Respond
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              adviceService.rejectAdviceRequest(
                                request.id,
                                user!.id
                              )
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {request.status === "completed" && (
                        <div>
                          <p className="font-medium">Your Response:</p>
                          <p className="text-muted-foreground">
                            {request.response}
                          </p>
                        </div>
                      )}
                    </CardContent>
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
                        You haven't started any property chats yet.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => router.push("/properties")}>
                        Browse Properties
                      </Button>
                    </CardContent>
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
                          Continue Chat
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
                    <CardContent>
                      <Button onClick={() => router.push("/properties")}>
                        Browse Properties
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  adviceRequests.map((request) => (
                    <Card key={request.id}>
                      <CardHeader>
                        <CardTitle>
                          Advice Request for {request.property?.title}
                        </CardTitle>
                        <CardDescription>
                          Advisor: {request.advisor?.email} • Status:{" "}
                          {request.status} • Created:{" "}
                          {format(new Date(request.created_at), "MMM d, yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <p className="font-medium">Your Question:</p>
                          <p className="text-muted-foreground">
                            {request.question}
                          </p>
                        </div>
                        {request.status === "completed" && (
                          <div>
                            <p className="font-medium">Advisor's Response:</p>
                            <p className="text-muted-foreground">
                              {request.response}
                            </p>
                          </div>
                        )}
                      </CardContent>
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
