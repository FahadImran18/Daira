"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Maximize, ArrowRight } from 'lucide-react';
import { useProperties } from '@/lib/supabase/hooks';
import { Property } from '@/lib/types';

export default function FeaturedProperties() {
  const [favorited, setFavorited] = useState<{ [key: string]: boolean }>({});
  const { properties, loading, error } = useProperties({ featured: true }) as { properties: Property[], loading: boolean, error: any };

  const toggleFavorite = (id: string) => {
    setFavorited(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load properties. Please try again later.</p>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No featured properties available at the moment.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden group transition-all duration-300 hover:shadow-lg border-transparent hover:border-emerald-600/20">
            <div className="relative">
              <Link href={`/properties/${property.id}`}>
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={property.images?.[0]?.url || 'https://via.placeholder.com/400x300'}
                    alt={property.title}
                    className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </Link>
              
              <div className="absolute top-2 left-2 flex gap-2">
                {property.status === 'approved' && (
                  <Badge className="bg-emerald-600">Verified</Badge>
                )}
                {property.is_hot && (
                  <Badge className="bg-red-500">Hot</Badge>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className={`absolute top-2 right-2 rounded-full bg-white/80 hover:bg-white ${
                  favorited[property.id] ? 'text-red-500' : 'text-gray-500'
                }`}
                onClick={() => toggleFavorite(property.id)}
              >
                <Heart className={`h-5 w-5 ${favorited[property.id] ? 'fill-current' : ''}`} />
              </Button>
              
              <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                <Badge className="bg-white text-gray-800 font-medium capitalize">{property.property_type}</Badge>
                <Badge className={property.purpose === 'sale' ? 'bg-blue-500' : 'bg-amber-500'}>
                  For {property.purpose}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}
              </div>
              <CardTitle className="text-lg text-left">{property.title}</CardTitle>
              <CardDescription className="text-lg font-bold text-emerald-600 dark:text-emerald-500">
                PKR {property.price.toLocaleString()}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 pt-2 pb-0">
              <div className="flex justify-between text-sm">
                {property.bedrooms && property.bedrooms > 0 && (
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{property.bedrooms} Beds</span>
                  </div>
                )}
                
                {property.bathrooms && property.bathrooms > 0 && (
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{property.bathrooms} Baths</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Maximize className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{property.area_size} {property.area_unit}</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-4">
              <Link href={`/properties/${property.id}`} className="w-full">
                <Button variant="ghost" className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 justify-between group">
                  <span>View Details</span>
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-10 text-center">
        <Link href="/properties">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            View All Properties
          </Button>
        </Link>
      </div>
    </div>
  );
}