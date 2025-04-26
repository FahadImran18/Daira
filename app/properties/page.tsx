import { Metadata } from "next";
import PropertyShowcase from "@/components/property/property-showcase";
import FeaturedProperties from "@/components/property/featured-properties";
import PropertySearch from "@/components/search/property-search";

export const metadata: Metadata = {
  title: "Properties | Daira",
  description: "Browse our collection of properties",
};

export default function PropertiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Our Properties</h1>
          <p className="text-muted-foreground text-lg">
            Discover our carefully curated selection of properties
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
