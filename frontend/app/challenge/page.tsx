'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

// ─── Challenge step types ────────────────────────────────────────────────────

interface BubbleSortStep {
  array: number[];
  i: number;
  j: number;
  shouldSwap: boolean;
}

interface BinarySearchStep {
  array: number[];
  target: number;
  low: number;
  high: number;
  mid: number;
}

interface BFSNode {
  id: string;
  x: number;
  y: number;
  state: 'unvisited' | 'in-queue' | 'visited';
}

interface BFSEdge { from: string; to: string }

interface BFSStep {
  nodes: BFSNode[];
  edges: BFSEdge[];
  queue: string[];
  nextNode: string;
}

type AlgoId = 'bubble-sort' | 'binary-search' | 'bfs';

// ─── Step generators ─────────────────────────────────────────────────────────

function genBubbleSortSteps(): BubbleSortStep[] {
  const arr = Array.from({ length: 6 }, () => Math.floor(Math.random() * 20) + 1);
  const a = [...arr];
  const steps: BubbleSortStep[] = [];
  for (let pass = 0; pass < a.length - 1; pass++) {
    for (let j = 0; j < a.length - 1 - pass; j++) {
      steps.push({ array: [...a], i: j, j: j + 1, shouldSwap: a[j] > a[j + 1] });
      if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
    }
  }
  return steps;
}

