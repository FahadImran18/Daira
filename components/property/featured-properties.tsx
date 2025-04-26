"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Maximize, ArrowRight } from 'lucide-react';

const featuredProperties = [
  {
    id: '1',
    title: 'Modern Apartment in Bahria Town',
    location: 'Bahria Town, Karachi',
    price: '2.45 Crore',
    type: 'Apartment',
    purpose: 'Sale',
    bedrooms: 3,
    bathrooms: 2,
    area: '1,250 sq. ft.',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isVerified: true,
    isFeatured: true,
    isHot: false,
  },
  {
    id: '2',
    title: 'Luxury Villa in DHA Phase 6',
    location: 'DHA Phase 6, Lahore',
    price: '5.75 Crore',
    type: 'House',
    purpose: 'Sale',
    bedrooms: 5,
    bathrooms: 6,
    area: '4,500 sq. ft.',
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isVerified: true,
    isFeatured: true,
    isHot: true,
  },
  {
    id: '3',
    title: 'Commercial Plot in Gulberg',
    location: 'Gulberg III, Lahore',
    price: '3.90 Crore',
    type: 'Plot',
    purpose: 'Sale',
    bedrooms: 0,
    bathrooms: 0,
    area: '10 Marla',
    image: 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isVerified: true,
    isFeatured: true,
    isHot: false,
  },
  {
    id: '4',
    title: 'Renovated House in F-7',
    location: 'F-7, Islamabad',
    price: '1.8 Lakh/month',
    type: 'House',
    purpose: 'Rent',
    bedrooms: 4,
    bathrooms: 3,
    area: '2,800 sq. ft.',
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isVerified: true,
    isFeatured: true,
    isHot: false,
  },
];

export default function FeaturedProperties() {
  const [favorited, setFavorited] = useState<{ [key: string]: boolean }>({});

  const toggleFavorite = (id: string) => {
    setFavorited(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden group transition-all duration-300 hover:shadow-lg border-transparent hover:border-emerald-600/20">
            <div className="relative">
              <Link href={`/properties/${property.id}`}>
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </Link>
              
              <div className="absolute top-2 left-2 flex gap-2">
                {property.isVerified && (
                  <Badge className="bg-emerald-600">Verified</Badge>
                )}
                {property.isHot && (
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
                <Badge className="bg-white text-gray-800 font-medium">{property.type}</Badge>
                <Badge className={property.purpose === 'Sale' ? 'bg-blue-500' : 'bg-amber-500'}>
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
                PKR {property.price}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 pt-2 pb-0">
              <div className="flex justify-between text-sm">
                {property.bedrooms > 0 && (
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{property.bedrooms} Beds</span>
                  </div>
                )}
                
                {property.bathrooms > 0 && (
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{property.bathrooms} Baths</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Maximize className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{property.area}</span>
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