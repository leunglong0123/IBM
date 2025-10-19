// API Types and Interfaces

export interface Flight {
  id: number;
  planeId: string;
  origin: string;
  destination: string;
  departureTime: string; // ISO 8601
  arrivalTime: string;   // ISO 8601
  createdAt?: string;
}

export interface Trip {
  id: number;
  route: string;
  origin: string;
  destination: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface GroundPeriod {
  location: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface PlaneTrips {
  planeId: string;
  trips: Trip[];
}

export interface PlaneGroundTime {
  planeId: string;
  groundPeriods: GroundPeriod[];
}

export interface GanttTripsResponse {
  title: string;
  startTime: string;
  endTime: string;
  planes: PlaneTrips[];
}

export interface GanttGroundTimeResponse {
  title: string;
  startTime: string;
  endTime: string;
  planes: PlaneGroundTime[];
}

export interface Plane {
  planeId: string;
  totalFlights: number;
  lastFlight: string;
}

export interface PlanesResponse {
  planes: Plane[];
}

export interface FlightsResponse {
  total: number;
  limit: number;
  offset: number;
  flights: Flight[];
}

// Chart View Type
export type ChartView = 'trips' | 'ground-time';
