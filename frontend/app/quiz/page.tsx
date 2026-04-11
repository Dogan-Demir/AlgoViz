'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import type { AlgorithmListItem, AnswerResult, QuizAttemptResult, QuizQuestion } from '@/lib/types';

type Step = 'select' | 'quiz' | 'results';

const DIFFICULTY_STYLES = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Multiple Choice',
  step_prediction: 'Step Prediction',
  complexity: 'Complexity',
  scenario: 'Scenario',
};

export default function QuizPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  // ── shared state ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('select');
  const [algorithms, setAlgorithms] = useState<AlgorithmListItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── quiz state ────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [chosenAnswer, setChosenAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<{ question_id: number; selected_answer: number }[]>([]);

  // ── results state ─────────────────────────────────────────────────────────
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect guests
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/');
  }, [isLoading, isAuthenticated, router]);

  // Load algorithms for selection screen
  useEffect(() => {
    if (!isAuthenticated) return;
    api.listAlgorithms().then((r) => setAlgorithms(r.algorithms)).catch(console.error);
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) return null;

  // ── handlers ──────────────────────────────────────────────────────────────
  const toggleAlgo = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const startQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const qs = await api.getQuizQuestions(Array.from(selected));
      setQuestions(qs);
      setCurrentIdx(0);
      setAnswers([]);
      setChosenAnswer(null);
      setAnswered(false);
      setStep('quiz');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const selectAnswer = (idx: number) => {
    if (answered) return;
    setChosenAnswer(idx);
    setAnswered(true);
  };

  const nextQuestion = () => {
    if (chosenAnswer === null) return;
    const newAnswers = [...answers, { question_id: questions[currentIdx].id, selected_answer: chosenAnswer }];
    setAnswers(newAnswers);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
      setChosenAnswer(null);
      setAnswered(false);
    } else {
      // submit
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: { question_id: number; selected_answer: number }[]) => {
    setSubmitting(true);
    try {
      const res = await api.submitQuiz(finalAnswers);
      setResult(res);
      setStep('results');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setStep('select');
    setSelected(new Set());
    setResult(null);
    setQuestions([]);
  };

  // ── renders ───────────────────────────────────────────────────────────────
  if (step === 'select') {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-lg">
          <button onClick={() => router.push('/dashboard')} className="mb-6 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>

          <h1 className="text-2xl font-bold text-slate-900">Take a Quiz</h1>
          <p className="mt-1 text-slate-500">Select one or more algorithms to be quizzed on.</p>

          <div className="mt-6 space-y-3">
            {algorithms.map((algo) => {
              const isChecked = selected.has(algo.id);
              return (
                <button
                  key={algo.id}
                  onClick={() => toggleAlgo(algo.id)}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    isChecked
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">{algo.name}</span>
                      <p className="mt-0.5 text-sm text-slate-500">{algo.description}</p>
                    </div>
                    <div className={`ml-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isChecked ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                    }`}>
                      {isChecked && (
                        <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={startQuiz}
            disabled={selected.size === 0 || loadingQuiz}
            className="mt-8 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {loadingQuiz ? 'Loading questions…' : `Start Quiz${selected.size > 0 ? ` (${selected.size} algorithm${selected.size > 1 ? 's' : ''})` : ''}`}
          </button>
        </div>
      </main>
    );
  }

  if (step === 'quiz') {
    const q = questions[currentIdx];
    const isLast = currentIdx === questions.length - 1;
    const progress = ((currentIdx) / questions.length) * 100;

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-xl">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200">
              <motion.div
                className="h-2 rounded-full bg-indigo-600"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200"
            >
              {/* Badges */}
              <div className="mb-4 flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${DIFFICULTY_STYLES[q.difficulty]}`}>
                  {q.difficulty}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {TYPE_LABELS[q.question_type]}
                </span>
                <span className="ml-auto text-xs font-semibold text-indigo-600">{q.points} pts</span>
              </div>

              {/* Question */}
              <h2 className="text-lg font-semibold leading-snug text-slate-900">{q.question_text}</h2>

              {/* Options */}
              <div className="mt-5 space-y-2.5">
                {q.options.map((option, idx) => {
                  let style = 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50';
                  if (answered) {
                    if (idx === q.options.indexOf(q.options[idx]) && idx === chosenAnswer) {
                      // selected — colour depends on correctness (we don't have correct_answer yet until submit)
                      style = 'border-indigo-400 bg-indigo-50 text-indigo-900 font-medium';
                    } else {
                      style = 'border-slate-200 bg-slate-50 text-slate-400 cursor-default';
                    }
                  } else if (chosenAnswer === idx) {
                    style = 'border-indigo-500 bg-indigo-50 text-indigo-900 font-medium';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => selectAnswer(idx)}
                      disabled={answered}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm transition-all ${style}`}
                    >
                      <span className="mr-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Next button */}
              {answered && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                  <button
                    onClick={nextQuestion}
                    disabled={submitting}
                    className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                  >
                    {submitting ? 'Submitting…' : isLast ? 'Finish Quiz' : 'Next Question →'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────
  if (step === 'results' && result) {
    const passed = result.correct_count / result.total_questions >= 0.6;
    const pct = Math.round((result.score / result.max_score) * 100);

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 text-center"
          >
            {/* Score circle */}
            <div className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold ${
              passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}>
              {pct}%
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              {passed ? 'Quiz Passed! 🎉' : 'Keep Practising 💪'}
            </h2>
            <p className="mt-1 text-slate-500">
              {result.correct_count} / {result.total_questions} correct · {result.score} / {result.max_score} points
            </p>

            {/* Stats row */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-indigo-50 p-3">
                <div className="text-xl font-bold text-indigo-700">{result.new_total_score.toLocaleString()}</div>
                <div className="text-xs text-indigo-500">Total score</div>
              </div>
              <div className="rounded-xl bg-orange-50 p-3">
                <div className="text-xl font-bold text-orange-600">{result.current_streak} 🔥</div>
                <div className="text-xs text-orange-500">Day streak</div>
              </div>
            </div>
          </motion.div>

          {/* Per-question breakdown */}
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Question Breakdown</h3>
            {result.results.map((r: AnswerResult, i: number) => {
              const q = questions[i];
              const isOpen = expandedQ === i;
              return (
                <div key={r.question_id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <button
                    onClick={() => setExpandedQ(isOpen ? null : i)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        r.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {r.correct ? '✓' : '✗'}
                      </span>
                      <span className="text-sm text-slate-700 line-clamp-1">{q?.question_text}</span>
                    </div>
                    <span className="ml-2 shrink-0 text-xs font-semibold text-slate-400">
                      +{r.points_earned}pts
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-4 py-3 text-sm">
                      <p className="font-medium text-slate-700">
                        Correct answer: <span className="text-indigo-600">{q?.options[r.correct_answer]}</span>
                      </p>
                      {r.explanation && (
                        <p className="mt-1.5 text-slate-500">{r.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={restart}
              className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
