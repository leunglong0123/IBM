from fastapi import APIRouter, HTTPException, status
from typing import List
from ..schemas import FlightCreate, FlightResponse, BulkFlightCreate, BulkFlightResponse
from ..services import FlightService

router = APIRouter(prefix="/api/v1", tags=["flights"])
flight_service = FlightService()


@router.post("/flights", response_model=FlightResponse, status_code=status.HTTP_201_CREATED)
async def create_flight(flight: FlightCreate):
    """Create a new flight record"""
    try:
        result = flight_service.create_flight(flight.model_dump())
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create flight: {str(e)}"
        )


@router.post("/flights/bulk", response_model=BulkFlightResponse, status_code=status.HTTP_201_CREATED)
async def create_bulk_flights(bulk_data: BulkFlightCreate):
    """Create multiple flight records at once"""
    created = 0
    failed = 0
    errors = []

    for idx, flight in enumerate(bulk_data.flights):
        try:
            flight_service.create_flight(flight.model_dump())
            created += 1
        except Exception as e:
            failed += 1
            errors.append(f"Flight {idx + 1}: {str(e)}")

    return {
        "created": created,
        "failed": failed,
        "errors": errors
    }


@router.get("/flights")
async def get_flights(
    planeId: str = None,
    startTime: str = None,
    endTime: str = None,
    limit: int = 100,
    offset: int = 0
):
    """Get flights with filtering"""
    try:
        all_flights = flight_service.get_all_flights()

        # Filter by plane ID if provided
        if planeId:
            all_flights = [f for f in all_flights if f['plane_id'] == planeId]

        # Filter by time range if provided
        if startTime and endTime:
            from datetime import datetime
            start_dt = datetime.fromisoformat(startTime.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(endTime.replace('Z', '+00:00'))

            filtered_flights = []
            for flight in all_flights:
                dept_dt = datetime.fromisoformat(flight['departure_time'].replace('Z', '+00:00'))
                arr_dt = datetime.fromisoformat(flight['arrival_time'].replace('Z', '+00:00'))

                if (start_dt <= dept_dt <= end_dt or
                    start_dt <= arr_dt <= end_dt or
                    (dept_dt < start_dt and arr_dt > end_dt)):
                    filtered_flights.append(flight)

            all_flights = filtered_flights

        total = len(all_flights)
        paginated_flights = all_flights[offset:offset + limit]

        # Convert to response format
        flights = [{
            'id': int(f['id']),
            'planeId': f['plane_id'],
            'origin': f['origin'],
            'destination': f['destination'],
            'departureTime': f['departure_time'],
            'arrivalTime': f['arrival_time'],
            'createdAt': f['created_at']
        } for f in paginated_flights]

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "flights": flights
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get flights: {str(e)}"
        )


@router.get("/planes")
async def get_planes():
    """Get list of all planes with statistics"""
    try:
        plane_ids = flight_service.get_all_plane_ids()
        planes = []

        for plane_id in plane_ids:
            flights = flight_service.get_flights_by_plane(plane_id)
            if flights:
                # Sort by departure time to get the last flight
                sorted_flights = sorted(flights, key=lambda x: x['departure_time'])
                last_flight = sorted_flights[-1]['departure_time']

                planes.append({
                    "planeId": plane_id,
                    "totalFlights": len(flights),
                    "lastFlight": last_flight
                })

        return {"planes": planes}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get planes: {str(e)}"
        )
