"use client";

import { cn } from "@/lib/utils";
import { Calendar, MapPin, Users, DollarSign, Image, Loader2, AlertCircle, Pencil } from "lucide-react";
import { CATEGORY_META, DRESS_CODES, type EventCategory } from "@/types/events";
import { Button } from "@/components/ui/button";
import type { CreateEventFormData, FormStep } from "./types";

interface StepReviewProps {
  data: CreateEventFormData;
  onSubmit: (status: "draft" | "published") => void;
  onGoToStep: (step: FormStep) => void;
  isSubmitting: boolean;
  submitError: string | null;
}

const MATURITY_COLORS: Record<string, string> = { G: "#4ecdc4", M: "#ffe66d", A: "#ff6b6b" };

function formatDate(dt: string): string {
  if (!dt) return "Not set";
  try {
    return new Date(dt).toLocaleString(undefined, {
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  } catch { return dt; }
}

function SectionHeader({ icon: Icon, label, step, onEdit }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  step: FormStep;
  onEdit: (step: FormStep) => void;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
        <Icon className="h-4 w-4 text-text-secondary" />
        {label}
      </div>
      <button
        type="button"
        onClick={() => onEdit(step)}
        className="flex items-center gap-1 text-[11px] text-accent/70 hover:text-accent transition-colors"
      >
        <Pencil className="h-3 w-3" /> Edit
      </button>
    </div>
  );
}

export function StepReview({ data, onSubmit, onGoToStep, isSubmitting, submitError }: StepReviewProps) {
  const catMeta = data.category ? CATEGORY_META[data.category as EventCategory] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Review & Publish</h2>
        <p className="text-sm text-text-secondary">Check everything looks good, then save or publish.</p>
      </div>

      {/* Basics */}
      <div className="border border-border/20 rounded-lg p-4">
        <SectionHeader icon={Users} label="Basics" step={1} onEdit={onGoToStep} />
        <h3 className="text-base font-semibold text-text-primary">{data.title || "Untitled Event"}</h3>
        {catMeta && (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border mt-1.5"
            style={{ color: catMeta.color, backgroundColor: `${catMeta.color}15`, borderColor: `${catMeta.color}44` }}
          >
            {catMeta.label}
          </span>
        )}
        <p className="text-sm text-text-secondary mt-2 line-clamp-3">{data.description || "No description"}</p>
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {data.tags.map((t) => (
              <span key={t} className="text-[10px] bg-surface-1 text-text-secondary rounded-full px-2 py-0.5">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Schedule */}
      <div className="border border-border/20 rounded-lg p-4">
        <SectionHeader icon={Calendar} label="Schedule" step={2} onEdit={onGoToStep} />
        <div className="text-sm text-text-primary space-y-1">
          <p><span className="text-text-secondary">Start:</span> {formatDate(data.startsAt)}</p>
          <p><span className="text-text-secondary">End:</span> {formatDate(data.endsAt)}</p>
          <p><span className="text-text-secondary">Timezone:</span> {data.timezone}</p>
          {data.recurrence && (
            <p className="text-accent/70 text-xs mt-1">
              Recurring: {data.recurrence.frequency}
              {data.recurrence.daysOfWeek?.length ? ` (${data.recurrence.daysOfWeek.map(d => ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][d]).join(", ")})` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="border border-border/20 rounded-lg p-4">
        <SectionHeader icon={MapPin} label="Location" step={3} onEdit={onGoToStep} />
        <div className="text-sm text-text-primary space-y-1">
          {data.venueId ? (
            <p>Venue selected</p>
          ) : data.location.regionName ? (
            <p>{data.location.regionName}
              {data.location.coordinates && (
                <span className="text-text-secondary">
                  {" "}({data.location.coordinates.x}, {data.location.coordinates.y}, {data.location.coordinates.z})
                </span>
              )}
            </p>
          ) : (
            <p className="text-text-muted">No location set</p>
          )}
          {data.externalUrl && (
            <p className="text-xs text-text-secondary truncate">External: {data.externalUrl}</p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="border border-border/20 rounded-lg p-4">
        <SectionHeader icon={DollarSign} label="Details" step={4} onEdit={onGoToStep} />
        <div className="flex flex-wrap gap-3 text-sm">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold border"
            style={{
              color: MATURITY_COLORS[data.maturity],
              backgroundColor: `${MATURITY_COLORS[data.maturity]}15`,
              borderColor: `${MATURITY_COLORS[data.maturity]}44`,
            }}
          >
            {data.maturity}
          </span>
          {data.dressCode !== "none" && (
            <span className="text-xs text-text-secondary">Dress: {data.dressCode}</span>
          )}
          <span className="text-xs text-text-secondary">
            Capacity: {data.capacity ?? "Unlimited"}
          </span>
          <span className="text-xs text-text-secondary">
            Fee: {data.entryFee ? `${data.entryFee} PQT` : "Free"}
          </span>
        </div>
      </div>

      {/* Media */}
      <div className="border border-border/20 rounded-lg p-4">
        <SectionHeader icon={Image} label="Media" step={5} onEdit={onGoToStep} />
        {data.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.coverImage}
            alt="Cover"
            className="h-24 rounded-lg object-cover border border-border/20"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <p className="text-sm text-text-muted">No cover image</p>
        )}
        {data.gallery.filter(Boolean).length > 0 && (
          <p className="text-xs text-text-secondary mt-2">
            +{data.gallery.filter(Boolean).length} gallery image{data.gallery.filter(Boolean).length > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Error */}
      {submitError && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{submitError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSubmit("draft")}
          disabled={isSubmitting}
          className="flex-1 border-border/30 text-text-secondary hover:text-text-primary"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={() => onSubmit("published")}
          disabled={isSubmitting}
          className="flex-1 bg-accent text-bg-deep hover:bg-accent/90 font-semibold"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Publish Now
        </Button>
      </div>
    </div>
  );
}
