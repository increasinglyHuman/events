"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function SignInButton() {
  const { signIn, isLoading, isIframe } = useAuth();

  if (isIframe) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={signIn}
      disabled={isLoading}
      className="gap-2 border-border/50 hover:border-accent hover:text-accent"
    >
      <LogIn className="h-4 w-4" />
      Sign In
    </Button>
  );
}
