'use client';

import React from 'react';
import { GanttRenderer } from './GanttRenderer';
import { GanttTripsResponse } from '@/types';

interface TripGanttProps {
  data: GanttTripsResponse;
}

const TRIP_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export function TripGantt({ data }: TripGanttProps) {
  const rows = data.planes.map((plane, planeIndex) => ({
    id: plane.planeId,
    name: plane.planeId,
    bars: plane.trips.map((trip) => ({
      id: `${plane.planeId}-${trip.id}`,
      label: trip.route,
      startTime: trip.startTime,
      endTime: trip.endTime,
      color: TRIP_COLORS[planeIndex % TRIP_COLORS.length],
      tooltip: `${trip.route}\n${trip.origin} → ${trip.destination}\nDuration: ${trip.durationMinutes} min`,
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
