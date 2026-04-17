import React from 'react';

const STEPS = [
  { label: 'Input', icon: '⚖' },
  { label: 'Select', icon: '✦' },
  { label: 'Refine I', icon: '✦' },
  { label: 'Refine II', icon: '✦' },
  { label: 'Refine III', icon: '✦' },
  { label: 'Refine IV', icon: '✦' },
  { label: 'Refine V', icon: '✦' },
  { label: 'Result', icon: '♛' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 px-4 py-3 overflow-x-auto">
      {STEPS.map((step, idx) => {
        const isActive = idx === currentStep;
        const isDone = idx < currentStep;
        const isFuture = idx > currentStep;

        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center gap-1 min-w-[60px]">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm
                  border transition-all duration-300
                  ${isActive
                    ? 'border-gold-400 bg-gold-500/20 text-gold-300 shadow-lg shadow-gold-500/20'
                    : isDone
                    ? 'border-gold-600 bg-gold-600/10 text-gold-500'
                    : 'border-imperial-muted bg-imperial-surface text-imperial-muted'
                  }
                `}
              >
                {isDone ? '✓' : step.icon}
              </div>
              <span className={`text-[9px] tracking-widest uppercase font-display
                ${isActive ? 'text-gold-400' : isDone ? 'text-gold-600' : 'text-imperial-muted'}`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-px w-6 mx-0.5 mb-4 transition-all duration-300 ${isDone ? 'bg-gold-600' : 'bg-imperial-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
