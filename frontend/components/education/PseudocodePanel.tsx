'use client';

import { useRunStore } from '@/stores/runStore';

export function PseudocodePanel() {
  const { algorithm, steps, playback } = useRunStore();

  if (!algorithm) return null;

  const currentStep = steps[playback.currentStepIndex];
  const activeLines = currentStep?.pseudocodeLines ?? [];

  return (
    <div className="rounded-lg bg-slate-900 p-4 font-mono text-sm" data-testid="pseudocode-panel">
      <h3 className="mb-3 text-xs uppercase tracking-wider text-slate-400">
        Pseudocode
      </h3>
      <div className="space-y-1">
        {algorithm.pseudocode.map((line) => {
          const isActive = activeLines.includes(line.line);
          const indent = line.indent * 16;

          return (
            <div
              key={line.line}
              className={`flex transition-colors duration-200 ${
                isActive ? 'bg-yellow-500/20' : ''
              }`}
              data-testid="pseudocode-line"
              data-active={isActive}
            >
              <span
                className={`w-8 select-none pr-3 text-right ${
                  isActive ? 'text-yellow-400' : 'text-slate-600'
                }`}
              >
                {line.line}
              </span>
              <span
                className={isActive ? 'text-yellow-100' : 'text-slate-300'}
                style={{ paddingLeft: indent }}
              >
                {line.code}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
