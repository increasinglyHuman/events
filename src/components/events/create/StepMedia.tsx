"use client";

import { cn } from "@/lib/utils";
import { Plus, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CreateEventFormData, StepErrors } from "./types";

interface StepMediaProps {
  data: CreateEventFormData;
  errors: StepErrors;
  onChange: <K extends keyof CreateEventFormData>(field: K, value: CreateEventFormData[K]) => void;
}

const INPUT_CLASS =
  "w-full rounded-lg border border-border/30 bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors";

function isImageUrl(url: string): boolean {
  if (!url.trim()) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function ImagePreview({ url }: { url: string }) {
  if (!isImageUrl(url)) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Preview"
      className="mt-2 h-32 w-auto rounded-lg border border-border/20 object-cover"
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}

export function StepMedia({ data, errors, onChange }: StepMediaProps) {
  function addGallerySlot() {
    if (data.gallery.length >= 6) return;
    onChange("gallery", [...data.gallery, ""]);
  }

  function updateGallery(index: number, value: string) {
    const next = [...data.gallery];
    next[index] = value;
    onChange("gallery", next);
  }

  function removeGallery(index: number) {
    onChange("gallery", data.gallery.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Media</h2>
        <p className="text-sm text-text-secondary">Add images to make your event stand out.</p>
      </div>

      {/* Cover Image */}
      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium text-text-primary mb-1.5">
          Cover Image
        </label>
        <input
          id="coverImage"
          type="url"
          placeholder="Paste image URL..."
          value={data.coverImage}
          onChange={(e) => onChange("coverImage", e.target.value)}
          className={INPUT_CLASS}
        />
        <span className="text-[11px] text-text-muted mt-1 block">
          Recommended: 16:9 aspect ratio, at least 800px wide
        </span>
        {data.coverImage && (
          <div className="mt-3 relative inline-block">
            <ImagePreview url={data.coverImage} />
            {isImageUrl(data.coverImage) && (
              <button
                type="button"
                onClick={() => onChange("coverImage", "")}
                className="absolute top-3 right-1 bg-bg-deep/80 rounded-full p-1 hover:bg-bg-deep"
              >
                <X className="h-3 w-3 text-text-secondary" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Gallery */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-text-primary">
            Gallery <span className="text-xs text-text-muted font-normal ml-1">({data.gallery.length}/6)</span>
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addGallerySlot}
            disabled={data.gallery.length >= 6}
            className="gap-1 text-xs text-text-secondary hover:text-text-primary"
          >
            <Plus className="h-3 w-3" />
            Add Image
          </Button>
        </div>

        {data.gallery.length === 0 ? (
          <button
            type="button"
            onClick={addGallerySlot}
            className="w-full border border-dashed border-border/30 rounded-lg py-8 flex flex-col items-center gap-2 text-text-muted hover:text-text-secondary hover:border-border/50 transition-colors"
          >
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs">Add gallery images</span>
          </button>
        ) : (
          <div className="space-y-3">
            {data.gallery.map((url, i) => (
              <div key={i}>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL..."
                    value={url}
                    onChange={(e) => updateGallery(i, e.target.value)}
                    className={cn(INPUT_CLASS, "flex-1")}
                  />
                  <button
                    type="button"
                    onClick={() => removeGallery(i)}
                    className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-border/20 text-text-muted hover:text-danger hover:border-danger/30 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <ImagePreview url={url} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
