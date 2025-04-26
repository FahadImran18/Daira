"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User,
  Home,
  MessageSquare,
  Heart,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { useSupabase } from "@/lib/supabase/provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type UserMenuProps = {
  role: string | null;
};

export default function UserMenu({ role }: UserMenuProps) {
  const { user, signOut } = useSupabase();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    // Close the dropdown first
    setIsOpen(false);

    // Set signing out state to prevent multiple clicks
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await signOut();
      // The router.push is handled in the signOut function in the provider
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const getDashboardLink = () => {
    if (!role) return "/dashboard";

    switch (role.toLowerCase()) {
      case "customer":
        return "/dashboard/customer";
      case "realtor":
        return "/dashboard/realtor";
      case "advisor":
        return "/dashboard/advisor";
      case "admin":
        return "/dashboard/admin";
      default:
        return "/dashboard";
    }
  };

  const dashboardLink = getDashboardLink();
  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.user_metadata?.avatar_url}
              alt={user?.email || ""}
            />
            <AvatarFallback className="bg-emerald-100 text-emerald-800">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {role || "User"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              href={getDashboardLink()}
              className="flex w-full cursor-pointer"
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>

          {role?.toLowerCase() === "customer" && (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/customer/favorites"
                  className="flex w-full cursor-pointer"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Favorites</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/customer/messages"
                  className="flex w-full cursor-pointer"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Messages</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {role?.toLowerCase() === "realtor" && (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/realtor/properties"
                  className="flex w-full cursor-pointer"
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>My Properties</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/realtor/messages"
                  className="flex w-full cursor-pointer"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Client Messages</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {role?.toLowerCase() === "advisor" && (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/advisor/clients"
                  className="flex w-full cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>My Clients</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/advisor/messages"
                  className="flex w-full cursor-pointer"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Messages</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {role?.toLowerCase() === "admin" && (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/admin/properties"
                  className="flex w-full cursor-pointer"
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Property Management</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/admin/users"
                  className="flex w-full cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>User Management</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex w-full cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex w-full cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer"
          disabled={isSigningOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isSigningOut ? "Signing out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
