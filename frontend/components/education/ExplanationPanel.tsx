'use client';

import { useRunStore } from '@/stores/runStore';

export function ExplanationPanel() {
  const { steps, playback } = useRunStore();
  const currentStep = steps[playback.currentStepIndex];

  if (!currentStep) {
    return (
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-gray-500">Run the algorithm to see explanations</p>
      </div>
    );
  }

  const { annotation } = currentStep;

  return (
    <div className="space-y-3 rounded-lg bg-blue-50 p-4">
      <h3 className="font-semibold text-blue-900">{annotation.short}</h3>

      {annotation.detailed && (
        <p className="text-sm text-blue-800">{annotation.detailed}</p>
      )}

      {annotation.insight && (
        <div className="flex gap-2 rounded bg-blue-100 p-2 text-sm">
          <span className="text-blue-600">Tip:</span>
          <p className="text-blue-700">{annotation.insight}</p>
        </div>
      )}
    </div>
  );
}
