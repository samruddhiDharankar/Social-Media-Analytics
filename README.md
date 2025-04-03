# Social Media Analytics Platform

A full-stack web application for analyzing social media data from multiple sources. The application allows users to create tasks for data collection and visualization.

## Features

- Create data collection tasks with custom filters
- Real-time task status monitoring
- Data visualizations using D3.js

## Tech Stack

- Backend: Python FastAPI
- Frontend: React with TypeScript
- Database: SQLite with SQLAlchemy
- Visualization: D3.js
- Job Queue: Python asyncio

## Project Structure

```
├── backend/             # FastAPI backend
│   ├── app/            # Application code
│   └── requirements.txt # Python dependencies
├── frontend/           # React frontend
│   ├── src/           # Source code
│   ├── public/        # Static files
│   └── package.json   # Node dependencies
└── data/              # Mock data files
```

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Run the backend server:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm start
```

## API Documentation

Once the backend server is running, visit `http://localhost:8000/docs` for the interactive API documentation.

## Data Sources

The application uses mock data from two sources:
1. Twitter/X API data (JSON format)
2. Instagram API data (CSV format)

Both sources contain overlapping fields such as:
- Post ID
- Timestamp
- Engagement metrics (likes, comments, shares)
- Hashtags
- Content type 