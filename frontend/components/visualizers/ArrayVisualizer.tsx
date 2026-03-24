'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import type { StateSnapshot, Highlights } from '@/lib/types';

interface ArrayVisualizerProps {
  state: StateSnapshot;
  highlights: Highlights;
}

const BAR_WIDTH = 40;
const BAR_GAP = 8;
const MAX_HEIGHT = 200;
const PADDING = 20;

export function ArrayVisualizer({ state, highlights }: ArrayVisualizerProps) {
  const array = state.array ?? [];
  const maxValue = Math.max(...array.map(Math.abs), 1);

  const width = array.length * (BAR_WIDTH + BAR_GAP) + PADDING * 2;
  const height = MAX_HEIGHT + 80; // Extra space for labels and pointers

  const getBarColor = (index: number): string => {
    if (highlights.success.includes(index)) return 'fill-green-500';
    if (highlights.primary.includes(index)) return 'fill-blue-500';
    if (highlights.secondary.includes(index)) return 'fill-yellow-500';
    if (highlights.inactive.includes(index)) return 'fill-gray-300';
    return 'fill-slate-600';
  };

  const barPositions = useMemo(() => {
    return array.map((_, index) => ({
      x: PADDING + index * (BAR_WIDTH + BAR_GAP),
    }));
  }, [array]);

  if (array.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        No array data to display
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      className="mx-auto"
      role="img"
      aria-label="Array visualization"
    >
      <AnimatePresence mode="popLayout">
        {array.map((value, index) => {
          const barHeight = (Math.abs(value) / maxValue) * MAX_HEIGHT;
          const x = barPositions[index]?.x ?? 0;
          const y = MAX_HEIGHT - barHeight;

          return (
            <motion.g
              key={`bar-${index}`}
              initial={{ x, opacity: 0 }}
              animate={{ x, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <motion.rect
                x={0}
                y={y}
                width={BAR_WIDTH}
                height={barHeight}
                className={`${getBarColor(index)} transition-colors duration-200`}
                rx={4}
                aria-label={`Index ${index}: value ${value}`}
              />

              <text
                x={BAR_WIDTH / 2}
                y={y - 8}
                textAnchor="middle"
                className="fill-slate-700 text-sm font-mono"
              >
                {value}
              </text>

              <text
                x={BAR_WIDTH / 2}
                y={MAX_HEIGHT + 20}
                textAnchor="middle"
                className="fill-slate-500 text-xs"
              >
                {index}
              </text>
            </motion.g>
          );
        })}
      </AnimatePresence>

      {state.variables?.low !== undefined && (
        <motion.g
          animate={{
            x: PADDING + Number(state.variables.low) * (BAR_WIDTH + BAR_GAP),
          }}
          transition={{ type: 'spring' }}
        >
          <polygon
            points={`${BAR_WIDTH / 2},${MAX_HEIGHT + 30} ${BAR_WIDTH / 2 - 6},${MAX_HEIGHT + 40} ${BAR_WIDTH / 2 + 6},${MAX_HEIGHT + 40}`}
            className="fill-blue-600"
          />
          <text
            x={BAR_WIDTH / 2}
            y={MAX_HEIGHT + 55}
            textAnchor="middle"
            className="fill-blue-600 text-xs font-semibold"
          >
            low
          </text>
        </motion.g>
      )}

      {state.variables?.high !== undefined && (
        <motion.g
          animate={{
            x: PADDING + Number(state.variables.high) * (BAR_WIDTH + BAR_GAP),
          }}
          transition={{ type: 'spring' }}
        >
          <polygon
            points={`${BAR_WIDTH / 2},${MAX_HEIGHT + 30} ${BAR_WIDTH / 2 - 6},${MAX_HEIGHT + 40} ${BAR_WIDTH / 2 + 6},${MAX_HEIGHT + 40}`}
            className="fill-purple-600"
          />
          <text
            x={BAR_WIDTH / 2}
            y={MAX_HEIGHT + 55}
            textAnchor="middle"
            className="fill-purple-600 text-xs font-semibold"
          >
            high
          </text>
        </motion.g>
      )}

      {state.variables?.mid !== undefined && (
        <motion.g
          animate={{
            x: PADDING + Number(state.variables.mid) * (BAR_WIDTH + BAR_GAP),
          }}
          transition={{ type: 'spring' }}
        >
          <polygon
            points={`${BAR_WIDTH / 2},${MAX_HEIGHT + 30} ${BAR_WIDTH / 2 - 6},${MAX_HEIGHT + 40} ${BAR_WIDTH / 2 + 6},${MAX_HEIGHT + 40}`}
            className="fill-orange-500"
          />
          <text
            x={BAR_WIDTH / 2}
            y={MAX_HEIGHT + 55}
            textAnchor="middle"
            className="fill-orange-500 text-xs font-semibold"
          >
            mid
          </text>
        </motion.g>
      )}
    </svg>
  );
}
