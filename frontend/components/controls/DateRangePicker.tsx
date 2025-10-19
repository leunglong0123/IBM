'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

const MAX_RANGE_DAYS = 7;

export function DateRangePicker({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: DateRangePickerProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [startTimeInput, setStartTimeInput] = useState('00:00');
  const [endTimeInput, setEndTimeInput] = useState('23:59');

  // Initialize date range from props
  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      setDateRange({ from: start, to: end });
      setStartTimeInput(format(start, 'HH:mm'));
      setEndTimeInput(format(end, 'HH:mm'));
    }
  }, []);

  // Validate date range
  const validateRange = (from: Date | undefined, to: Date | undefined): boolean => {
    if (!from || !to) return true;

    const diffMs = to.getTime() - from.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < 0) {
      return false;
    }

    if (diffDays > MAX_RANGE_DAYS) {
      return false;
    }

    return true;
  };

  // Handle date range change from calendar
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (!range) {
      setDateRange(undefined);
      return;
    }

    // Validate the range
    if (!validateRange(range.from, range.to)) {
      // If validation fails, don't update
      return;
    }

    setDateRange(range);

    // Update the parent component with combined date and time
    if (range.from) {
      const [hours, minutes] = startTimeInput.split(':');
      const newStart = new Date(range.from);
      newStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      onStartTimeChange(newStart.toISOString());
    }

    if (range.to) {
      const [hours, minutes] = endTimeInput.split(':');
      const newEnd = new Date(range.to);
      newEnd.setHours(parseInt(hours), parseInt(minutes), 59, 999);
      onEndTimeChange(newEnd.toISOString());
    }
  };

  // Handle time input changes
  const handleStartTimeInputChange = (time: string) => {
    setStartTimeInput(time);
    if (dateRange?.from) {
      const [hours, minutes] = time.split(':');
      const newStart = new Date(dateRange.from);
      newStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      onStartTimeChange(newStart.toISOString());
    }
  };

  const handleEndTimeInputChange = (time: string) => {
    setEndTimeInput(time);
    if (dateRange?.to) {
      const [hours, minutes] = time.split(':');
      const newEnd = new Date(dateRange.to);
      newEnd.setHours(parseInt(hours), parseInt(minutes), 59, 999);
      onEndTimeChange(newEnd.toISOString());
    }
  };

  // Preset buttons
  const setPreset = (preset: 'today' | '3days' | 'week') => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (preset) {
      case 'today':
        // Already set
        break;
      case '3days':
        end.setDate(end.getDate() + 2);
        break;
      case 'week':
        end.setDate(end.getDate() + 6);
        break;
    }

    setDateRange({ from: start, to: end });
    setStartTimeInput('00:00');
    setEndTimeInput('23:59');
    onStartTimeChange(start.toISOString());
    onEndTimeChange(end.toISOString());
  };

  // Disable dates that would create a range > 7 days
  const disabledDays = (date: Date) => {
    if (!dateRange?.from || dateRange?.to) return false;

    const diffMs = Math.abs(date.getTime() - dateRange.from.getTime());
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays > MAX_RANGE_DAYS;
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Time Range (Max {MAX_RANGE_DAYS} Days)</Label>

      {/* Quick Presets */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPreset('today')}
          className="text-xs"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPreset('3days')}
          className="text-xs"
        >
          3 Days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPreset('week')}
          className="text-xs"
        >
          Week
        </Button>
      </div>

      {/* Calendar Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
            disabled={disabledDays}
          />
        </PopoverContent>
      </Popover>

      {/* Time Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-time" className="text-sm">
            Start Time
          </Label>
          <Input
            id="start-time"
            type="time"
            value={startTimeInput}
            onChange={(e) => handleStartTimeInputChange(e.target.value)}
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-time" className="text-sm">
            End Time
          </Label>
          <Input
            id="end-time"
            type="time"
            value={endTimeInput}
            onChange={(e) => handleEndTimeInputChange(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
