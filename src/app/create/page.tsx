"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { EventsNav } from "@/components/events/EventsNav";
import { CreateEventForm } from "@/components/events/CreateEventForm";

export default function CreateEventPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [navQuery, setNavQuery] = useState("");

  function handleSearch(q: string) {
    if (q) router.push(`/?q=${encodeURIComponent(q)}`);
    else setNavQuery("");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <EventsNav query={navQuery} onQueryChange={handleSearch} />

      <main className="flex-1 max-w-[800px] mx-auto w-full px-4 py-8">
        {isLoading ? (
          /* Loading skeleton */
          <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-surface-1 rounded-lg w-48" />
            <div className="h-4 bg-surface-1 rounded w-72" />
            <div className="h-40 bg-surface-1 rounded-lg" />
            <div className="h-10 bg-surface-1 rounded-lg w-32" />
          </div>
        ) : !isAuthenticated ? (
          /* Auth gate */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-accent/10 p-4 mb-6">
              <LogIn className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Sign in to List Your Event
            </h1>
            <p className="text-sm text-text-secondary max-w-md mb-8">
              Create events, manage RSVPs, and connect with attendees in the poqpoq community.
              Sign in with your Google account to get started.
            </p>
            <SignInButton />
          </div>
        ) : (
          <CreateEventForm />
        )}
      </main>
    </div>
  );
}
