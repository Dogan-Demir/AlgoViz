'use client';

import { useRunStore } from '@/stores/runStore';

export function ComplexityInfo() {
  const { algorithm } = useRunStore();

  if (!algorithm) return null;

  const { complexity } = algorithm;

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <h3 className="mb-2 font-semibold text-gray-900">Complexity</h3>
      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="py-1 text-gray-600">Time (Best)</td>
            <td className="text-right font-mono">{complexity.time.best}</td>
          </tr>
          <tr>
            <td className="py-1 text-gray-600">Time (Average)</td>
            <td className="text-right font-mono">{complexity.time.average}</td>
          </tr>
          <tr>
            <td className="py-1 text-gray-600">Time (Worst)</td>
            <td className="text-right font-mono">{complexity.time.worst}</td>
          </tr>
          <tr>
            <td className="py-1 text-gray-600">Space</td>
            <td className="text-right font-mono">{complexity.space}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
