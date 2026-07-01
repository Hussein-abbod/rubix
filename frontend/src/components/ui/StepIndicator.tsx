import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {steps.map((step, i) => {
          const isActive = i <= currentStep;
          const isCurrent = i === currentStep;
          const isCompleted = i < currentStep;

          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    isCompleted
                      ? "bg-primary text-on-primary"
                      : isCurrent
                        ? "bg-primary text-on-primary ring-4 ring-primary/20"
                        : "bg-surface-container-high text-on-surface-variant border border-white/50"
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className={`text-xs font-semibold mt-2 whitespace-nowrap hidden sm:block ${
                    isActive ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 mt-[-1.5rem] transition-all duration-500 ${
                    i < currentStep ? "bg-primary" : "bg-surface-variant"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
