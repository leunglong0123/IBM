# Aviation Plane Scheduling System

A full-stack web application for visualizing flight schedules and ground time for aircraft maintenance planning.

## Features

- **Trip Schedule Gantt Chart**: Visualize flight routes and timings for multiple planes
- **Ground Time Gantt Chart**: View maintenance windows and ground time periods
- **Interactive Filters**: Select planes and time ranges dynamically
- **RESTful API**: FastAPI backend with comprehensive endpoints
- **Modern UI**: Next.js frontend with Shadcn UI components

## Technology Stack

### Backend
- Python 3.14.0
- FastAPI
- CSV-based data storage
- Uvicorn ASGI server

### Frontend
- Next.js 15 (React)
- TypeScript
- Tailwind CSS
- Shadcn UI
- date-fns

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   ├── schemas/             # Pydantic models
│   │   └── utils/               # Utilities
│   ├── data/                    # CSV data storage
│   ├── requirements.txt         # Python dependencies
│   ├── load_sample_data.py      # Sample data loader
│   └── sample_data.json         # Sample flight data
├── frontend/
│   ├── app/                     # Next.js app directory
│   ├── components/              # React components
│   ├── services/                # API client
│   ├── types/                   # TypeScript interfaces
│   └── package.json             # Node dependencies
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.14.0 or higher
- Node.js 18+ and npm
- Git (optional)

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Load sample data**:
   ```bash
   python load_sample_data.py
   ```

   This will create a `data/flights.csv` file with sample flight records.

5. **Start the backend server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`
   - API docs: `http://localhost:8000/docs`
   - Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to the frontend directory** (in a new terminal):
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Usage

### Using the Application

1. **Open the dashboard**: Navigate to `http://localhost:3000` in your browser

2. **Select planes**: Check the planes you want to visualize in the sidebar

3. **Set time range**: Use the date range picker or quick presets (Today, 3 Days, Week)

4. **View charts**: Toggle between "Trip Schedule" and "Ground Time" tabs

5. **Interact**: Hover over chart bars to see detailed information

### API Endpoints

#### Get All Planes
```bash
GET http://localhost:8000/api/v1/planes
```

#### Get Trip Schedule
```bash
GET http://localhost:8000/api/v1/gantt/trips?planeIds=PLANE_A,PLANE_B&startTime=2022-01-01T00:00:00Z&endTime=2022-01-03T23:59:59Z
```

#### Get Ground Time
```bash
GET http://localhost:8000/api/v1/gantt/ground-time?planeIds=PLANE_A,PLANE_B&startTime=2022-01-01T00:00:00Z&endTime=2022-01-03T23:59:59Z
```

#### Create Flight
```bash
POST http://localhost:8000/api/v1/flights
Content-Type: application/json

{
  "planeId": "PLANE_A",
  "origin": "HKG",
  "destination": "NRT",
  "departureTime": "2022-01-02T01:25:00Z",
  "arrivalTime": "2022-01-02T05:55:00Z"
}
```

#### Get All Flights
```bash
GET http://localhost:8000/api/v1/flights?planeId=PLANE_A&limit=100
```

## Sample Data

The system comes with sample data for 3 planes:
- **PLANE_A**: 3 flights (HKG → NRT → TPE → HKG)
- **PLANE_B**: 3 flights (TPE → LAX → JFK → LHR)
- **PLANE_C**: 5 flights (HKG → SIN → BKK → HKG → ICN → NRT)

Time range: January 1-3, 2022

## Development

### Running Tests

Backend tests (when implemented):
```bash
cd backend
pytest
```

Frontend tests (when implemented):
```bash
cd frontend
npm test
```

### Adding New Flight Data

You can add flights through the API or by modifying `backend/data/flights.csv`.

Example using curl:
```bash
curl -X POST http://localhost:8000/api/v1/flights \
  -H "Content-Type: application/json" \
  -d '{
    "planeId": "PLANE_D",
    "origin": "SFO",
    "destination": "LAX",
    "departureTime": "2022-01-02T10:00:00Z",
    "arrivalTime": "2022-01-02T11:30:00Z"
  }'
```

## Architecture

### Backend Architecture

- **FastAPI**: High-performance async web framework
- **CSV Storage**: Simple file-based storage for development
- **Service Layer**: Business logic separated from routes
- **Pydantic Schemas**: Data validation and serialization

### Frontend Architecture

- **Next.js App Router**: Modern React framework with server components
- **TypeScript**: Type-safe development
- **Component-based**: Reusable UI components
- **API Service Layer**: Centralized API communication

### Ground Time Calculation Algorithm

The ground time algorithm calculates periods when a plane is on the ground:

1. Get all flights for a plane within the time range
2. Sort flights by departure time
3. Calculate ground time before the first flight (if it starts after range start)
4. Calculate ground time between consecutive flights
5. Calculate ground time after the last flight (if it ends before range end)

## Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError` when running the backend
- **Solution**: Make sure you've activated the virtual environment and installed dependencies

**Issue**: Port 8000 already in use
- **Solution**: Either kill the process using port 8000 or run on a different port:
  ```bash
  uvicorn app.main:app --reload --port 8001
  ```
  Remember to update `frontend/.env.local` accordingly.

### Frontend Issues

**Issue**: API connection refused
- **Solution**: Make sure the backend is running on `http://localhost:8000`

**Issue**: No data displayed
- **Solution**: Check that sample data was loaded successfully. Run `python load_sample_data.py` again.

**Issue**: Date picker not working
- **Solution**: Make sure your browser supports `datetime-local` input type. Use Chrome or Firefox.

## Future Enhancements

- [ ] PostgreSQL database integration
- [ ] Real-time updates with WebSocket
- [ ] Export charts as PNG/PDF
- [ ] Advanced filtering by route and duration
- [ ] Automated maintenance scheduling
- [ ] User authentication
- [ ] Multi-tenant support

## License

This project was created for an interview code test.

## Contact

For questions or issues, please contact the development team.
