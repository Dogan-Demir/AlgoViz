'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { AlgorithmListItem, UserProgress, UserStats } from '@/lib/types';

interface Props {
  algorithms: AlgorithmListItem[];
}

export default function ProgressPanel({ algorithms }: Props) {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [prog, st] = await Promise.all([api.getProgress(), api.getMyStats()]);
      setProgress(prog);
      setStats(st);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleConfident = async (algorithmId: string, current: boolean) => {
    setToggling(algorithmId);
    try {
      const updated = await api.setConfident(algorithmId, !current);
      setProgress((prev) =>
        prev.some((p) => p.algorithm_id === algorithmId)
          ? prev.map((p) => (p.algorithm_id === algorithmId ? updated : p))
          : [...prev, updated]
      );
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(null);
    }
  };

  const getProgress = (algoId: string): UserProgress | null =>
    progress.find((p) => p.algorithm_id === algoId) ?? null;

  if (loading) {
    return (
      <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Progress</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6">
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Progress</h2>
      <p className="mb-4 text-xs text-slate-400">
        An algorithm is complete when you pass 3 quizzes or mark yourself confident.
      </p>

      {/* Streak banner */}
      {stats && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-orange-50 px-4 py-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-sm font-semibold text-orange-700">
              {stats.current_streak > 0
                ? `${stats.current_streak}-day streak`
                : 'No streak yet'}
            </p>
            <p className="text-xs text-orange-500">
              Longest: {stats.longest_streak} day{stats.longest_streak !== 1 ? 's' : ''} · Score: {stats.total_score.toLocaleString()} pts
            </p>
          </div>
        </div>
      )}

      {/* Per-algorithm rows */}
      <div className="space-y-3">
        {algorithms.map((algo) => {
          const prog = getProgress(algo.id);
          const passed = prog?.quizzes_passed ?? 0;
          const isConfident = prog?.is_confident ?? false;
          const isCompleted = prog?.is_completed ?? false;
          const isToggling = toggling === algo.id;

          return (
            <div
              key={algo.id}
              className={`rounded-xl border p-3 transition-colors ${
                isCompleted ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">✓</span>
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 text-xs text-slate-400">
                      {passed}
                    </span>
                  )}
                  <span className="text-sm font-medium text-slate-800">{algo.name}</span>
                </div>

                {/* Confident checkbox */}
                <label className={`flex cursor-pointer items-center gap-1.5 text-xs text-slate-500 ${isToggling ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={isConfident}
                    disabled={isToggling}
                    onChange={() => toggleConfident(algo.id, isConfident)}
                    className="h-3.5 w-3.5 rounded accent-indigo-600"
                  />
                  Confident
                </label>
              </div>

              {/* Quiz pass dots */}
              {!isConfident && (
                <div className="mt-2 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        i < passed ? 'bg-indigo-500' : 'bg-slate-300'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-xs text-slate-400">{passed}/3 quizzes passed</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
