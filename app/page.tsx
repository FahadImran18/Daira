import Link from "next/link";
import { Button } from "@/components/ui/button";
import PropertyShowcase from "@/components/property/property-showcase";
import FeaturedProperties from "@/components/property/featured-properties";
import HeroSearch from "@/components/search/hero-search";
import CityGuides from "@/components/city/city-guides";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-gradient-to-r from-emerald-900 to-emerald-700 text-white">
        <div className="absolute inset-0 bg-black/30"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
            opacity: 0.6,
          }}
        ></div>
        <div className="relative container mx-auto h-full flex flex-col items-center justify-center px-4 z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">
            Discover Your Dream Property in Pakistan
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl text-center">
            AI-powered insights to help you make informed real estate decisions
          </p>
          <HeroSearch />
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Browse Properties
              </Button>
            </Link>
            <Link href="/auth/auth/register">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border-white"
              >
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 bg-emerald-50 rounded-lg">
            <p className="text-4xl font-bold text-emerald-700">10K+</p>
            <p className="text-gray-600">Properties</p>
          </div>
          <div className="p-6 bg-emerald-50 rounded-lg">
            <p className="text-4xl font-bold text-emerald-700">5K+</p>
            <p className="text-gray-600">Happy Customers</p>
          </div>
          <div className="p-6 bg-emerald-50 rounded-lg">
            <p className="text-4xl font-bold text-emerald-700">2K+</p>
            <p className="text-gray-600">Verified Realtors</p>
          </div>
          <div className="p-6 bg-emerald-50 rounded-lg">
            <p className="text-4xl font-bold text-emerald-700">20+</p>
            <p className="text-gray-600">Cities</p>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">
            Featured Properties
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            Handpicked properties with exceptional value
          </p>
          <FeaturedProperties />
        </div>
      </section>

      {/* Property Showcase */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">
            Explore by Property Type
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            Find the perfect property that suits your needs
          </p>
          <PropertyShowcase />
        </div>
      </section>

      {/* City Guides */}
      <section className="py-16 bg-emerald-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">City Guides</h2>
          <p className="text-gray-600 mb-8 text-center">
            Explore real estate opportunities in major Pakistani cities
          </p>
          <CityGuides />
        </div>
      </section>

      {/* AI Features */}
      <section className="py-16 bg-gradient-to-r from-emerald-900 to-emerald-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                AI-Powered Property Insights
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="mr-2 text-2xl">✓</span>
                  <span>
                    Accurate ROI calculations based on location and market
                    trends
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-2xl">✓</span>
                  <span>
                    Neighborhood analysis with safety, amenities, and
                    development potential
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-2xl">✓</span>
                  <span>
                    Price prediction with 95% accuracy based on historical data
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-2xl">✓</span>
                  <span>
                    Personalized property recommendations based on your
                    preferences
                  </span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/ai-insights">
                  <Button
                    size="lg"
                    className="bg-white text-emerald-800 hover:bg-gray-100"
                  >
                    Explore AI Insights
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/7135121/pexels-photo-7135121.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="AI Property Analysis"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect
            property with Zameen Insight
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/auth/register">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Get Started
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
