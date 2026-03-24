'use client';

interface StepIndicatorProps {
  current: number;
  total: number;
  onSeek: (index: number) => void;
}

export function StepIndicator({ current, total, onSeek }: StepIndicatorProps) {
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Step</span>
        <span data-testid="step-indicator">
          {total > 0 ? `${current + 1} / ${total}` : '0 / 0'}
        </span>
      </div>
      <div
        className="relative h-2 w-full cursor-pointer rounded-full bg-gray-200"
        onClick={(e) => {
          if (total === 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const percentage = clickX / rect.width;
          const newIndex = Math.min(Math.floor(percentage * total), total - 1);
          onSeek(newIndex);
        }}
        role="slider"
        aria-label="Step progress"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total - 1}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-blue-500 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
