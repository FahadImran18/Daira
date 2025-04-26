import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const cities = [
  {
    name: 'Karachi',
    image: 'https://images.pexels.com/photos/3761209/pexels-photo-3761209.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    propertyCount: '5,280+',
    description: 'Pakistan\'s largest city and economic hub',
    slug: 'karachi'
  },
  {
    name: 'Lahore',
    image: 'https://images.pexels.com/photos/1485894/pexels-photo-1485894.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    propertyCount: '4,750+',
    description: 'Cultural heart with rich heritage',
    slug: 'lahore'
  },
  {
    name: 'Islamabad',
    image: 'https://images.pexels.com/photos/2846216/pexels-photo-2846216.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    propertyCount: '3,120+',
    description: 'Modern capital with planned development',
    slug: 'islamabad'
  },
  {
    name: 'Rawalpindi',
    image: 'https://images.pexels.com/photos/4151484/pexels-photo-4151484.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    propertyCount: '2,840+',
    description: 'Historic city with military significance',
    slug: 'rawalpindi'
  }
];

export default function CityGuides() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cities.map((city, index) => (
        <Link href={`/cities/${city.slug}`} key={index}>
          <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg group border-transparent hover:border-emerald-600/20">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={city.image}
                alt={city.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-xl">{city.name}</h3>
                <span className="text-sm text-emerald-600">{city.propertyCount}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{city.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}