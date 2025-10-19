from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import flights_router, gantt_router

# Create FastAPI application
app = FastAPI(
    title="Aviation Plane Scheduling System",
    description="API for managing flight schedules and generating Gantt charts",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js default port
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(flights_router)
app.include_router(gantt_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Aviation Plane Scheduling System API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "flights": "/api/v1/flights",
            "bulk_flights": "/api/v1/flights/bulk",
            "planes": "/api/v1/planes",
            "gantt_trips": "/api/v1/gantt/trips",
            "gantt_ground_time": "/api/v1/gantt/ground-time"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
