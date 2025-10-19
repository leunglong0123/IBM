'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlaneSelector } from '@/components/controls/PlaneSelector';
import { DateRangePicker } from '@/components/controls/DateRangePicker';
import { TripGantt } from '@/components/gantt/TripGantt';
import { GroundGantt } from '@/components/gantt/GroundGantt';
import { api } from '@/services/api';
import type {
  Plane,
  GanttTripsResponse,
  GanttGroundTimeResponse,
  ChartView,
} from '@/types';
import { Plane as PlaneIcon, Loader2 } from 'lucide-react';

export default function Dashboard() {
  // State
  const [planes, setPlanes] = useState<Plane[]>([]);
  const [selectedPlaneIds, setSelectedPlaneIds] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>('2022-01-01T00:00:00Z');
  const [endTime, setEndTime] = useState<string>('2022-01-03T23:59:59Z');
  const [chartView, setChartView] = useState<ChartView>('trips');

  const [tripsData, setTripsData] = useState<GanttTripsResponse | null>(null);
  const [groundData, setGroundData] = useState<GanttGroundTimeResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planesLoading, setPlanesLoading] = useState(true);

  // Load planes on mount
  useEffect(() => {
    const loadPlanes = async () => {
      try {
        setPlanesLoading(true);
        const response = await api.getPlanes();
        setPlanes(response.planes);

        // Auto-select all planes
        if (response.planes.length > 0) {
          setSelectedPlaneIds(response.planes.map((p) => p.planeId));
        }
      } catch (err) {
        console.error('Failed to load planes:', err);
        setError('Failed to load planes. Please make sure the backend is running.');
      } finally {
        setPlanesLoading(false);
      }
    };

    loadPlanes();
  }, []);

  // Load chart data
  const loadChartData = async () => {
    if (selectedPlaneIds.length === 0) {
      setError('Please select at least one plane');
      return;
    }

    if (!startTime || !endTime) {
      setError('Please select a valid time range');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (chartView === 'trips') {
        const data = await api.getGanttTrips(selectedPlaneIds, startTime, endTime);
        setTripsData(data);
      } else {
        const data = await api.getGanttGroundTime(selectedPlaneIds, startTime, endTime);
        setGroundData(data);
      }
    } catch (err: any) {
      console.error('Failed to load chart data:', err);
      setError(err.message || 'Failed to load chart data. Please check your selection.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load data when dependencies change
  useEffect(() => {
    if (selectedPlaneIds.length > 0 && startTime && endTime) {
      loadChartData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlaneIds, startTime, endTime, chartView]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <PlaneIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Aviation Plane Scheduling System</h1>
              <p className="text-muted-foreground">
                Flight schedules and maintenance planning
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Controls */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Select planes and time range</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {planesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <PlaneSelector
                      planes={planes}
                      selectedPlaneIds={selectedPlaneIds}
                      onSelectionChange={setSelectedPlaneIds}
                    />

                    <DateRangePicker
                      startTime={startTime}
                      endTime={endTime}
                      onStartTimeChange={setStartTime}
                      onEndTimeChange={setEndTime}
                    />

                    <Button
                      onClick={loadChartData}
                      disabled={loading || selectedPlaneIds.length === 0}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Refresh Data'
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Area - Charts */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Visualization</CardTitle>
                <CardDescription>
                  View flight trips and ground time schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={chartView} onValueChange={(v) => setChartView(v as ChartView)}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="trips">Trip Schedule</TabsTrigger>
                    <TabsTrigger value="ground-time">Ground Time</TabsTrigger>
                  </TabsList>

                  <TabsContent value="trips" className="mt-0">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : error ? (
                      <div className="p-8 text-center">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button onClick={loadChartData} variant="outline">
                          Retry
                        </Button>
                      </div>
                    ) : tripsData ? (
                      <TripGantt data={tripsData} />
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        Select planes and time range to view trip schedule
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="ground-time" className="mt-0">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : error ? (
                      <div className="p-8 text-center">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button onClick={loadChartData} variant="outline">
                          Retry
                        </Button>
                      </div>
                    ) : groundData ? (
                      <GroundGantt data={groundData} />
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        Select planes and time range to view ground time
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
