'use client';

import { useState } from 'react';
import type { AlgorithmCategory } from '@/lib/types';

interface InputPanelProps {
  category: AlgorithmCategory;
  algorithmId: string;
  onSubmit: (input: Record<string, unknown>) => void;
  isLoading: boolean;
}

export function InputPanel({ category, algorithmId, onSubmit, isLoading }: InputPanelProps) {
  return (
    <div className="rounded-lg bg-white p-4 shadow" data-tour="input-panel">
      <h3 className="mb-4 font-semibold text-slate-900">Input</h3>
      {category === 'sorting' && (
        <ArrayInput onSubmit={onSubmit} isLoading={isLoading} />
      )}
      {category === 'searching' && (
        <SearchInput onSubmit={onSubmit} isLoading={isLoading} />
      )}
      {category === 'graph' && (
        <GraphInput onSubmit={onSubmit} isLoading={isLoading} />
      )}
    </div>
  );
}

interface ArrayInputProps {
  onSubmit: (input: Record<string, unknown>) => void;
  isLoading: boolean;
}

function ArrayInput({ onSubmit, isLoading }: ArrayInputProps) {
  const [arrayStr, setArrayStr] = useState('5, 2, 8, 1, 9');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    try {
      const array = arrayStr.split(',').map((s) => {
        const num = parseFloat(s.trim());
        if (isNaN(num)) throw new Error('Invalid number');
        return num;
      });
      if (array.length < 2) {
        setError('Array must have at least 2 elements');
        return;
      }
      if (array.length > 50) {
        setError('Array must have at most 50 elements');
        return;
      }
      onSubmit({ array });
    } catch {
      setError('Invalid array format. Use comma-separated numbers.');
    }
  };

  const handleRandom = () => {
    const length = Math.floor(Math.random() * 8) + 5; // 5-12 elements
    const array = Array.from({ length }, () => Math.floor(Math.random() * 50) + 1);
    setArrayStr(array.join(', '));
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="array-input" className="block text-sm text-slate-600">
          Array (comma-separated numbers)
        </label>
        <input
          id="array-input"
          data-testid="array-input"
          type="text"
          value={arrayStr}
          onChange={(e) => setArrayStr(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="5, 2, 8, 1, 9"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleRandom}
          className="rounded bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
          type="button"
        >
          Random
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          data-testid="run-button"
          type="button"
        >
          {isLoading ? 'Running...' : 'Run'}
        </button>
      </div>
    </div>
  );
}

function SearchInput({ onSubmit, isLoading }: ArrayInputProps) {
  const [arrayStr, setArrayStr] = useState('1, 3, 5, 7, 9, 11, 13');
  const [target, setTarget] = useState('7');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    try {
      const array = arrayStr.split(',').map((s) => {
        const num = parseFloat(s.trim());
        if (isNaN(num)) throw new Error('Invalid number');
        return num;
      });
      const targetNum = parseFloat(target.trim());
      if (isNaN(targetNum)) {
        setError('Target must be a number');
        return;
      }
      if (array.length < 1) {
        setError('Array must have at least 1 element');
        return;
      }
      // Check if sorted
      const sorted = [...array].sort((a, b) => a - b);
      if (JSON.stringify(array) !== JSON.stringify(sorted)) {
        setError('Array must be sorted for binary search');
        return;
      }
      onSubmit({ array, target: targetNum });
    } catch {
      setError('Invalid array format. Use comma-separated numbers.');
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="array-input" className="block text-sm text-slate-600">
          Sorted Array (comma-separated numbers)
        </label>
        <input
          id="array-input"
          data-testid="array-input"
          type="text"
          value={arrayStr}
          onChange={(e) => setArrayStr(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="1, 3, 5, 7, 9"
        />
      </div>
      <div>
        <label htmlFor="target-input" className="block text-sm text-slate-600">
          Target Value
        </label>
        <input
          id="target-input"
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="7"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        data-testid="run-button"
        type="button"
      >
        {isLoading ? 'Running...' : 'Run'}
      </button>
    </div>
  );
}

function GraphInput({ onSubmit, isLoading }: ArrayInputProps) {
  const [preset, setPreset] = useState('simple');

  const presets: Record<string, { nodes: unknown[]; edges: unknown[]; start: string }> = {
    simple: {
      nodes: [
        { id: 'A', x: 100, y: 100, value: 'A' },
        { id: 'B', x: 250, y: 50, value: 'B' },
        { id: 'C', x: 250, y: 150, value: 'C' },
        { id: 'D', x: 400, y: 100, value: 'D' },
      ],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'D' },
        { from: 'C', to: 'D' },
      ],
      start: 'A',
    },
    tree: {
      nodes: [
        { id: 'A', x: 200, y: 50, value: 'A' },
        { id: 'B', x: 100, y: 150, value: 'B' },
        { id: 'C', x: 300, y: 150, value: 'C' },
        { id: 'D', x: 50, y: 250, value: 'D' },
        { id: 'E', x: 150, y: 250, value: 'E' },
      ],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'D' },
        { from: 'B', to: 'E' },
      ],
      start: 'A',
    },
    cycle: {
      nodes: [
        { id: 'A', x: 200, y: 50, value: 'A' },
        { id: 'B', x: 300, y: 150, value: 'B' },
        { id: 'C', x: 250, y: 280, value: 'C' },
        { id: 'D', x: 150, y: 280, value: 'D' },
        { id: 'E', x: 100, y: 150, value: 'E' },
      ],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
        { from: 'D', to: 'E' },
        { from: 'E', to: 'A' },
      ],
      start: 'A',
    },
  };

  const handleSubmit = () => {
    const graph = presets[preset];
    onSubmit(graph);
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="preset-select" className="block text-sm text-slate-600">
          Graph Preset
        </label>
        <select
          id="preset-select"
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="simple">Simple Graph (4 nodes)</option>
          <option value="tree">Binary Tree (5 nodes)</option>
          <option value="cycle">Cycle (5 nodes)</option>
        </select>
      </div>
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        data-testid="run-button"
        type="button"
      >
        {isLoading ? 'Running...' : 'Run'}
      </button>
    </div>
  );
}
