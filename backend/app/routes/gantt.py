from fastapi import APIRouter, HTTPException, status, Query
from typing import List
from ..schemas import GanttTripsResponse, GanttGroundTimeResponse
from ..services import FlightService, GanttService

router = APIRouter(prefix="/api/v1/gantt", tags=["gantt"])
flight_service = FlightService()
gantt_service = GanttService(flight_service)


@router.get("/trips", response_model=GanttTripsResponse)
async def get_trips(
    planeIds: str = Query(..., description="Comma-separated list of plane IDs"),
    startTime: str = Query(..., description="ISO 8601 start time"),
    endTime: str = Query(..., description="ISO 8601 end time")
):
    """Get trip schedule data for Gantt chart"""
    try:
        # Parse comma-separated plane IDs
        plane_id_list = [pid.strip() for pid in planeIds.split(',')]

        if not plane_id_list:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one plane ID must be provided"
            )

        # Validate datetime formats
        from datetime import datetime
        try:
            datetime.fromisoformat(startTime.replace('Z', '+00:00'))
            datetime.fromisoformat(endTime.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid datetime format. Use ISO 8601 format"
            )

        # Get trips data
        result = gantt_service.get_trips_data(plane_id_list, startTime, endTime)

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get trips data: {str(e)}"
        )


@router.get("/ground-time", response_model=GanttGroundTimeResponse)
async def get_ground_time(
    planeIds: str = Query(..., description="Comma-separated list of plane IDs"),
    startTime: str = Query(..., description="ISO 8601 start time"),
    endTime: str = Query(..., description="ISO 8601 end time")
):
    """Get ground time schedule data for Gantt chart"""
    try:
        # Parse comma-separated plane IDs
        plane_id_list = [pid.strip() for pid in planeIds.split(',')]

        if not plane_id_list:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one plane ID must be provided"
            )

        # Validate datetime formats
        from datetime import datetime
        try:
            datetime.fromisoformat(startTime.replace('Z', '+00:00'))
            datetime.fromisoformat(endTime.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid datetime format. Use ISO 8601 format"
            )

        # Get ground time data
        result = gantt_service.get_ground_time_data(plane_id_list, startTime, endTime)

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get ground time data: {str(e)}"
        )
