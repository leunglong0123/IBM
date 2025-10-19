from datetime import datetime
from typing import List, Dict
from .flight_service import FlightService
from app.schemas.flight import Flight


class GanttService:
    """Service for generating Gantt chart data"""

    def __init__(self, flight_service: FlightService):
        self.flight_service = flight_service

    def _calculate_duration_minutes(self, start_time: str, end_time: str) -> int:
        """Calculate duration in minutes between two ISO timestamps"""
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        duration = (end_dt - start_dt).total_seconds() / 60
        return int(duration)

    def get_trips_data(
        self,
        plane_ids: List[str],
        start_time: str,
        end_time: str
    ) -> Dict:
        """Generate trip schedule data for Gantt chart"""
        flights_by_plane: Dict[str, List[Flight]] = self.flight_service.get_flights_by_plane_and_time_range(
            plane_ids, start_time, end_time
        )

        planes_data = []
        for plane_id in plane_ids:
            flights: List[Flight] = flights_by_plane.get(plane_id, [])
            trips = []

            for flight in flights:
                trip = {
                    "id": int(flight['id']),
                    "route": f"{flight['origin']}-{flight['destination']}",
                    "origin": flight['origin'],
                    "destination": flight['destination'],
                    "startTime": flight['departure_time'],
                    "endTime": flight['arrival_time'],
                    "durationMinutes": self._calculate_duration_minutes(
                        flight['departure_time'],
                        flight['arrival_time']
                    )
                }
                trips.append(trip)

            planes_data.append({
                "planeId": plane_id,
                "trips": trips
            })

        # Create title
        plane_names = ', '.join(plane_ids)
        start_date = datetime.fromisoformat(start_time.replace('Z', '+00:00')).strftime('%Y-%m-%d')
        end_date = datetime.fromisoformat(end_time.replace('Z', '+00:00')).strftime('%Y-%m-%d')
        title = f"Trips of {plane_names} from {start_date} to {end_date}"

        return {
            "title": title,
            "startTime": start_time,
            "endTime": end_time,
            "planes": planes_data
        }

    def get_ground_time_data(
        self,
        plane_ids: List[str],
        start_time: str,
        end_time: str
    ) -> Dict:
        """Generate ground time schedule data for Gantt chart"""
        flights_by_plane: Dict[str, List[Flight]] = self.flight_service.get_flights_by_plane_and_time_range(
            plane_ids, start_time, end_time
        )

        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))

        planes_data = []
        for plane_id in plane_ids:
            flights: List[Flight] = flights_by_plane.get(plane_id, [])
            ground_periods = []

            if not flights:
                # No flights in range - entire period is ground time
                # We don't know the location, so skip or use unknown
                continue

            # Ground time before first flight
            first_flight_dept = datetime.fromisoformat(
                flights[0]['departure_time'].replace('Z', '+00:00')
            )
            if first_flight_dept > start_dt:
                # Location is the origin of the first flight
                ground_periods.append({
                    "location": flights[0]['origin'],
                    "startTime": start_time,
                    "endTime": flights[0]['departure_time'],
                    "durationMinutes": self._calculate_duration_minutes(
                        start_time,
                        flights[0]['departure_time']
                    )
                })

            # Ground time between consecutive flights
            for i in range(len(flights) - 1):
                current_flight = flights[i]
                next_flight = flights[i + 1]

                ground_start = current_flight['arrival_time']
                ground_end = next_flight['departure_time']
                location = current_flight['destination']

                # Only add if there's actual ground time
                if ground_start != ground_end:
                    ground_periods.append({
                        "location": location,
                        "startTime": ground_start,
                        "endTime": ground_end,
                        "durationMinutes": self._calculate_duration_minutes(
                            ground_start,
                            ground_end
                        )
                    })

            # Ground time after last flight
            last_flight_arr = datetime.fromisoformat(
                flights[-1]['arrival_time'].replace('Z', '+00:00')
            )
            if last_flight_arr < end_dt:
                ground_periods.append({
                    "location": flights[-1]['destination'],
                    "startTime": flights[-1]['arrival_time'],
                    "endTime": end_time,
                    "durationMinutes": self._calculate_duration_minutes(
                        flights[-1]['arrival_time'],
                        end_time
                    )
                })

            planes_data.append({
                "planeId": plane_id,
                "groundPeriods": ground_periods
            })

        # Create title
        plane_names = ', '.join(plane_ids)
        start_date = datetime.fromisoformat(start_time.replace('Z', '+00:00')).strftime('%Y-%m-%d')
        end_date = datetime.fromisoformat(end_time.replace('Z', '+00:00')).strftime('%Y-%m-%d')
        title = f"Ground time of {plane_names} from {start_date} to {end_date}"

        return {
            "title": title,
            "startTime": start_time,
            "endTime": end_time,
            "planes": planes_data
        }
