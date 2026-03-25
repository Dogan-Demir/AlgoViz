'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { AlgorithmStreamClient } from '@/lib/stream';
import { useRunStore } from '@/stores/runStore';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/constants';
import { VisualizerFactory } from '@/components/visualizers/VisualizerFactory';
import { PlaybackControls } from '@/components/controls/PlaybackControls';
import { InputPanel } from '@/components/controls/InputPanel';
import { PseudocodePanel } from '@/components/education/PseudocodePanel';
import { ExplanationPanel } from '@/components/education/ExplanationPanel';
import { ComplexityInfo } from '@/components/education/ComplexityInfo';
import type { AlgorithmMetadata, Step } from '@/lib/types';

export default function AlgorithmViewerPage() {
  const params = useParams();
  const algorithmId = params.id as string;

  const [algorithmMeta, setAlgorithmMeta] = useState<AlgorithmMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const streamClientRef = useRef<AlgorithmStreamClient | null>(null);

  const {
    steps,
    playback,
    algorithm: storeAlgorithm,
    initRun,
    addStep,
    setStreamComplete,
    setError: setStoreError,
    clearRun,
  } = useRunStore();

  const currentStep = steps[playback.currentStepIndex];

  // Fetch algorithm metadata
  useEffect(() => {
    async function fetchAlgorithm() {
      try {
        const data = await api.getAlgorithm(algorithmId);
        setAlgorithmMeta(data);
      } catch (err) {
        setError('Failed to load algorithm');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAlgorithm();
  }, [algorithmId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamClientRef.current) {
        streamClientRef.current.disconnect();
      }
      clearRun();
    };
  }, [clearRun]);

  const handleRun = useCallback(
    async (input: Record<string, unknown>) => {
      setIsRunning(true);
      setError(null);

      // Disconnect existing stream
      if (streamClientRef.current) {
        streamClientRef.current.disconnect();
      }

      try {
        // Create run
        const runMetadata = await api.createRun({
          algorithmId,
          input,
        });

        // Initialize store
        initRun(runMetadata);

        // Connect to stream
        const streamClient = new AlgorithmStreamClient(runMetadata.runId, {
          onStep: (step: Step) => {
            addStep(step);
          },
          onComplete: () => {
            setStreamComplete();
            setIsRunning(false);
          },
          onError: (err) => {
            setStoreError(err.message);
            setIsRunning(false);
          },
        });

        streamClientRef.current = streamClient;
        streamClient.connect();
      } catch (err) {
        setError('Failed to start run');
        setIsRunning(false);
        console.error(err);
      }
    },
    [algorithmId, initRun, addStep, setStreamComplete, setStoreError]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-slate-200" />
            <div className="mt-4 h-4 w-96 rounded bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !algorithmMeta) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl">
          <Link href="/algorithms" className="text-blue-600 hover:text-blue-800">
            Back to Algorithms
          </Link>
          <div className="mt-8 rounded-lg bg-red-50 p-4 text-red-700">
            {error || 'Algorithm not found'}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <Link
              href="/algorithms"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Back to Algorithms
            </Link>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                {algorithmMeta.name}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[algorithmMeta.category] || 'bg-gray-100 text-gray-800'}`}
              >
                {CATEGORY_LABELS[algorithmMeta.category] || algorithmMeta.category}
              </span>
            </div>
            <p className="mt-1 text-slate-600">{algorithmMeta.description}</p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: Visualization */}
          <div className="space-y-6 lg:col-span-2">
            {/* Visualizer */}
            <div
              className="overflow-x-auto rounded-lg bg-white p-6 shadow"
              data-testid="array-visualizer"
              data-tour="visualizer"
            >
              {currentStep ? (
                <VisualizerFactory
                  category={algorithmMeta.category}
                  state={currentStep.state}
                  highlights={currentStep.highlights}
                />
              ) : (
                <div className="flex h-64 items-center justify-center text-slate-500">
                  Enter input and click Run to start visualization
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <PlaybackControls />

            {/* Explanation */}
            <ExplanationPanel />
          </div>

          {/* Right column: Controls and education */}
          <div className="space-y-6">
            {/* Input Panel */}
            <InputPanel
              category={algorithmMeta.category}
              algorithmId={algorithmId}
              onSubmit={handleRun}
              isLoading={isRunning}
            />

            {/* Pseudocode */}
            {storeAlgorithm && <PseudocodePanel />}

            {/* Complexity */}
            {storeAlgorithm && <ComplexityInfo />}
          </div>
        </div>
      </div>
    </main>
  );
}
