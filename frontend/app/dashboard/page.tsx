'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import ProgressPanel from '@/components/dashboard/ProgressPanel';
import { api } from '@/lib/api';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/constants';
import type { AlgorithmListItem } from '@/lib/types';

const CATEGORIES = ['all', 'sorting', 'searching', 'graph'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_FILTER_LABELS: Record<string, string> = {
  all: 'All',
  sorting: 'Sorting',
  searching: 'Searching',
  graph: 'Graph',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const [algorithms, setAlgorithms] = useState<AlgorithmListItem[]>([]);
  const [algoLoading, setAlgoLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Category>('all');

  // Redirect guests to home
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.listAlgorithms()
      .then((res) => setAlgorithms(res.algorithms))
      .catch(console.error)
      .finally(() => setAlgoLoading(false));
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const firstName = user?.email?.split('@')[0] ?? 'there';

  const filtered =
    activeFilter === 'all'
      ? algorithms
      : algorithms.filter((a) => a.category === activeFilter);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-slate-500">Pick up where you left off.</p>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ── Algorithms panel (spans 2 cols on large screens) ── */}
          <div
            className="lg:col-span-2 rounded-xl bg-white shadow-sm border border-slate-200 p-6"
            data-tour="algorithm-list"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Algorithms</h2>
              {/* Category filter */}
              <div className="flex gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      activeFilter === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {CATEGORY_FILTER_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            {algoLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((algo, index) => (
                  <Link
                    key={algo.id}
                    href={`/algorithms/${algo.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-4 transition-all hover:border-indigo-200 hover:shadow-sm"
                    {...(index === 0 ? { 'data-tour': 'algorithm-card' } : {})}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{algo.name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            CATEGORY_COLORS[algo.category] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {CATEGORY_LABELS[algo.category] || algo.category}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500">{algo.description}</p>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-4 text-xs text-slate-400">
                      <span className="font-mono">{algo.complexity.time.average}</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
                {filtered.length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-400">No algorithms in this category yet.</p>
                )}
              </div>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-6">

            {/* Quizzes & Challenges */}
            <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-900">Quizzes & Challenges</h2>
              </div>
              <p className="text-sm text-slate-500">
                Test your knowledge with algorithm quizzes and interactive step-by-step challenges.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/quiz"
                  className="rounded-lg bg-indigo-50 p-3 text-center hover:bg-indigo-100 transition-colors"
                >
                  <div className="text-2xl font-bold text-indigo-600">Quiz</div>
                  <div className="text-xs text-indigo-500 mt-0.5">Take a quiz →</div>
                </Link>
                <Link
                  href="/challenge"
                  className="rounded-lg bg-purple-50 p-3 text-center hover:bg-purple-100 transition-colors"
                >
                  <div className="text-2xl font-bold text-purple-600">Challenge</div>
                  <div className="text-xs text-purple-500 mt-0.5">Try one →</div>
                </Link>
              </div>
            </div>

            {/* Progress */}
            <ProgressPanel algorithms={algorithms} />

            {/* Leaderboard */}
            <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-900">Leaderboard</h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  Coming soon
                </span>
              </div>
              <p className="text-sm text-slate-500">
                See how you rank globally on quiz score and streak.
              </p>
              <div className="mt-4 space-y-2">
                {['🥇', '🥈', '🥉'].map((medal, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <span>{medal}</span>
                    <div className="h-2.5 flex-1 rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-900">Learning Roadmap</h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  Coming soon
                </span>
              </div>
              <p className="text-sm text-slate-500">
                A suggested path through algorithms tailored to your current level.
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
