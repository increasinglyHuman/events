"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Venue } from "@/types/venues";
import type { CreateEventFormData, StepErrors } from "./types";

interface StepLocationProps {
  data: CreateEventFormData;
  errors: StepErrors;
  venues: Venue[];
  onChange: <K extends keyof CreateEventFormData>(field: K, value: CreateEventFormData[K]) => void;
}

const INPUT_CLASS =
  "w-full rounded-lg border border-border/30 bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors";

type LocationMode = "venue" | "custom";

export function StepLocation({ data, errors, venues, onChange }: StepLocationProps) {
  const [mode, setMode] = useState<LocationMode>(data.venueId ? "venue" : "custom");
  const [venueSearch, setVenueSearch] = useState("");

  const filteredVenues = venues.filter((v) =>
    v.name.toLowerCase().includes(venueSearch.toLowerCase()) ||
    v.location?.regionName?.toLowerCase().includes(venueSearch.toLowerCase()),
  );

  function selectVenue(venue: Venue) {
    onChange("venueId", venue.id);
    onChange("location", {
      regionName: venue.location?.regionName ?? "",
      coordinates: venue.location?.coordinates ?? null,
      teleportUrl: venue.location?.teleportUrl ?? "",
    });
  }

  function clearVenue() {
    onChange("venueId", null);
    onChange("location", { regionName: "", coordinates: null, teleportUrl: "" });
  }

  function updateCoord(axis: "x" | "y" | "z", value: string) {
    const num = parseFloat(value) || 0;
    const coords = data.location.coordinates ?? { x: 0, y: 0, z: 0 };
    onChange("location", {
      ...data.location,
      coordinates: { ...coords, [axis]: num },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Location</h2>
        <p className="text-sm text-text-secondary">Where is your event happening?</p>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => { setMode("venue"); }}
          className={cn(
            "h-7 px-2.5 text-[11px]",
            mode === "venue" ? "bg-accent/15 text-accent" : "text-text-secondary hover:text-text-primary",
          )}
        >
          Select Venue
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => { setMode("custom"); clearVenue(); }}
          className={cn(
            "h-7 px-2.5 text-[11px]",
            mode === "custom" ? "bg-accent/15 text-accent" : "text-text-secondary hover:text-text-primary",
          )}
        >
          Custom Location
        </Button>
      </div>

      {mode === "venue" ? (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search venues..."
              value={venueSearch}
              onChange={(e) => setVenueSearch(e.target.value)}
              className={cn(INPUT_CLASS, "pl-9")}
            />
          </div>

          {/* Venue grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto scrollbar-none">
            {filteredVenues.map((venue) => {
              const selected = data.venueId === venue.id;
              return (
                <button
                  key={venue.id}
                  type="button"
                  onClick={() => selected ? clearVenue() : selectVenue(venue)}
                  className={cn(
                    "text-left rounded-lg border p-3 transition-all",
                    selected
                      ? "border-accent/40 bg-accent/5"
                      : "border-border/20 bg-surface-0 hover:border-border/40 hover:bg-surface-1/50",
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {venue.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={venue.coverImage}
                        alt=""
                        className="h-10 w-10 rounded-md object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-surface-1 flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-text-muted" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        selected ? "text-accent" : "text-text-primary",
                      )}>
                        {venue.name}
                      </p>
                      <p className="text-[11px] text-text-secondary truncate">
                        {venue.location?.regionName || "No region"}
                        {venue.capacity ? ` · ${venue.capacity} cap` : ""}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredVenues.length === 0 && (
              <p className="text-sm text-text-muted col-span-2 py-4 text-center">
                No venues found
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Region name */}
          <div>
            <label htmlFor="regionName" className="block text-sm font-medium text-text-primary mb-1.5">
              Region Name
            </label>
            <input
              id="regionName"
              type="text"
              placeholder="e.g. Crescendo Isle"
              value={data.location.regionName}
              onChange={(e) => onChange("location", { ...data.location, regionName: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>

          {/* Coordinates */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Coordinates
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["x", "y", "z"] as const).map((axis) => (
                <div key={axis}>
                  <span className="text-[10px] text-text-muted uppercase mb-1 block">{axis}</span>
                  <input
                    type="number"
                    value={data.location.coordinates?.[axis] ?? ""}
                    onChange={(e) => updateCoord(axis, e.target.value)}
                    placeholder="0"
                    className={INPUT_CLASS}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Teleport URL */}
          <div>
            <label htmlFor="teleportUrl" className="block text-sm font-medium text-text-primary mb-1.5">
              Teleport URL
            </label>
            <input
              id="teleportUrl"
              type="text"
              placeholder="poqpoq://region/x/y/z"
              value={data.location.teleportUrl}
              onChange={(e) => onChange("location", { ...data.location, teleportUrl: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>
        </div>
      )}

      {/* External URL — always visible */}
      <div>
        <label htmlFor="externalUrl" className="block text-sm font-medium text-text-primary mb-1.5">
          External URL <span className="text-xs text-text-muted font-normal ml-1">(optional)</span>
        </label>
        <input
          id="externalUrl"
          type="url"
          placeholder="https://..."
          value={data.externalUrl}
          onChange={(e) => onChange("externalUrl", e.target.value)}
          className={INPUT_CLASS}
        />
      </div>
    </div>
  );
}
