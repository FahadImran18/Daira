"use client";

import { useEffect, useState } from "react";
import PropertyShowcase from "@/components/property/property-showcase";
import FeaturedProperties from "@/components/property/featured-properties";
import PropertySearch from "@/components/search/property-search";
import { useUser } from "@/hooks/use-user";
import { PropertyService } from "@/lib/services/property-service";
import { Property } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const propertyService = new PropertyService();

export default function PropertiesPage() {
  const { user, loading: isUserLoading } = useUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        setIsLoading(true);
        if (user?.role === "realtor") {
          const realtorProperties =
            await propertyService.getPropertiesByRealtor(user.id);
          setProperties(realtorProperties);
        } else {
          // For regular users, we'll show all properties
          const allProperties = await propertyService.searchProperties({});
          setProperties(allProperties);
        }
      } catch (error) {
        console.error("Error loading properties:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!isUserLoading) {
      loadProperties();
    }
  }, [user, isUserLoading]);

  if (isUserLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid gap-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {user?.role === "realtor" ? "Your Properties" : "Our Properties"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {user?.role === "realtor"
              ? "Manage and track your property listings"
              : "Discover our carefully curated selection of properties"}
          </p>
        </div>

        <PropertySearch />

        <div className="grid gap-8">
          <PropertyShowcase />
          <FeaturedProperties />
        </div>
      </div>
    </div>
  );
}
