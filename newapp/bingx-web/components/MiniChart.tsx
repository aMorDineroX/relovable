'use client';

import React from 'react';

interface MiniChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export default function MiniChart({ data, color = '#22c55e', width = 60, height = 20 }: MiniChartProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  // Créer les points du path SVG
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = range === 0 ? height / 2 : height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
