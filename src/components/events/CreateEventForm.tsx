"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { eventsApi } from "@/lib/events-api";
import { Button } from "@/components/ui/button";
import type { Venue } from "@/types/venues";

import { StepIndicator } from "./create/StepIndicator";
import { StepBasics } from "./create/StepBasics";
import { StepSchedule } from "./create/StepSchedule";
import { StepLocation } from "./create/StepLocation";
import { StepDetails } from "./create/StepDetails";
import { StepMedia } from "./create/StepMedia";
import { StepReview } from "./create/StepReview";
import {
  createDefaults,
  validateStep,
  type CreateEventFormData,
  type FormStep,
  type StepErrors,
} from "./create/types";

/** Map frontend maturity (G/M/A) to backend values (G/R/X) */
const MATURITY_TO_DB: Record<string, string> = { G: "G", M: "R", A: "X" };

export function CreateEventForm() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CreateEventFormData>(createDefaults);
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [errors, setErrors] = useState<StepErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);

  // Load venues once on mount
  useEffect(() => {
    eventsApi.venues.list().then(setVenues);
  }, []);

  const updateField = useCallback(<K extends keyof CreateEventFormData>(
    field: K,
    value: CreateEventFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    setErrors((prev) => {
      if (prev[field as string]) {
        const next = { ...prev };
        delete next[field as string];
        return next;
      }
      return prev;
    });
  }, []);

  function handleNext() {
    const stepErrors = validateStep(currentStep, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, 6) as FormStep);
  }

  function handleBack() {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 1) as FormStep);
  }

  function goToStep(step: FormStep) {
    setErrors({});
    setCurrentStep(step);
  }

  async function handleSubmit(status: "draft" | "published") {
    // Validate all required steps
    for (const step of [1, 2] as FormStep[]) {
      const stepErrors = validateStep(step, formData);
      if (Object.keys(stepErrors).length > 0) {
        setCurrentStep(step);
        setErrors(stepErrors);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category || undefined,
        tags: formData.tags,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: new Date(formData.endsAt).toISOString(),
        timezone: formData.timezone,
        recurrence: formData.recurrence ?? null,
        seriesId: formData.recurrence?.seriesId ?? null,
        venueId: formData.venueId,
        location: {
          regionName: formData.location.regionName,
          coordinates: formData.location.coordinates,
          teleportUrl: formData.location.teleportUrl,
        },
        externalUrl: formData.externalUrl || null,
        maturity: MATURITY_TO_DB[formData.maturity] || "G",
        dressCode: formData.dressCode,
        dressCodeDetails: formData.dressCodeDetails || null,
        capacity: formData.capacity,
        entryFee: formData.entryFee,
        coverImage: formData.coverImage || null,
        gallery: formData.gallery.filter((u) => u.trim()),
        organizerName: user?.name ?? "",
        organizerAvatar: user?.picture ?? null,
        status,
      };

      const result = await eventsApi.events.create(payload);

      if (result?.id) {
        router.push(`/${result.id}`);
      } else {
        setSubmitError("Failed to create event. Please check your connection and try again.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.includes("401") || msg.includes("auth")) {
        setSubmitError("Your session has expired. Please sign in again.");
      } else {
        setSubmitError(`Failed to create event: ${msg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <StepIndicator currentStep={currentStep} onGoToStep={goToStep} />

      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <StepBasics data={formData} errors={errors} onChange={updateField} />
        )}
        {currentStep === 2 && (
          <StepSchedule data={formData} errors={errors} onChange={updateField} />
        )}
        {currentStep === 3 && (
          <StepLocation data={formData} errors={errors} venues={venues} onChange={updateField} />
        )}
        {currentStep === 4 && (
          <StepDetails data={formData} errors={errors} onChange={updateField} />
        )}
        {currentStep === 5 && (
          <StepMedia data={formData} errors={errors} onChange={updateField} />
        )}
        {currentStep === 6 && (
          <StepReview
            data={formData}
            onSubmit={handleSubmit}
            onGoToStep={goToStep}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </div>

      {/* Navigation — hidden on review step (it has its own buttons) */}
      {currentStep < 6 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/20">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-1.5 text-sm text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted hidden sm:block">
              {currentStep === 1 || currentStep === 2 ? "Required fields marked with *" : "All fields optional"}
            </span>
            <Button
              type="button"
              onClick={handleNext}
              className="gap-1.5 text-sm bg-accent text-bg-deep hover:bg-accent/90 font-semibold"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
