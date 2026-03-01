"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Search, X, Plus, CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { Button } from "@/components/ui/button";

interface EventsNavProps {
  query: string;
  onQueryChange: (q: string) => void;
  className?: string;
}

export function EventsNav({ query, onQueryChange, className }: EventsNavProps) {
  const { isAuthenticated } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
        if (query) onQueryChange("");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [query, onQueryChange]);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b border-border/20 bg-bg-deep/95 backdrop-blur-md",
        className,
      )}
    >
      <div className="flex items-center gap-4 max-w-[1400px] mx-auto px-4 py-2.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/events/poqpoq-fox.svg"
            alt="poqpoq"
            className="h-7 w-7 transition-transform group-hover:scale-110"
          />
          <span className="text-sm font-semibold text-text-primary">Events</span>
        </Link>

        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search events, venues, organizers..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full rounded-lg border border-border/30 bg-surface-0 pl-9 pr-10 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
          />
          {query ? (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded border border-border/30 bg-surface-0 px-1.5 py-0.5 text-[10px] text-text-muted">
              <span className="text-[9px]">⌘</span>K
            </kbd>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/explore">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-text-secondary hover:text-text-primary hidden sm:flex">
              <CalendarDays className="h-3.5 w-3.5" />
              Explore
            </Button>
          </Link>

          <Button
            size="sm"
            className="gap-1.5 text-xs bg-accent text-bg-deep hover:bg-accent/90 font-semibold"
            onClick={() => {
              // TODO: route to event creation flow
              alert("Event creation coming soon!");
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">List Event</span>
          </Button>

          {isAuthenticated ? <UserMenu /> : <SignInButton />}
        </div>
      </div>
    </nav>
  );
}
