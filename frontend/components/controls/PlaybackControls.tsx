'use client';

import { useEffect, useCallback } from 'react';
import { useRunStore } from '@/stores/runStore';
import { SpeedSlider } from './SpeedSlider';
import { StepIndicator } from './StepIndicator';

export function PlaybackControls() {
  const {
    steps,
    playback,
    isStreaming,
    streamComplete,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    setSpeed,
    goToStep,
  } = useRunStore();

  const { isPlaying, speed, currentStepIndex } = playback;
  const canStepBack = currentStepIndex > 0;
  const canStepForward = currentStepIndex < steps.length - 1;
  const hasSteps = steps.length > 0;

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || !hasSteps) return;

    const interval = setInterval(() => {
      const store = useRunStore.getState();
      if (store.playback.currentStepIndex < store.steps.length - 1) {
        store.stepForward();
      } else {
        store.pause();
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, hasSteps]);

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!hasSteps) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          isPlaying ? pause() : play();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepBack();
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        case 'Home':
          e.preventDefault();
          goToStep(0);
          break;
        case 'End':
          e.preventDefault();
          goToStep(steps.length - 1);
          break;
      }
    },
    [hasSteps, isPlaying, play, pause, stepBack, stepForward, goToStep, steps.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow">
      {/* Progress bar */}
      <StepIndicator current={currentStepIndex} total={steps.length} onSeek={goToStep} />

      {/* Main controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={reset}
          disabled={!hasSteps}
          className="rounded p-2 hover:bg-gray-100 disabled:opacity-50"
          aria-label="Reset to beginning"
          data-testid="reset-button"
        >
          <ResetIcon />
        </button>

        <button
          onClick={stepBack}
          disabled={!canStepBack}
          className="rounded p-2 hover:bg-gray-100 disabled:opacity-50"
          aria-label="Step backward"
          data-testid="step-back-button"
        >
          <StepBackIcon />
        </button>

        <button
          onClick={isPlaying ? pause : play}
          disabled={!hasSteps || (!canStepForward && !isPlaying)}
          className="rounded-full bg-blue-500 p-3 text-white hover:bg-blue-600 disabled:opacity-50"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          data-testid={isPlaying ? 'pause-button' : 'play-button'}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          onClick={stepForward}
          disabled={!canStepForward}
          className="rounded p-2 hover:bg-gray-100 disabled:opacity-50"
          aria-label="Step forward"
          data-testid="step-forward-button"
        >
          <StepForwardIcon />
        </button>
      </div>

      {/* Speed control */}
      <SpeedSlider speed={speed} onSpeedChange={setSpeed} />

      {/* Status indicators */}
      <div className="flex justify-center gap-4 text-sm text-gray-500">
        {isStreaming && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Streaming...
          </span>
        )}
        {streamComplete && <span>Stream complete</span>}
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-gray-400">
        Space: play/pause | Arrow keys: step | Home/End: jump
      </p>
    </div>
  );
}

const PlayIcon = () => (
  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const StepBackIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </svg>
);

const StepForwardIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
);

const ResetIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
  </svg>
);
