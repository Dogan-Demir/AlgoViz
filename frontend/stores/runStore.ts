import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Step, AlgorithmMetadata } from '@/lib/types';

interface PlaybackState {
  isPlaying: boolean;
  speed: number;
  currentStepIndex: number;
}

interface RunState {
  // Run data
  runId: string | null;
  algorithm: AlgorithmMetadata | null;
  steps: Step[];
  totalSteps: number;

  // Playback
  playback: PlaybackState;

  // Stream status
  isStreaming: boolean;
  streamComplete: boolean;
  error: string | null;

  // Actions
  initRun: (metadata: {
    runId: string;
    algorithmId: string;
    totalSteps: number;
    algorithm: AlgorithmMetadata;
  }) => void;
  addStep: (step: Step) => void;
  setStreamComplete: () => void;
  setError: (error: string) => void;

  // Playback actions
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBack: () => void;
  goToStep: (index: number) => void;
  setSpeed: (speed: number) => void;
  reset: () => void;

  // Cleanup
  clearRun: () => void;
}

const initialPlaybackState: PlaybackState = {
  isPlaying: false,
  speed: 1,
  currentStepIndex: 0,
};

export const useRunStore = create<RunState>()(
  devtools(
    (set, get) => ({
      // Initial state
      runId: null,
      algorithm: null,
      steps: [],
      totalSteps: 0,
      playback: initialPlaybackState,
      isStreaming: false,
      streamComplete: false,
      error: null,

      // Initialize run with metadata
      initRun: (metadata) => {
        set({
          runId: metadata.runId,
          algorithm: metadata.algorithm,
          totalSteps: metadata.totalSteps,
          steps: [],
          playback: initialPlaybackState,
          isStreaming: true,
          streamComplete: false,
          error: null,
        });
      },

      // Add step from stream
      addStep: (step: Step) => {
        set((state) => ({
          steps: [...state.steps, step],
        }));
      },

      // Mark stream as complete
      setStreamComplete: () => {
        set({ isStreaming: false, streamComplete: true });
      },

      // Set error
      setError: (error: string) => {
        set({ error, isStreaming: false });
      },

      // Playback: play
      play: () => {
        set((state) => ({
          playback: { ...state.playback, isPlaying: true },
        }));
      },

      // Playback: pause
      pause: () => {
        set((state) => ({
          playback: { ...state.playback, isPlaying: false },
        }));
      },

      // Playback: step forward
      stepForward: () => {
        const { steps, playback } = get();
        if (playback.currentStepIndex < steps.length - 1) {
          set({
            playback: {
              ...playback,
              currentStepIndex: playback.currentStepIndex + 1,
            },
          });
        }
      },

      // Playback: step back
      stepBack: () => {
        const { playback } = get();
        if (playback.currentStepIndex > 0) {
          set({
            playback: {
              ...playback,
              currentStepIndex: playback.currentStepIndex - 1,
            },
          });
        }
      },

      // Playback: go to specific step
      goToStep: (index: number) => {
        const { steps, playback } = get();
        if (index >= 0 && index < steps.length) {
          set({
            playback: { ...playback, currentStepIndex: index },
          });
        }
      },

      // Playback: set speed
      setSpeed: (speed: number) => {
        set((state) => ({
          playback: { ...state.playback, speed },
        }));
      },

      // Reset to beginning
      reset: () => {
        set((state) => ({
          playback: {
            ...state.playback,
            currentStepIndex: 0,
            isPlaying: false,
          },
        }));
      },

      // Clear all run data
      clearRun: () => {
        set({
          runId: null,
          algorithm: null,
          steps: [],
          totalSteps: 0,
          playback: initialPlaybackState,
          isStreaming: false,
          streamComplete: false,
          error: null,
        });
      },
    }),
    { name: 'run-store' }
  )
);
