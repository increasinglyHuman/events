"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DRESS_CODES, type MaturityRating, type DressCode } from "@/types/events";
import type { CreateEventFormData, StepErrors } from "./types";

interface StepDetailsProps {
  data: CreateEventFormData;
  errors: StepErrors;
  onChange: <K extends keyof CreateEventFormData>(field: K, value: CreateEventFormData[K]) => void;
}

const INPUT_CLASS =
  "w-full rounded-lg border border-border/30 bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors";

const MATURITY_OPTIONS: { value: MaturityRating; label: string; desc: string; color: string }[] = [
  { value: "G", label: "G", desc: "General — all ages", color: "#4ecdc4" },
  { value: "M", label: "M", desc: "Moderate — some mature content", color: "#ffe66d" },
  { value: "A", label: "A", desc: "Adult — 18+ only", color: "#ff6b6b" },
];

const DRESS_CODE_LABELS: Record<DressCode, string> = {
  none: "No dress code",
  casual: "Casual",
  formal: "Formal",
  themed: "Themed",
  roleplay: "Roleplay",
  fantasy: "Fantasy",
  modern: "Modern",
  historical: "Historical",
  uniform: "Uniform",
  creative: "Creative",
  minimal: "Minimal",
  furry: "Furry",
  human: "Human",
};

export function StepDetails({ data, errors, onChange }: StepDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Details</h2>
        <p className="text-sm text-text-secondary">Set the vibe, access rules, and pricing.</p>
      </div>

      {/* Maturity Rating */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Maturity Rating</label>
        <div className="flex items-center gap-2">
          {MATURITY_OPTIONS.map((opt) => {
            const active = data.maturity === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange("maturity", opt.value)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all border",
                  active ? "border-current" : "border-border/20 bg-surface-0 text-text-secondary hover:bg-surface-1",
                )}
                style={
                  active
                    ? { color: opt.color, backgroundColor: `${opt.color}15`, borderColor: `${opt.color}44` }
                    : undefined
                }
              >
                <span className="font-bold">{opt.label}</span>
                <span className="text-[11px] hidden sm:inline opacity-70">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dress Code */}
      <div>
        <label htmlFor="dressCode" className="block text-sm font-medium text-text-primary mb-1.5">
          Dress Code
        </label>
        <select
          id="dressCode"
          value={data.dressCode}
          onChange={(e) => onChange("dressCode", e.target.value as DressCode)}
          className={cn(INPUT_CLASS, "appearance-auto max-w-xs")}
        >
          {DRESS_CODES.map((dc) => (
            <option key={dc} value={dc}>{DRESS_CODE_LABELS[dc]}</option>
          ))}
        </select>

        {data.dressCode !== "none" && (
          <div className="mt-3">
            <label htmlFor="dressCodeDetails" className="block text-xs text-text-secondary mb-1">
              Dress code details
            </label>
            <input
              id="dressCodeDetails"
              type="text"
              maxLength={500}
              placeholder="Describe the dress code..."
              value={data.dressCodeDetails}
              onChange={(e) => onChange("dressCodeDetails", e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        )}
      </div>

      {/* Capacity & Entry Fee row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-text-primary mb-1.5">
            Capacity
          </label>
          <input
            id="capacity"
            type="number"
            min={0}
            placeholder="Unlimited"
            value={data.capacity ?? ""}
            onChange={(e) => onChange("capacity", e.target.value ? parseInt(e.target.value, 10) : null)}
            className={INPUT_CLASS}
          />
          <span className="text-[11px] text-text-muted mt-1 block">Leave empty for no limit</span>
        </div>

        <div>
          <label htmlFor="entryFee" className="block text-sm font-medium text-text-primary mb-1.5">
            Entry Fee
          </label>
          <div className="relative">
            <input
              id="entryFee"
              type="number"
              min={0}
              value={data.entryFee}
              onChange={(e) => onChange("entryFee", parseInt(e.target.value, 10) || 0)}
              className={cn(INPUT_CLASS, "pr-14")}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-medium">
              PQT
            </span>
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">0 = free event</span>
        </div>
      </div>
    </div>
  );
}
