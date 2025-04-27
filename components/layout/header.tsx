"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/lib/supabase/provider";
import { Building, Home, Menu, X } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import UserMenu from "@/components/auth/user-menu";

export default function Header() {
  const { user, userRole } = useSupabase();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage = pathname === "/";
  const isTransparent = isHomePage && !isScrolled && !isMobileMenuOpen;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isTransparent
          ? "bg-transparent text-white"
          : "bg-background/95 backdrop-blur-sm border-b shadow-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-emerald-600" />
              <span className="font-bold text-xl">Zameen Insight</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/properties" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Properties
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <li className="row-span-3">
                        <Link
                          href="/cities"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            Popular Cities
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Explore properties in major Pakistani cities
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/guides"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            Buying Guides
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Essential information for property buyers
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/developments"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            New Developments
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Upcoming and recently completed projects
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/market-trends"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            Market Trends
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Real estate market analysis and forecasts
                          </p>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/ai-insights" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      AI Insights
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/contact" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Contact
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center space-x-4">
              <ModeToggle />
              {user ? (
                <UserMenu role={userRole} />
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button
                      variant={isTransparent ? "outline" : "ghost"}
                      className={
                        isTransparent ? "border-white hover:bg-white/20" : ""
                      }
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button
                      className={
                        isTransparent
                          ? "bg-white text-emerald-800 hover:bg-white/90"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }
                    >
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <ModeToggle />
            <Button
              variant="ghost"
              className="p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background p-4 border-b shadow-lg">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/properties"
              className="px-4 py-2 rounded-md hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Properties
            </Link>
            <Link
              href="/cities"
              className="px-4 py-2 rounded-md hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cities
            </Link>
            <Link
              href="/guides"
              className="px-4 py-2 rounded-md hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Buying Guides
            </Link>
            <Link
              href="/ai-insights"
              className="px-4 py-2 rounded-md hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              AI Insights
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-md hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="pt-4 border-t">
              {user ? (
                <Link
                  href={`/dashboard/${userRole?.toLowerCase()}`}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link
                    href="/auth/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
