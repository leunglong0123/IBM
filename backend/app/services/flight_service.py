import csv
import os
from datetime import datetime
from typing import List, Optional, Dict
from pathlib import Path
from app.schemas.flight import Flight


class FlightService:
    """Service for managing flight data using CSV storage"""

    def __init__(self, data_file: str = "data/flights.csv"):
        """Initialize the flight service with a CSV file"""
        self.data_file = Path(__file__).parent.parent.parent / data_file
        self.data_file.parent.mkdir(parents=True, exist_ok=True)
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        """Ensure the CSV file exists with headers"""
        if not self.data_file.exists():
            with open(self.data_file, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    'id', 'plane_id', 'origin', 'destination',
                    'departure_time', 'arrival_time', 'created_at'
                ])

    def _get_next_id(self) -> int:
        """Get the next available ID"""
        flights = self.get_all_flights()
        if not flights:
            return 1
        return max(int(f['id']) for f in flights) + 1

    def get_all_flights(self) -> List[Flight]:
        """Get all flights from CSV"""
        flights: List[Flight] = []
        if not self.data_file.exists():
            return flights

        with open(self.data_file, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                flights.append(row)
        return flights

    def get_flight_by_id(self, flight_id: int) -> Optional[Flight]:
        """Get a flight by ID"""
        flights = self.get_all_flights()
        for flight in flights:
            if int(flight['id']) == flight_id:
                return flight
        return None

    def create_flight(self, flight_data: Dict) -> Dict:
        """Create a new flight record"""
        # Check for duplicate (same plane, same departure time)
        existing_flights = self.get_flights_by_plane(flight_data['planeId'])
        for flight in existing_flights:
            if flight['departure_time'] == flight_data['departureTime']:
                raise ValueError(f"Duplicate flight: plane {flight_data['planeId']} "
                               f"already has a flight at {flight_data['departureTime']}")

        flight_id = self._get_next_id()
        created_at = datetime.utcnow().isoformat() + 'Z'

        flight = {
            'id': flight_id,
            'plane_id': flight_data['planeId'],
            'origin': flight_data['origin'],
            'destination': flight_data['destination'],
            'departure_time': flight_data['departureTime'],
            'arrival_time': flight_data['arrivalTime'],
            'created_at': created_at
        }

        # Append to CSV
        with open(self.data_file, 'a', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=[
                'id', 'plane_id', 'origin', 'destination',
                'departure_time', 'arrival_time', 'created_at'
            ])
            writer.writerow(flight)

        return {
            'id': flight_id,
            'planeId': flight_data['planeId'],
            'origin': flight_data['origin'],
            'destination': flight_data['destination'],
            'departureTime': flight_data['departureTime'],
            'arrivalTime': flight_data['arrivalTime'],
            'createdAt': created_at
        }

    def get_flights_by_plane(self, plane_id: str) -> List[Flight]:
        """Get all flights for a specific plane"""
        flights = self.get_all_flights()
        return [f for f in flights if f['plane_id'] == plane_id]

    def get_flights_by_plane_and_time_range(
        self,
        plane_ids: List[str],
        start_time: str,
        end_time: str
    ) -> Dict[str, List[Flight]]:
        """Get flights for multiple planes within a time range"""
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))

        all_flights = self.get_all_flights()
        result = {plane_id: [] for plane_id in plane_ids}

        for flight in all_flights:
            if flight['plane_id'] not in plane_ids:
                continue

            dept_dt = datetime.fromisoformat(flight['departure_time'].replace('Z', '+00:00'))
            arr_dt = datetime.fromisoformat(flight['arrival_time'].replace('Z', '+00:00'))

            # Include flight if it overlaps with the time range
            if (start_dt <= dept_dt <= end_dt or
                start_dt <= arr_dt <= end_dt or
                (dept_dt < start_dt and arr_dt > end_dt)):
                result[flight['plane_id']].append(flight)

        # Sort flights by departure time for each plane
        for plane_id in result:
            result[plane_id].sort(key=lambda x: x['departure_time'])

        return result

    def get_all_plane_ids(self) -> List[str]:
        """Get list of all unique plane IDs"""
        flights = self.get_all_flights()
        plane_ids = set(f['plane_id'] for f in flights)
        return sorted(list(plane_ids))
