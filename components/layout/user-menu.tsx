"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase/provider";
import { UserService } from "@/lib/services/user-service";
import { UserRole } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { LogOut, User, Home, Building, MessageSquare } from "lucide-react";

export default function UserMenu() {
  const { user, signOut } = useSupabase();
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userService = new UserService();

  useEffect(() => {
    const loadUserRole = async () => {
      if (user) {
        try {
          const role = await userService.getUserRole(user.id);
          setUserRole(role);
        } catch (error) {
          console.error("Error loading user role:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadUserRole();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getDashboardPath = () => {
    if (userRole === "realtor") return "/realtor/dashboard";
    if (userRole === "advisor") return "/advisor/dashboard";
    return "/dashboard";
  };

  if (!user || isLoading) {
    return (
      <Button variant="outline" onClick={() => router.push("/login")}>
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.user_metadata.avatar_url}
              alt={user.email || ""}
            />
            <AvatarFallback>
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground capitalize">
              {userRole || "User"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(getDashboardPath())}>
          <Home className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/properties")}>
          <Building className="mr-2 h-4 w-4" />
          <span>Properties</span>
        </DropdownMenuItem>
        {userRole === "customer" && (
          <DropdownMenuItem onClick={() => router.push("/chats")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>My Chats</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
