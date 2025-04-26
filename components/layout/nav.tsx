"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/lib/supabase/provider";
import UserMenu from "@/components/auth/user-menu";
import { ModeToggle } from "@/components/mode-toggle";

export default function Nav() {
  const pathname = usePathname();
  const { user, userRole } = useSupabase();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Daira
            </Link>

            <div className="hidden md:flex space-x-6">
              <Link
                href="/properties"
                className={`text-sm transition-colors hover:text-primary ${
                  isActive("/properties")
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                Properties
              </Link>

              <Link
                href="/about"
                className={`text-sm transition-colors hover:text-primary ${
                  isActive("/about")
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                About
              </Link>

              <Link
                href="/contact"
                className={`text-sm transition-colors hover:text-primary ${
                  isActive("/contact")
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ModeToggle />

            {user ? (
              <UserMenu role={userRole} />
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
