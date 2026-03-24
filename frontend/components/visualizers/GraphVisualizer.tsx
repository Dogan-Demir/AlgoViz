'use client';

import { motion } from 'framer-motion';
import type { StateSnapshot, Highlights } from '@/lib/types';

interface GraphVisualizerProps {
  state: StateSnapshot;
  highlights: Highlights;
}

const NODE_RADIUS = 24;

export function GraphVisualizer({ state, highlights }: GraphVisualizerProps) {
  const graph = state.graph;
  if (!graph) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        No graph data to display
      </div>
    );
  }

  const { nodes, edges } = graph;

  // Calculate SVG bounds
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs) - 60;
  const maxX = Math.max(...xs) + 60;
  const minY = Math.min(...ys) - 60;
  const maxY = Math.max(...ys) + 100; // Extra space for queue
  const width = Math.max(maxX - minX, 300);
  const height = Math.max(maxY - minY, 200);

  const getNodeColor = (nodeId: string, nodeState: string): string => {
    if (highlights.success.includes(nodeId)) return 'fill-green-500';
    if (highlights.primary.includes(nodeId)) return 'fill-blue-500';
    if (highlights.secondary.includes(nodeId)) return 'fill-yellow-500';

    switch (nodeState) {
      case 'visiting':
        return 'fill-blue-400';
      case 'visited':
        return 'fill-green-400';
      default:
        return 'fill-slate-400';
    }
  };

  const getEdgeColor = (edgeState: string): string => {
    switch (edgeState) {
      case 'relaxed':
        return 'stroke-green-500';
      case 'considering':
        return 'stroke-blue-500';
      case 'rejected':
        return 'stroke-red-300';
      default:
        return 'stroke-slate-300';
    }
  };

  const nodesById = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`${minX} ${minY} ${width} ${height}`}
      className="mx-auto"
      role="img"
      aria-label="Graph visualization"
    >
      {/* Edges */}
      <g>
        {edges.map((edge, i) => {
          const from = nodesById[edge.from];
          const to = nodesById[edge.to];
          if (!from || !to) return null;

          return (
            <motion.line
              key={`edge-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className={`${getEdgeColor(edge.state)} transition-colors duration-300`}
              strokeWidth={3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
          );
        })}
      </g>

      {/* Nodes */}
      <g>
        {nodes.map((node) => (
          <motion.g
            key={node.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1, x: node.x, y: node.y }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <circle
              cx={0}
              cy={0}
              r={NODE_RADIUS}
              className={`${getNodeColor(node.id, node.state)} transition-colors duration-300`}
              stroke="white"
              strokeWidth={2}
            />
            <text
              x={0}
              y={5}
              textAnchor="middle"
              className="fill-white text-sm font-semibold"
            >
              {node.value}
            </text>
          </motion.g>
        ))}
      </g>

      {/* Queue visualization (for BFS) */}
      {state.queue && state.queue.length > 0 && (
        <g transform={`translate(${minX + 20}, ${maxY - 50})`}>
          <text className="fill-slate-600 text-xs font-semibold">Queue:</text>
          <g transform="translate(50, -10)">
            {state.queue.map((item, i) => (
              <g key={i} transform={`translate(${i * 35}, 0)`}>
                <rect
                  x={0}
                  y={0}
                  width={30}
                  height={24}
                  rx={4}
                  className="fill-blue-100 stroke-blue-400"
                />
                <text
                  x={15}
                  y={16}
                  textAnchor="middle"
                  className="fill-blue-700 text-xs font-mono"
                >
                  {item}
                </text>
              </g>
            ))}
          </g>
        </g>
      )}
    </svg>
  );
}
