"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { STEP_LABELS, type FormStep } from "./types";

interface StepIndicatorProps {
  currentStep: FormStep;
  onGoToStep?: (step: FormStep) => void;
}

const STEPS: FormStep[] = [1, 2, 3, 4, 5, 6];

export function StepIndicator({ currentStep, onGoToStep }: StepIndicatorProps) {
  return (
    <>
      {/* Desktop: full step bar */}
      <div className="hidden sm:flex items-center gap-1 mb-8">
        {STEPS.map((step, i) => {
          const completed = step < currentStep;
          const active = step === currentStep;
          return (
            <div key={step} className="flex items-center flex-1">
              <button
                onClick={() => completed && onGoToStep?.(step)}
                disabled={!completed}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all w-full",
                  active && "bg-accent/10 text-accent border border-accent/25",
                  completed && "text-accent/70 hover:bg-accent/5 cursor-pointer",
                  !active && !completed && "text-text-muted cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold shrink-0",
                    active && "bg-accent text-bg-deep",
                    completed && "bg-accent/20 text-accent",
                    !active && !completed && "bg-surface-1 text-text-muted",
                  )}
                >
                  {completed ? <Check className="h-3 w-3" /> : step}
                </span>
                <span className="hidden lg:inline truncate">{STEP_LABELS[step]}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px w-4 shrink-0 mx-0.5",
                    step < currentStep ? "bg-accent/30" : "bg-border/30",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: compact indicator */}
      <div className="sm:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-accent">
            Step {currentStep} of 6
          </span>
          <span className="text-xs text-text-secondary">
            {STEP_LABELS[currentStep]}
          </span>
        </div>
        <div className="h-1 bg-surface-1 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}
