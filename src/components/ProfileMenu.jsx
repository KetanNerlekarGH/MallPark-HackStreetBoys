import React from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const initial = (user?.email || user?.full_name || "U").charAt(0).toUpperCase();

  const handleLogout = () => {
    logout(false);
    window.location.href = "/login";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="ml-1 flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border hover:bg-muted transition-colors"
          aria-label="Profile"
        >
          <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
            {initial}
          </span>
          <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
            {user?.email || "Account"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl">
        <DropdownMenuLabel className="truncate">{user?.email || "Signed in"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}