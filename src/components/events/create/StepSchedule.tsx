"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { COMMON_TIMEZONES, type CreateEventFormData, type StepErrors } from "./types";

interface StepScheduleProps {
  data: CreateEventFormData;
  errors: StepErrors;
  onChange: <K extends keyof CreateEventFormData>(field: K, value: CreateEventFormData[K]) => void;
}

const INPUT_CLASS =
  "w-full rounded-lg border border-border/30 bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors";

const ERROR_CLASS =
  "border-danger/60 focus:border-danger/80 focus:ring-danger/20";

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
] as const;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function StepSchedule({ data, errors, onChange }: StepScheduleProps) {
  const hasRecurrence = data.recurrence !== null;

  function toggleRecurrence() {
    if (hasRecurrence) {
      onChange("recurrence", null);
    } else {
      onChange("recurrence", {
        frequency: "weekly",
        interval: 1,
        daysOfWeek: [],
        seriesId: crypto.randomUUID(),
      });
    }
  }

  function updateRecurrence(patch: Partial<NonNullable<CreateEventFormData["recurrence"]>>) {
    if (!data.recurrence) return;
    onChange("recurrence", { ...data.recurrence, ...patch });
  }

  function toggleDay(day: number) {
    if (!data.recurrence) return;
    const days = data.recurrence.daysOfWeek ?? [];
    const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort();
    updateRecurrence({ daysOfWeek: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Schedule</h2>
        <p className="text-sm text-text-secondary">When does your event start and end?</p>
      </div>

      {/* Date/Time row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startsAt" className="block text-sm font-medium text-text-primary mb-1.5">
            Start <span className="text-danger">*</span>
          </label>
          <input
            id="startsAt"
            type="datetime-local"
            value={data.startsAt}
            onChange={(e) => onChange("startsAt", e.target.value)}
            className={cn(INPUT_CLASS, errors.startsAt && ERROR_CLASS)}
          />
          {errors.startsAt && (
            <span className="text-xs text-danger mt-1 block">{errors.startsAt}</span>
          )}
        </div>
        <div>
          <label htmlFor="endsAt" className="block text-sm font-medium text-text-primary mb-1.5">
            End <span className="text-danger">*</span>
          </label>
          <input
            id="endsAt"
            type="datetime-local"
            value={data.endsAt}
            onChange={(e) => onChange("endsAt", e.target.value)}
            className={cn(INPUT_CLASS, errors.endsAt && ERROR_CLASS)}
          />
          {errors.endsAt && (
            <span className="text-xs text-danger mt-1 block">{errors.endsAt}</span>
          )}
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-text-primary mb-1.5">
          Timezone
        </label>
        <select
          id="timezone"
          value={data.timezone}
          onChange={(e) => onChange("timezone", e.target.value)}
          className={cn(INPUT_CLASS, "appearance-auto")}
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>{tz.label} ({tz.value})</option>
          ))}
        </select>
      </div>

      {/* Recurrence */}
      <div className="border border-border/20 rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={hasRecurrence}
            onClick={toggleRecurrence}
            className={cn(
              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
              hasRecurrence ? "bg-accent" : "bg-surface-1",
            )}
          >
            <span
              className={cn(
                "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                hasRecurrence ? "translate-x-4" : "translate-x-1",
              )}
            />
          </button>
          <span className="text-sm font-medium text-text-primary">Recurring event</span>
        </label>

        {hasRecurrence && data.recurrence && (
          <div className="mt-4 space-y-4 pl-12">
            {/* Frequency */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">Frequency</label>
              <div className="flex items-center gap-1">
                {FREQUENCIES.map((f) => (
                  <Button
                    key={f.value}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => updateRecurrence({ frequency: f.value })}
                    className={cn(
                      "h-7 px-2.5 text-[11px]",
                      data.recurrence!.frequency === f.value
                        ? "bg-accent/15 text-accent"
                        : "text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Days of week (for weekly/biweekly) */}
            {(data.recurrence.frequency === "weekly" || data.recurrence.frequency === "biweekly") && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">Days</label>
                <div className="flex items-center gap-1">
                  {DAYS.map((day, i) => {
                    const active = data.recurrence!.daysOfWeek?.includes(i) ?? false;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={cn(
                          "h-8 w-8 rounded-md text-[11px] font-medium transition-all",
                          active
                            ? "bg-accent/15 text-accent border border-accent/25"
                            : "bg-surface-0 text-text-secondary hover:text-text-primary border border-transparent",
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* End date */}
            <div>
              <label htmlFor="recurrence-end" className="block text-xs font-medium text-text-secondary mb-1.5">
                Series ends
              </label>
              <input
                id="recurrence-end"
                type="datetime-local"
                value={data.recurrence.endsAt ?? ""}
                onChange={(e) => updateRecurrence({ endsAt: e.target.value || undefined })}
                className={cn(INPUT_CLASS, "max-w-xs")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
