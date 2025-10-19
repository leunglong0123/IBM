'use client';

import React from 'react';
import { format, parseISO, addHours } from 'date-fns';

interface GanttBar {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  color: string;
  tooltip?: string;
}

interface GanttRow {
  id: string;
  name: string;
  bars: GanttBar[];
}

interface GanttRendererProps {
  title: string;
  startTime: string;
  endTime: string;
  rows: GanttRow[];
}

interface TimeMarker {
  time: Date;
  label: string;
  position: number; // percentage
}

export function GanttRenderer({ title, startTime, endTime, rows }: GanttRendererProps) {
  const rangeStart = parseISO(startTime);
  const rangeEnd = parseISO(endTime);
  const totalDuration = rangeEnd.getTime() - rangeStart.getTime();

  // Generate time markers with 3-hour intervals
  const generateTimeMarkers = (): TimeMarker[] => {
    const markers: TimeMarker[] = [];
    const interval = 3; // 3-hour intervals

    // Generate markers
    let currentTime = new Date(rangeStart);

    // Align to nearest 3-hour interval (00, 03, 06, 09, 12, 15, 18, 21)
    const startHour = currentTime.getHours();
    const alignedHour = Math.ceil(startHour / interval) * interval;
    currentTime.setHours(alignedHour, 0, 0, 0);

    while (currentTime <= rangeEnd) {
      const position = ((currentTime.getTime() - rangeStart.getTime()) / totalDuration) * 100;

      // Format as 24-hour time (e.g., 0600, 0900, 1200)
      const hours = currentTime.getHours().toString().padStart(2, '0');
      const minutes = currentTime.getMinutes().toString().padStart(2, '0');
      const timeLabel = `${hours}${minutes}`;

      markers.push({
        time: new Date(currentTime),
        label: timeLabel,
        position: Math.max(0, Math.min(100, position)),
      });

      currentTime = addHours(currentTime, interval);
    }

    return markers;
  };

  const timeMarkers = generateTimeMarkers();

  // Calculate position and width for each bar
  const getBarStyle = (bar: GanttBar) => {
    const barStart = parseISO(bar.startTime);
    const barEnd = parseISO(bar.endTime);

    const leftPercent = ((barStart.getTime() - rangeStart.getTime()) / totalDuration) * 100;
    const widthPercent = ((barEnd.getTime() - barStart.getTime()) / totalDuration) * 100;

    return {
      left: `${Math.max(0, leftPercent)}%`,
      width: `${Math.max(0.5, widthPercent)}%`,
    };
  };

  const formatTime = (time: string) => {
    try {
      return format(parseISO(time), 'MMM dd HH:mm');
    } catch {
      return time;
    }
  };

  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No data available for the selected time range
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {formatTime(startTime)} - {formatTime(endTime)}
        </p>
      </div>

      {/* Gantt Chart */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Timeline Header */}
            <div className="flex border-b bg-muted/30">
              <div className="w-32 flex-shrink-0 p-3 font-semibold border-r sticky left-0 bg-white z-50">
                Plane
              </div>
              <div className="p-3 font-semibold" style={{ minWidth: '2000px' }}>
                Timeline
              </div>
            </div>

            {/* Rows */}
            {rows.map((row) => (
              <div key={row.id} className="flex border-b hover:bg-muted/20">
                {/* Row Label */}
                <div className="w-32 flex-shrink-0 p-3 font-medium border-r flex items-center sticky left-0 bg-white z-50">
                  {row.name}
                </div>

                {/* Timeline */}
                <div className="p-2 relative min-h-[60px]" style={{ minWidth: '2000px' }}>
                  {/* Grid lines */}
                  {timeMarkers.map((marker, index) => (
                    <div
                      key={`grid-${index}`}
                      className="absolute top-0 bottom-0 w-px bg-border/30"
                      style={{ left: `${marker.position}%` }}
                    />
                  ))}

                  {/* Bars */}
                  {row.bars.map((bar) => (
                    <div
                      key={bar.id}
                      className="absolute h-8 rounded cursor-pointer transition-all hover:opacity-80 z-10"
                      style={{
                        ...getBarStyle(bar),
                        backgroundColor: bar.color,
                        top: '8px',
                      }}
                      title={bar.tooltip || bar.label}
                    >
                      <div className="px-2 py-1 text-xs text-white truncate">
                        {bar.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Time Axis (Below) */}
            <div className="flex bg-muted/10">
              <div className="w-32 flex-shrink-0 border-r sticky left-0 bg-white z-50" />
              <div className="relative h-12" style={{ minWidth: '2000px' }}>
                {/* Time markers */}
                {timeMarkers.map((marker, index) => (
                  <div
                    key={index}
                    className="absolute top-0 bottom-0 flex flex-col items-center"
                    style={{ left: `${marker.position}%` }}
                  >
                    {/* Time label */}
                    <div className="text-xs text-muted-foreground mt-1 -translate-x-1/2 whitespace-nowrap font-mono">
                      {marker.label}
                    </div>
                    {/* Tick mark */}
                    <div className="w-px h-2 bg-border mt-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-muted-foreground">
        Hover over bars to see details
      </div>
    </div>
  );
}
