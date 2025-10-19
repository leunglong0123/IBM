from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import List, Optional, TypedDict


class Flight(TypedDict):
    """Internal type for flight data as stored in CSV"""
    id: str
    plane_id: str
    origin: str
    destination: str
    departure_time: str
    arrival_time: str
    created_at: str


class FlightCreate(BaseModel):
    """Schema for creating a new flight"""
    planeId: str = Field(..., min_length=1, description="Plane identifier")
    origin: str = Field(..., min_length=3, max_length=10, description="IATA airport code")
    destination: str = Field(..., min_length=3, max_length=10, description="IATA airport code")
    departureTime: str = Field(..., description="ISO 8601 departure time")
    arrivalTime: str = Field(..., description="ISO 8601 arrival time")

    @field_validator('departureTime', 'arrivalTime')
    @classmethod
    def validate_datetime(cls, v: str) -> str:
        """Validate ISO 8601 datetime format"""
        try:
            datetime.fromisoformat(v.replace('Z', '+00:00'))
        except ValueError:
            raise ValueError('Invalid ISO 8601 datetime format')
        return v

    @field_validator('arrivalTime')
    @classmethod
    def validate_arrival_after_departure(cls, v: str, info) -> str:
        """Validate that arrival is after departure"""
        if 'departureTime' in info.data:
            departure = datetime.fromisoformat(info.data['departureTime'].replace('Z', '+00:00'))
            arrival = datetime.fromisoformat(v.replace('Z', '+00:00'))
            if arrival <= departure:
                raise ValueError('Arrival time must be after departure time')
        return v


class FlightResponse(FlightCreate):
    """Schema for flight response"""
    id: int
    createdAt: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "planeId": "PLANE_A",
                "origin": "HKG",
                "destination": "NRT",
                "departureTime": "2022-01-01T00:00:00Z",
                "arrivalTime": "2022-01-01T05:00:00Z",
                "createdAt": "2024-01-15T10:30:00Z"
            }
        }
    }


class BulkFlightCreate(BaseModel):
    """Schema for bulk flight creation"""
    flights: List[FlightCreate]


class BulkFlightResponse(BaseModel):
    """Schema for bulk flight creation response"""
    created: int
    failed: int
    errors: List[str] = []


class Trip(BaseModel):
    """Schema for a single trip"""
    id: int
    route: str
    origin: str
    destination: str
    startTime: str
    endTime: str
    durationMinutes: int


class GroundPeriod(BaseModel):
    """Schema for a ground time period"""
    location: str
    startTime: str
    endTime: str
    durationMinutes: int


class PlaneTrips(BaseModel):
    """Schema for trips of a single plane"""
    planeId: str
    trips: List[Trip]


class PlaneGroundTime(BaseModel):
    """Schema for ground time of a single plane"""
    planeId: str
    groundPeriods: List[GroundPeriod]


class GanttTripsResponse(BaseModel):
    """Schema for Gantt trips response"""
    title: str
    startTime: str
    endTime: str
    planes: List[PlaneTrips]


class GanttGroundTimeResponse(BaseModel):
    """Schema for Gantt ground time response"""
    title: str
    startTime: str
    endTime: str
    planes: List[PlaneGroundTime]
