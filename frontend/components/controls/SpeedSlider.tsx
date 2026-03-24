'use client';

import { SPEED_OPTIONS } from '@/lib/constants';

interface SpeedSliderProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export function SpeedSlider({ speed, onSpeedChange }: SpeedSliderProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm text-gray-600">Speed:</span>
      {SPEED_OPTIONS.map((s) => (
        <button
          key={s}
          onClick={() => onSpeedChange(s)}
          className={`rounded px-2 py-1 text-sm ${
            speed === s ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {s}x
        </button>
      ))}
    </div>
  );
}
