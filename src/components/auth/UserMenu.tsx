"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export function UserMenu() {
  const { user, signOut, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="h-7 w-7 rounded-full border border-border/50"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-1 border border-border/50">
            <User className="h-4 w-4" />
          </div>
        )}
        <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={signOut}
        className="h-7 w-7 p-0 text-text-muted hover:text-text-primary"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
