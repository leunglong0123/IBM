#!/usr/bin/env python3
"""
Script to load sample flight data into the system
"""
import json
import sys
from pathlib import Path

# Add the app directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from app.services import FlightService


def load_sample_data():
    """Load sample data from JSON file"""
    flight_service = FlightService()

    # Load sample data
    sample_file = Path(__file__).parent / "sample_data.json"
    with open(sample_file, 'r') as f:
        flights = json.load(f)

    print(f"Loading {len(flights)} sample flights...")

    created = 0
    failed = 0

    for idx, flight in enumerate(flights):
        try:
            result = flight_service.create_flight(flight)
            created += 1
            print(f"✓ Created flight {idx + 1}/{len(flights)}: "
                  f"{result['planeId']} {result['origin']}-{result['destination']}")
        except Exception as e:
            failed += 1
            print(f"✗ Failed to create flight {idx + 1}/{len(flights)}: {str(e)}")

    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Created: {created}")
    print(f"  Failed:  {failed}")
    print(f"  Total:   {len(flights)}")
    print(f"{'='*60}")

    # Display loaded planes
    plane_ids = flight_service.get_all_plane_ids()
    print(f"\nLoaded planes: {', '.join(plane_ids)}")


if __name__ == "__main__":
    load_sample_data()
