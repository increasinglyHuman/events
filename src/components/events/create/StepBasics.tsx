"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { EVENT_CATEGORIES, CATEGORY_META, type EventCategory } from "@/types/events";
import type { CreateEventFormData, StepErrors } from "./types";

interface StepBasicsProps {
  data: CreateEventFormData;
  errors: StepErrors;
  onChange: <K extends keyof CreateEventFormData>(field: K, value: CreateEventFormData[K]) => void;
}

const INPUT_CLASS =
  "w-full rounded-lg border border-border/30 bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors";

const ERROR_CLASS =
  "border-danger/60 focus:border-danger/80 focus:ring-danger/20";

export function StepBasics({ data, errors, onChange }: StepBasicsProps) {
  const [tagInput, setTagInput] = useState("");

  function addTag(value: string) {
    const tag = value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!tag || data.tags.includes(tag) || data.tags.length >= 5) return;
    onChange("tags", [...data.tags, tag]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    onChange("tags", data.tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput && data.tags.length > 0) {
      removeTag(data.tags[data.tags.length - 1]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Event Basics</h2>
        <p className="text-sm text-text-secondary">Give your event a name, description, and category.</p>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-1.5">
          Title <span className="text-danger">*</span>
        </label>
        <input
          id="title"
          type="text"
          maxLength={200}
          placeholder="e.g. Neon Nights: Live DJ Set"
          value={data.title}
          onChange={(e) => onChange("title", e.target.value)}
          className={cn(INPUT_CLASS, errors.title && ERROR_CLASS)}
        />
        <div className="flex justify-between mt-1">
          {errors.title ? (
            <span className="text-xs text-danger">{errors.title}</span>
          ) : <span />}
          <span className="text-xs text-text-muted">{data.title.length}/200</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1.5">
          Description <span className="text-danger">*</span>
        </label>
        <textarea
          id="description"
          rows={5}
          placeholder="Tell people what your event is about..."
          value={data.description}
          onChange={(e) => onChange("description", e.target.value)}
          className={cn(INPUT_CLASS, "resize-y min-h-[100px]", errors.description && ERROR_CLASS)}
        />
        {errors.description && (
          <span className="text-xs text-danger mt-1 block">{errors.description}</span>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Category <span className="text-danger">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const active = data.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onChange("category", cat as EventCategory)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all border",
                  active
                    ? "border-current"
                    : "border-transparent bg-surface-0 text-text-secondary hover:bg-surface-1 hover:text-text-primary",
                )}
                style={
                  active
                    ? { color: meta.color, backgroundColor: `${meta.color}15`, borderColor: `${meta.color}44` }
                    : undefined
                }
              >
                {meta.label}
              </button>
            );
          })}
        </div>
        {errors.category && (
          <span className="text-xs text-danger mt-1.5 block">{errors.category}</span>
        )}
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-text-primary mb-1.5">
          Tags <span className="text-xs text-text-muted font-normal ml-1">(up to 5, press Enter to add)</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {data.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-accent/10 text-accent px-2.5 py-0.5 text-[11px] font-medium border border-accent/20"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-accent/70">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          id="tags"
          type="text"
          placeholder={data.tags.length >= 5 ? "Maximum tags reached" : "Add a tag..."}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          onBlur={() => { if (tagInput) addTag(tagInput); }}
          disabled={data.tags.length >= 5}
          className={cn(INPUT_CLASS, data.tags.length >= 5 && "opacity-50 cursor-not-allowed")}
        />
        {errors.tags && (
          <span className="text-xs text-danger mt-1 block">{errors.tags}</span>
        )}
      </div>
    </div>
  );
}
