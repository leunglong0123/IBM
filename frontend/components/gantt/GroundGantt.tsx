'use client';

import React from 'react';
import { GanttRenderer } from './GanttRenderer';
import { GanttGroundTimeResponse } from '@/types';

interface GroundGanttProps {
  data: GanttGroundTimeResponse;
}

const GROUND_COLORS = [
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
  '#a855f7', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export function GroundGantt({ data }: GroundGanttProps) {
  const rows = data.planes.map((plane, planeIndex) => ({
    id: plane.planeId,
    name: plane.planeId,
    bars: plane.groundPeriods.map((period, periodIndex) => ({
      id: `${plane.planeId}-ground-${periodIndex}`,
      label: `Ground at ${period.location}`,
      startTime: period.startTime,
      endTime: period.endTime,
      color: GROUND_COLORS[planeIndex % GROUND_COLORS.length],
      tooltip: `Ground time at ${period.location}\nDuration: ${period.durationMinutes} min`,
    })),
  }));

  return (
    <GanttRenderer
      title={data.title}
      startTime={data.startTime}
      endTime={data.endTime}
      rows={rows}
    />
  );
}
