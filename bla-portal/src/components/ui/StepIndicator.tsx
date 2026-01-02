import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({
  steps,
  currentStep,
  className,
}: StepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const isFuture = index > currentStep;

          return (
            <div
              key={index}
              className="flex flex-1 items-center"
            >
              {/* Step circle and label */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    isComplete && 'bg-primary text-white',
                    isCurrent && 'border-2 border-primary text-primary bg-white',
                    isFuture && 'border-2 border-border text-text-muted bg-white'
                  )}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center max-w-[80px]',
                    isComplete && 'text-primary',
                    isCurrent && 'text-primary',
                    isFuture && 'text-text-muted'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 mt-[-20px]',
                    index < currentStep ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
