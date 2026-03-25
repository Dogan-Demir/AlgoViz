'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { api } from '@/lib/api';
import { TOUR_STEPS } from './tourConfig';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8; // extra space around the spotlight

export default function OnboardingTour() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const { isActive, currentStepIndex, startTour, endTour, nextStep, prevStep } =
    useOnboardingStore();

  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [pendingNav, setPendingNav] = useState(false);

  const step = TOUR_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  // Auto-start tour for new users
  useEffect(() => {
    if (user && !user.has_completed_onboarding && !isActive) {
      startTour();
    }
  }, [user, isActive, startTour]);

  // Find target element on current page
  const findTarget = useCallback(() => {
    if (!step) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) return;

    const r = el.getBoundingClientRect();
    setTargetRect({
      top: r.top - PADDING,
      left: r.left - PADDING,
      width: r.width + PADDING * 2,
      height: r.height + PADDING * 2,
    });
  }, [step]);

  // Navigate if needed, then find the element
  useEffect(() => {
    if (!isActive || !step) return;

    if (pathname !== step.page) {
      setPendingNav(true);
      router.push(step.page);
    } else {
      setPendingNav(false);
      // Small delay to let the page render
      const t = setTimeout(findTarget, 350);
      return () => clearTimeout(t);
    }
  }, [isActive, step, pathname, router, findTarget]);

  // After navigation completes, find the element
  useEffect(() => {
    if (pendingNav && pathname === step?.page) {
      setPendingNav(false);
      const t = setTimeout(findTarget, 400);
      return () => clearTimeout(t);
    }
  }, [pathname, pendingNav, step, findTarget]);

  const completeTour = useCallback(async () => {
    endTour();
    if (user) {
      setUser({ has_completed_onboarding: true });
      try {
        await api.updateMe({ has_completed_onboarding: true });
      } catch {
        // non-critical — store is already updated locally
      }
    }
  }, [endTour, user, setUser]);

  const handleNext = () => {
    if (isLastStep) {
      completeTour();
    } else {
      nextStep();
    }
  };

  const handleSkip = () => completeTour();

  if (!isActive || !step || !targetRect) return null;

  // Tooltip position relative to spotlight
  const tooltipStyle = getTooltipStyle(targetRect, step.placement);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9990]">
      {/* Dark overlay using box-shadow — the "hole" is the spotlight div itself */}
      <motion.div
        key={step.id}
        className="pointer-events-auto absolute rounded-lg"
        style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)' }}
        animate={{
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id + '-tooltip'}
          className="pointer-events-auto absolute z-[9991] w-72 rounded-xl bg-white shadow-2xl"
          style={tooltipStyle}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-5">
            {/* Step counter */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-indigo-600">
                {currentStepIndex + 1} of {TOUR_STEPS.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Skip tour
              </button>
            </div>

            {/* Dot progress */}
            <div className="mb-4 flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStepIndex
                      ? 'w-5 bg-indigo-600'
                      : i < currentStepIndex
                      ? 'w-1.5 bg-indigo-300'
                      : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <h3 className="mb-1.5 font-semibold text-slate-900">{step.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{step.content}</p>

            {/* Buttons */}
            <div className="mt-4 flex items-center justify-between gap-2">
              {currentStepIndex > 0 ? (
                <button
                  onClick={prevStep}
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={handleNext}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                {isLastStep ? 'Done' : 'Next →'}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function getTooltipStyle(rect: Rect, placement: string): React.CSSProperties {
  const GAP = 16;
  const TOOLTIP_WIDTH = 288;

  switch (placement) {
    case 'bottom':
      return {
        top: rect.top + rect.height + GAP,
        left: Math.max(8, rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2),
      };
    case 'top':
      return {
        top: rect.top - GAP - 200, // approximate tooltip height
        left: Math.max(8, rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2),
      };
    case 'left':
      return {
        top: rect.top,
        left: Math.max(8, rect.left - TOOLTIP_WIDTH - GAP),
      };
    case 'right':
      return {
        top: rect.top,
        left: rect.left + rect.width + GAP,
      };
    default:
      return {
        top: rect.top + rect.height + GAP,
        left: rect.left,
      };
  }
}
