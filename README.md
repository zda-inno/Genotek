# Genotek Project

This project consists of a Python backend API and a React frontend application.

## Project Structure

```
.
├── backend/             # Python backend application
│   ├── app/             # Application code
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Core functionality
│   │   ├── models/      # Database models
│   │   └── services/    # Business logic
│   ├── tests/           # Backend tests
│   └── pyproject.toml   # Project metadata and dependencies
│
├── frontend/            # React frontend application
│   ├── public/          # Static files
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/             # Source code
│   │   ├── components/  # React components
│   │   │   ├── common/  # Common UI components
│   │   │   ├── layout/  # Layout components
│   │   │   └── tree/    # Tree visualization components
│   │   ├── constants/   # Application constants
│   │   ├── features/    # Feature-specific code
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── theme/       # Theme configuration
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Utility functions
│   └── package.json     # Node.js dependencies
```

## Setup Instructions

### Backend Setup

1. Install uv (if not already installed):
```bash
pip install uv
```

2. Install dependencies and create virtual environment:
```bash
cd backend
uv sync
```

3. Run the development server:
```bash
uv run uvicorn app.main:app --reload
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

## Development

- Backend API runs on http://localhost:8000
- Frontend development server runs on http://localhost:3000
