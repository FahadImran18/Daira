"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function PropertySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [purpose, setPurpose] = useState(searchParams.get("purpose") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [bathrooms, setBathrooms] = useState(
    searchParams.get("bathrooms") || ""
  );
  const [area, setArea] = useState(searchParams.get("area") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (type) params.append("type", type);
    if (purpose) params.append("purpose", purpose);
    if (minPrice) params.append("min", minPrice);
    if (maxPrice) params.append("max", maxPrice);
    if (bedrooms) params.append("bedrooms", bedrooms);
    if (bathrooms) params.append("bathrooms", bathrooms);
    if (area) params.append("area", area);

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSearch}
        className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
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

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="number"
                        placeholder="Min Price (PKR)"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Max Price (PKR)"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Select value={bedrooms} onValueChange={setBedrooms}>
                        <SelectTrigger>
                          <SelectValue placeholder="Bedrooms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1+</SelectItem>
                          <SelectItem value="2">2+</SelectItem>
                          <SelectItem value="3">3+</SelectItem>
                          <SelectItem value="4">4+</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select value={bathrooms} onValueChange={setBathrooms}>
                        <SelectTrigger>
                          <SelectValue placeholder="Bathrooms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1+</SelectItem>
                          <SelectItem value="2">2+</SelectItem>
                          <SelectItem value="3">3+</SelectItem>
                          <SelectItem value="4">4+</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Input
                      type="text"
                      placeholder="Area (sq. ft.)"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </form>
    </div>
  );
}
