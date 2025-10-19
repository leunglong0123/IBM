import {
  GanttTripsResponse,
  GanttGroundTimeResponse,
  PlanesResponse,
  FlightsResponse,
  Flight,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Failed to fetch ${url}: ${error}`);
  }
}

export const api = {
  /**
   * Get all planes with statistics
   */
  getPlanes: async (): Promise<PlanesResponse> => {
    return fetchApi<PlanesResponse>('/planes');
  },

  /**
   * Get flights with optional filtering
   */
  getFlights: async (params?: {
    planeId?: string;
    startTime?: string;
    endTime?: string;
    limit?: number;
    offset?: number;
  }): Promise<FlightsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.planeId) queryParams.append('planeId', params.planeId);
    if (params?.startTime) queryParams.append('startTime', params.startTime);
    if (params?.endTime) queryParams.append('endTime', params.endTime);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchApi<FlightsResponse>(`/flights${query ? `?${query}` : ''}`);
  },

  /**
   * Create a new flight
   */
  createFlight: async (flight: Omit<Flight, 'id' | 'createdAt'>): Promise<Flight> => {
    return fetchApi<Flight>('/flights', {
      method: 'POST',
      body: JSON.stringify(flight),
    });
  },

  /**
   * Get trip schedule data for Gantt chart
   */
  getGanttTrips: async (
    planeIds: string[],
    startTime: string,
    endTime: string
  ): Promise<GanttTripsResponse> => {
    const queryParams = new URLSearchParams({
      planeIds: planeIds.join(','),
      startTime,
      endTime,
    });

    return fetchApi<GanttTripsResponse>(`/gantt/trips?${queryParams.toString()}`);
  },

  /**
   * Get ground time schedule data for Gantt chart
   */
  getGanttGroundTime: async (
    planeIds: string[],
    startTime: string,
    endTime: string
  ): Promise<GanttGroundTimeResponse> => {
    const queryParams = new URLSearchParams({
      planeIds: planeIds.join(','),
      startTime,
      endTime,
    });

    return fetchApi<GanttGroundTimeResponse>(`/gantt/ground-time?${queryParams.toString()}`);
  },
};

export { ApiError };
