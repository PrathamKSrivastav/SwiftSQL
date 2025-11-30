# SwiftSQL

**Natural Language to SQL Query Converter**

SwiftSQL is an intelligent web application that converts natural language queries into SQL statements using advanced AI technology. Built with a modern microservices architecture, it enables users without SQL expertise to interact with databases using everyday language.

## Features

- **Natural Language Processing**: Convert plain English queries to accurate SQL statements
- **Intuitive Web Interface**: Clean, responsive UI built with React 18 and Tailwind CSS
- **Real-time Query Generation**: Instant SQL generation powered by AI models
- **Query History**: Track and reuse previous conversions
- **Syntax Highlighting**: Clear SQL output with proper formatting
- **Copy to Clipboard**: Quick copy functionality for generated queries
- **Dark Mode Support**: Eye-friendly interface for extended usage

## Architecture

SwiftSQL follows a **microservices architecture** with clear separation of concerns:

- **Frontend**: React 18 + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI (Python) + Node.js
- **AI/ML**: Seq2seq model for natural language to SQL conversion
- **Database**: MySQL for data storage
- **Authentication**: Google OAuth 2.0
- **State Management**: Zustand
- **HTTP Client**: Axios + React Query

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- shadcn/ui components
- Zustand for state management
- Axios + React Query for API calls
- @react-oauth/google for authentication

### Backend
- **Python Service**: FastAPI for AI model inference
- **Node.js Service**: Express.js for API management
- **Database**: MySQL
- **Authentication**: Google OAuth 2.0

### DevOps
- Docker & Docker Compose
- Vercel (Frontend deployment)
- Render (Backend deployment)
- 
## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/PrathamKSrivastav/SwiftSQL.git
cd SwiftSQL
```

### 2. Environment Setup

Create `.env` files for both services:

**Backend (.env)**
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=swiftsql

# API Keys
JWT_SECRET=your_jwt_secret
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_client_id
```

### 3. Backend Setup

#### Python Service
```bash
cd backend/python-service
pip install -r requirements.txt
python main.py
```

#### Node.js Service
```bash
cd backend/node-service
npm install
npm run dev  # Uses nodemon for hot reload
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Database Setup

```bash
mysql -u root -p
CREATE DATABASE swiftsql;
# Run migrations
```

## Docker Setup

```bash
docker-compose up --build
```

This will start all services:
- Frontend: `http://localhost:5173`
- Python API: `http://localhost:8000`
- Node.js API: `http://localhost:3000`

## Usage

1. **Sign in** with your Google account
2. **Enter** your natural language query
   - Example: "Show me all users who registered in the last 30 days"
3. **Generate** SQL query with one click
4. **Copy** the generated SQL to your clipboard
5. **View** your query history for quick access

## Model Architecture

SwiftSQL uses a **Seq2seq (Sequence-to-Sequence) model** for natural language to SQL conversion:

- **Encoder**: Processes natural language input and creates contextual embeddings
- **Attention Mechanism**: Focuses on relevant parts of the input for accurate translation
- **Decoder**: Generates syntactically correct SQL statements
- **Post-processing**: Formats and validates the output query

## API Endpoints

### Python Service (FastAPI)
```
POST /api/generate-sql
  Body: { "query": "natural language query" }
  Response: { "sql": "generated SQL statement" }
```

### Node.js Service
```
POST /api/auth/google
  Body: { "token": "google_oauth_token" }
  Response: { "user": {...}, "jwt": "..." }

GET /api/history
  Headers: { "Authorization": "Bearer <token>" }
  Response: { "queries": [...] }
```

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Project Structure

```
SwiftSQL/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand state management
│   │   └── api/            # API integration
├── backend/
│   ├── python-service/     # FastAPI + ML model
│   │   ├── model/          # Seq2seq model
│   │   └── api/            # FastAPI routes
│   └── node-service/       # Express.js API
│       ├── routes/         # API routes
│       └── middleware/     # Auth middleware
├── docker-compose.yml
└── README.md
```

## Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### Backend (Render)
- Connect your GitHub repository
- Configure environment variables
- Deploy both Python and Node.js services