function genBinarySearchSteps(): BinarySearchStep[] {
  const sorted = Array.from(new Set(
    Array.from({ length: 8 }, () => Math.floor(Math.random() * 40) + 1)
  )).sort((a, b) => a - b).slice(0, 8);
  // 70% chance to pick a value that exists
  const target = Math.random() < 0.7
    ? sorted[Math.floor(Math.random() * sorted.length)]
    : Math.floor(Math.random() * 40) + 1;

  const steps: BinarySearchStep[] = [];
  let low = 0, high = sorted.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push({ array: sorted, target, low, high, mid });
    if (sorted[mid] === target) break;
    if (sorted[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return steps;
}

// Fixed 6-node graph — deterministic so steps are predictable
const BFS_NODES_DEF: Omit<BFSNode, 'state'>[] = [
  { id: 'A', x: 150, y: 40 },
  { id: 'B', x: 60,  y: 130 },
  { id: 'C', x: 240, y: 130 },
  { id: 'D', x: 20,  y: 230 },
  { id: 'E', x: 120, y: 230 },
  { id: 'F', x: 270, y: 230 },
];
const BFS_EDGES: BFSEdge[] = [
  { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
  { from: 'B', to: 'D' }, { from: 'B', to: 'E' },
  { from: 'C', to: 'F' }, { from: 'E', to: 'F' },
];
const BFS_ADJ: Record<string, string[]> = {
  A: ['B', 'C'], B: ['A', 'D', 'E'], C: ['A', 'F'],
  D: ['B'], E: ['B', 'F'], F: ['C', 'E'],
};

function genBFSSteps(): BFSStep[] {
  const steps: BFSStep[] = [];
  const visited = new Set<string>();
  const queue: string[] = ['A'];
  visited.add('A');

  const nodeState = (id: string): 'unvisited' | 'in-queue' | 'visited' => {
    if (visited.has(id) && !queue.includes(id)) return 'visited';
    if (queue.includes(id)) return 'in-queue';
    return 'unvisited';
  };

  while (queue.length > 0) {
    const snapshot: BFSNode[] = BFS_NODES_DEF.map(n => ({ ...n, state: nodeState(n.id) }));
    steps.push({
      nodes: snapshot,
      edges: BFS_EDGES,
      queue: [...queue],
      nextNode: queue[0],
    });
    const current = queue.shift()!;
    // mark current as visited (not in queue)
    for (const nb of BFS_ADJ[current]) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }
  return steps;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

const ALGO_META: Record<AlgoId, { name: string; description: string; color: string }> = {
  'bubble-sort':    { name: 'Bubble Sort',    color: 'indigo', description: 'Decide whether to swap each adjacent pair' },
  'binary-search':  { name: 'Binary Search',  color: 'green',  description: 'Click the correct mid element at each step' },
  'bfs':            { name: 'BFS',            color: 'purple', description: 'Click the next node BFS will visit' },
};

const COLOR = {
  indigo: { btn: 'bg-indigo-600 hover:bg-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
  green:  { btn: 'bg-green-600 hover:bg-green-700',   badge: 'bg-green-100 text-green-700' },
  purple: { btn: 'bg-purple-600 hover:bg-purple-700', badge: 'bg-purple-100 text-purple-700' },
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChallengePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  const [screen, setScreen] = useState<'select' | 'challenge' | 'results'>('select');
  const [algoId, setAlgoId] = useState<AlgoId | null>(null);

  // generic step state
  const [stepIdx, setStepIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // per-algo steps
  const [bubbleSteps, setBubbleSteps] = useState<BubbleSortStep[]>([]);
  const [bsSteps, setBsSteps] = useState<BinarySearchStep[]>([]);
  const [bfsSteps, setBfsSteps] = useState<BFSStep[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/');
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) return null;

  const startChallenge = (id: AlgoId) => {
    setAlgoId(id);
    setStepIdx(0);
    setCorrect(0);
    setFeedback(null);
    if (id === 'bubble-sort') setBubbleSteps(genBubbleSortSteps());
    if (id === 'binary-search') setBsSteps(genBinarySearchSteps());
    if (id === 'bfs') setBfsSteps(genBFSSteps());
    setScreen('challenge');
  };

  const advance = (wasCorrect: boolean) => {
    setFeedback(wasCorrect ? 'correct' : 'wrong');
    const newCorrect = wasCorrect ? correct + 1 : correct;
    const newTotal = total + 1;
    setCorrect(newCorrect);
    setTotal(newTotal);

    const steps = algoId === 'bubble-sort' ? bubbleSteps
                : algoId === 'binary-search' ? bsSteps
                : bfsSteps;

    setTimeout(() => {
      setFeedback(null);
      if (stepIdx + 1 >= steps.length) {
        setTotal(newTotal);
        setCorrect(newCorrect);
        setScreen('results');
      } else {
        setStepIdx(i => i + 1);
      }
    }, 800);
  };

  // ── Select screen ──────────────────────────────────────────────────────────
  if (screen === 'select') {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-lg">
          <button onClick={() => router.push('/dashboard')} className="mb-6 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>

          <h1 className="text-2xl font-bold text-slate-900">Challenges</h1>
          <p className="mt-1 text-slate-500">Perform the algorithm yourself — step by step.</p>

          <div className="mt-6 space-y-3">
            {(Object.keys(ALGO_META) as AlgoId[]).map((id) => {
              const meta = ALGO_META[id];
              const c = COLOR[meta.color as keyof typeof COLOR];
              return (
                <button
                  key={id}
                  onClick={() => startChallenge(id)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white p-5 text-left transition-all hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium mb-2 ${c.badge}`}>
                        {meta.name}
                      </span>
                      <p className="text-sm text-slate-600">{meta.description}</p>
                    </div>
                    <svg className="ml-4 h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  // ── Results screen ─────────────────────────────────────────────────────────
  if (screen === 'results') {
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = pct >= 60;
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-md">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 text-center">
            <div className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold ${
              passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}>
              {pct}%
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {passed ? 'Challenge Complete! 🎉' : 'Keep Practising 💪'}
            </h2>
            <p className="mt-1 text-slate-500">{correct} / {total} steps correct</p>
            <div className="mt-8 flex gap-3">
              <button onClick={() => { setTotal(0); startChallenge(algoId!); }}
                className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                Try Again
              </button>
              <button onClick={() => { setScreen('select'); setTotal(0); setCorrect(0); }}
                className="flex-1 rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors">
                Pick Another
              </button>
            </div>
            <button onClick={() => router.push('/dashboard')} className="mt-3 w-full text-sm text-slate-400 hover:text-slate-600">
              Back to dashboard
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  // ── Challenge screens ──────────────────────────────────────────────────────
  const steps = algoId === 'bubble-sort' ? bubbleSteps
              : algoId === 'binary-search' ? bsSteps
              : bfsSteps;
  const progress = steps.length > 0 ? (stepIdx / steps.length) * 100 : 0;
  const meta = ALGO_META[algoId!];
  const c = COLOR[meta.color as keyof typeof COLOR];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => setScreen('select')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Challenges
          </button>
          <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${c.badge}`}>{meta.name}</span>
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Step {stepIdx + 1} of {steps.length}</span>
            <span>{correct} correct so far</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200">
            <motion.div className="h-2 rounded-full bg-indigo-600" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        {/* Feedback overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`mb-4 rounded-xl px-4 py-3 text-center font-semibold ${
                feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}
            >
              {feedback === 'correct' ? '✓ Correct!' : '✗ Not quite — moving on'}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {algoId === 'bubble-sort' && bubbleSteps[stepIdx] && (
              <BubbleSortChallenge step={bubbleSteps[stepIdx]} onAnswer={advance} disabled={!!feedback} />
            )}
            {algoId === 'binary-search' && bsSteps[stepIdx] && (
              <BinarySearchChallenge step={bsSteps[stepIdx]} onAnswer={advance} disabled={!!feedback} />
            )}
            {algoId === 'bfs' && bfsSteps[stepIdx] && (
              <BFSChallenge step={bfsSteps[stepIdx]} onAnswer={advance} disabled={!!feedback} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

// ─── Bubble Sort sub-component ────────────────────────────────────────────────

function BubbleSortChallenge({ step, onAnswer, disabled }: {
  step: BubbleSortStep;
  onAnswer: (correct: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
      <p className="mb-5 font-semibold text-slate-800">
        Should these two elements be <span className="text-indigo-600">swapped</span>?
      </p>

      {/* Array bars */}
      <div className="mb-6 flex items-end justify-center gap-2">
        {step.array.map((val, idx) => {
          const isHighlighted = idx === step.i || idx === step.j;
          const maxVal = Math.max(...step.array);
          const barH = Math.round((val / maxVal) * 80) + 20;
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <span className="text-xs font-mono font-semibold text-slate-700">{val}</span>
              <div
                style={{ height: barH }}
                className={`w-10 rounded-md transition-colors ${
                  isHighlighted ? 'bg-indigo-500 ring-2 ring-indigo-400' : 'bg-slate-300'
                }`}
              />
              <span className="text-xs text-slate-400">{idx}</span>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onAnswer(step.shouldSwap)}
          disabled={disabled}
          className="flex-1 rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          🔄 Swap
        </button>
        <button
          onClick={() => onAnswer(!step.shouldSwap)}
          disabled={disabled}
          className="flex-1 rounded-xl border-2 border-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          ✓ Keep
        </button>
      </div>
    </div>
  );
}

// ─── Binary Search sub-component ─────────────────────────────────────────────

function BinarySearchChallenge({ step, onAnswer, disabled }: {
  step: BinarySearchStep;
  onAnswer: (correct: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <p className="font-semibold text-slate-800">Click the <span className="text-green-600">mid</span> element Binary Search checks next</p>
      </div>
      <p className="mb-5 text-sm text-slate-500">
        Searching for <span className="font-mono font-bold text-slate-800">{step.target}</span>
        {' '}· low={step.low} · high={step.high}
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {step.array.map((val, idx) => {
          const inRange = idx >= step.low && idx <= step.high;
          const isLow = idx === step.low;
          const isHigh = idx === step.high;
          return (
            <button
              key={idx}
              onClick={() => onAnswer(idx === step.mid)}
              disabled={disabled || !inRange}
              className={`relative flex h-14 w-14 flex-col items-center justify-center rounded-xl border-2 font-mono font-bold text-sm transition-all
                ${!inRange ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-default' :
                  'border-slate-300 bg-white text-slate-800 hover:border-green-400 hover:bg-green-50 cursor-pointer'}
                ${disabled ? 'cursor-default' : ''}
              `}
            >
              {val}
              {(isLow || isHigh) && (
                <span className={`absolute -bottom-5 text-xs font-medium ${isLow ? 'text-blue-500' : 'text-purple-500'}`}>
                  {isLow && isHigh ? 'lo/hi' : isLow ? 'lo' : 'hi'}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-8 text-center text-xs text-slate-400">Click the element at index floor((low + high) / 2)</div>
    </div>
  );
}

// ─── BFS sub-component ────────────────────────────────────────────────────────

function BFSChallenge({ step, onAnswer, disabled }: {
  step: BFSStep;
  onAnswer: (correct: boolean) => void;
  disabled: boolean;
}) {
  const nodeColors: Record<BFSNode['state'], string> = {
    'visited':   'fill-slate-400 stroke-slate-500',
    'in-queue':  'fill-indigo-400 stroke-indigo-600',
    'unvisited': 'fill-white stroke-slate-300',
  };
  const textColors: Record<BFSNode['state'], string> = {
    'visited':   'fill-white',
    'in-queue':  'fill-white',
    'unvisited': 'fill-slate-700',
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
      <p className="mb-1 font-semibold text-slate-800">
        Click the node BFS will <span className="text-purple-600">visit next</span>
      </p>
      <p className="mb-4 text-sm text-slate-500">
        Queue (front → back): <span className="font-mono font-bold text-slate-800">[{step.queue.join(', ')}]</span>
      </p>

      {/* Graph SVG */}
      <div className="flex justify-center mb-4">
        <svg width={300} height={280} className="overflow-visible">
          {/* Edges */}
          {step.edges.map((e, i) => {
            const from = step.nodes.find(n => n.id === e.from)!;
            const to   = step.nodes.find(n => n.id === e.to)!;
            return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#cbd5e1" strokeWidth={2} />;
          })}
          {/* Nodes */}
          {step.nodes.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={22}
                className={`${nodeColors[node.state]} stroke-2 transition-colors ${
                  !disabled && node.state === 'in-queue'
                    ? 'cursor-pointer hover:stroke-purple-500'
                    : node.state !== 'in-queue' ? 'cursor-default' : ''
                }`}
                onClick={() => {
                  if (disabled || node.state !== 'in-queue') return;
                  onAnswer(node.id === step.nextNode);
                }}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-sm font-bold pointer-events-none ${textColors[node.state]}`}
                fontSize={14}
              >
                {node.id}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-white border border-slate-300" /> Unvisited</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-indigo-400" /> In queue</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-slate-400" /> Visited</span>
      </div>
      <p className="mt-3 text-center text-xs text-slate-400">Click a blue (queued) node — BFS processes the front of the queue first</p>
    </div>
  );
}
