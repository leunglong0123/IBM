'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Plane } from '@/types';

interface PlaneSelectorProps {
  planes: Plane[];
  selectedPlaneIds: string[];
  onSelectionChange: (planeIds: string[]) => void;
}

export function PlaneSelector({
  planes,
  selectedPlaneIds,
  onSelectionChange,
}: PlaneSelectorProps) {
  const handleCheckboxChange = (planeId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedPlaneIds, planeId]);
    } else {
      onSelectionChange(selectedPlaneIds.filter((id) => id !== planeId));
    }
  };

  const handleSelectAll = () => {
    if (selectedPlaneIds.length === planes.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(planes.map((p) => p.planeId));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Select Planes</Label>
        <button
          onClick={handleSelectAll}
          className="text-sm text-primary hover:underline"
        >
          {selectedPlaneIds.length === planes.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
        {planes.map((plane) => (
          <label
            key={plane.planeId}
            className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded"
          >
            <input
              type="checkbox"
              checked={selectedPlaneIds.includes(plane.planeId)}
              onChange={(e) => handleCheckboxChange(plane.planeId, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
            />
            <div className="flex-1">
              <div className="font-medium">{plane.planeId}</div>
              <div className="text-xs text-muted-foreground">
                {plane.totalFlights} flights
              </div>
            </div>
          </label>
        ))}
      </div>

      {selectedPlaneIds.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedPlaneIds.length} plane{selectedPlaneIds.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
