'use client';

import { ArrayVisualizer } from './ArrayVisualizer';
import { GraphVisualizer } from './GraphVisualizer';
import type { StateSnapshot, Highlights, AlgorithmCategory } from '@/lib/types';

interface VisualizerFactoryProps {
  category: AlgorithmCategory;
  state: StateSnapshot;
  highlights: Highlights;
}

export function VisualizerFactory({
  category,
  state,
  highlights,
}: VisualizerFactoryProps) {
  switch (category) {
    case 'sorting':
    case 'searching':
      return <ArrayVisualizer state={state} highlights={highlights} />;

    case 'graph':
      return <GraphVisualizer state={state} highlights={highlights} />;

    case 'stack':
      return (
        <div className="flex h-64 items-center justify-center text-slate-500">
          Stack visualization coming soon
        </div>
      );

    case 'queue':
      return (
        <div className="flex h-64 items-center justify-center text-slate-500">
          Queue visualization coming soon
        </div>
      );

    case 'tree':
      return (
        <div className="flex h-64 items-center justify-center text-slate-500">
          Tree visualization coming soon
        </div>
      );

    default:
      return (
        <div className="flex h-64 items-center justify-center text-slate-500">
          Unknown algorithm category
        </div>
      );
  }
}
