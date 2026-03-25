'use client';

import { create } from 'zustand';

interface OnboardingState {
  isActive: boolean;
  currentStepIndex: number;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  isActive: false,
  currentStepIndex: 0,

  startTour: () => set({ isActive: true, currentStepIndex: 0 }),
  endTour: () => set({ isActive: false, currentStepIndex: 0 }),
  nextStep: () => set((s) => ({ currentStepIndex: s.currentStepIndex + 1 })),
  prevStep: () => set((s) => ({ currentStepIndex: Math.max(0, s.currentStepIndex - 1) })),
  goToStep: (index) => set({ currentStepIndex: index }),
}));
