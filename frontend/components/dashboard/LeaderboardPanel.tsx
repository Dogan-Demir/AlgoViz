'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { LeaderboardEntry } from '@/lib/types';

const MEDALS = ['🥇', '🥈', '🥉'];

function emailLabel(email: string) {
  return email.split('@')[0];
}

export default function LeaderboardPanel() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'score' | 'streak'>('score');
  const [scoreBoard, setScoreBoard] = useState<LeaderboardEntry[]>([]);
  const [streakBoard, setStreakBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getLeaderboard('score'), api.getLeaderboard('streak')])
      .then(([sc, st]) => { setScoreBoard(sc); setStreakBoard(st); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const entries = tab === 'score' ? scoreBoard : streakBoard;
  const myEmail = user?.email ?? '';

  // Find current user's entry even if outside top list
  const myEntry = entries.find((e) => e.email === myEmail);
  const myInList = entries.some((e) => e.email === myEmail);

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Leaderboard</h2>
        {/* Tab toggle */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
          <button
            onClick={() => setTab('score')}
            className={`px-3 py-1.5 transition-colors ${
              tab === 'score' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Score
          </button>
          <button
            onClick={() => setTab('streak')}
            className={`px-3 py-1.5 transition-colors ${
              tab === 'streak' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Streak 🔥
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">
          No entries yet — take a quiz to appear here!
        </p>
      ) : (
        <div className="space-y-1.5">
          {entries.slice(0, 10).map((entry) => {
            const isMe = entry.email === myEmail;
            return (
              <div
                key={entry.rank}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isMe
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'bg-slate-50 border border-transparent'
                }`}
              >
                {/* Rank */}
                <span className="w-6 shrink-0 text-center">
                  {entry.rank <= 3 ? MEDALS[entry.rank - 1] : (
                    <span className="text-xs font-bold text-slate-400">#{entry.rank}</span>
                  )}
                </span>

                {/* Name */}
                <span className={`flex-1 truncate font-medium ${isMe ? 'text-indigo-700' : 'text-slate-700'}`}>
                  {emailLabel(entry.email)}
                  {isMe && <span className="ml-1 text-xs font-normal text-indigo-400">(you)</span>}
                </span>

                {/* Value */}
                <span className={`shrink-0 font-semibold tabular-nums ${isMe ? 'text-indigo-600' : 'text-slate-600'}`}>
                  {tab === 'score'
                    ? `${entry.total_score.toLocaleString()} pts`
                    : `${entry.current_streak}d 🔥`}
                </span>
              </div>
            );
          })}

          {/* Show user's rank if they're outside top 10 */}
          {!myInList && myEntry && (
            <>
              <div className="my-1 border-t border-dashed border-slate-200" />
              <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm">
                <span className="w-6 shrink-0 text-center text-xs font-bold text-slate-400">#{myEntry.rank}</span>
                <span className="flex-1 truncate font-medium text-indigo-700">
                  {emailLabel(myEntry.email)}
                  <span className="ml-1 text-xs font-normal text-indigo-400">(you)</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-indigo-600">
                  {tab === 'score'
                    ? `${myEntry.total_score.toLocaleString()} pts`
                    : `${myEntry.current_streak}d 🔥`}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
