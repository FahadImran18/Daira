"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function HeroSearch() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (type) params.append('type', type);
    if (purpose) params.append('purpose', purpose);
    if (minPrice) params.append('min', minPrice);
    if (maxPrice) params.append('max', maxPrice);
    
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger id="city">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="karachi">Karachi</SelectItem>
              <SelectItem value="lahore">Lahore</SelectItem>
              <SelectItem value="islamabad">Islamabad</SelectItem>
              <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
              <SelectItem value="faisalabad">Faisalabad</SelectItem>
              <SelectItem value="multan">Multan</SelectItem>
              <SelectItem value="peshawar">Peshawar</SelectItem>
              <SelectItem value="quetta">Quetta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="plot">Plot</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="farmhouse">Farmhouse</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger id="purpose">
              <SelectValue placeholder="Purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Button type="submit" className="w-full h-10 bg-emerald-600 hover:bg-emerald-700">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <Input
            type="number"
            placeholder="Min Price (PKR)"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-10"
          />
        </div>
        <div>
          <Input
            type="number"
            placeholder="Max Price (PKR)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-10"
          />
        </div>
      </div>
    </form>
  );
}