'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/constants';
import type { AlgorithmListItem } from '@/lib/types';

export default function AlgorithmsPage() {
  const [algorithms, setAlgorithms] = useState<AlgorithmListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlgorithms() {
      try {
        const response = await api.listAlgorithms();
        setAlgorithms(response.algorithms);
      } catch (err) {
        setError('Failed to load algorithms');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAlgorithms();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-slate-900">Algorithms</h1>
          <div className="mt-8 animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-lg bg-slate-200" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-slate-900">Algorithms</h1>
          <div className="mt-8 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Algorithms</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to Home
          </Link>
        </div>

        <p className="mt-2 text-slate-600">
          Select an algorithm to learn and visualize
        </p>

        <div className="mt-8 space-y-4">
          {algorithms.map((algo) => (
            <Link
              key={algo.id}
              href={`/algorithms/${algo.id}`}
              className="block rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {algo.name}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[algo.category] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {CATEGORY_LABELS[algo.category] || algo.category}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-600">{algo.description}</p>
                </div>
                <svg
                  className="h-5 w-5 flex-shrink-0 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              <div className="mt-4 flex gap-6 text-sm">
                <div>
                  <span className="text-slate-500">Time:</span>
                  <span className="ml-1 font-mono text-slate-700">
                    {algo.complexity.time.average}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Space:</span>
                  <span className="ml-1 font-mono text-slate-700">
                    {algo.complexity.space}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
