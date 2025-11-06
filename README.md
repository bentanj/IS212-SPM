# IS212-SPM

## Setup

This guide will help you set up and run the project locally.

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Docker** (version 20.10 or higher)
   - Download from: https://docs.docker.com/get-docker/
   - Docker Desktop includes Docker Compose, which is required for this project
   - Verify installation: `docker --version` and `docker compose version`

2. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - npm comes bundled with Node.js
   - Verify installation: `node --version` and `npm --version`

3. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/downloads
   - Verify installation: `git --version`

4. **PostgreSQL Database**
   - You'll need access to a PostgreSQL database (local or cloud-hosted like Supabase)
   - Note down your database credentials for the environment configuration

5. **Google OAuth Credentials** (for authentication)
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google OAuth API
   - Create OAuth 2.0 credentials and note down the Client ID and Client Secret

6. **Supabase Account** (for file attachments)
   - Sign up at https://supabase.com/
   - Create a new project
   - Get your project URL and service role key from Project Settings > API

### Environment Configuration

This project requires two separate `.env` files:

#### 1. Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
```

Create `.env` with the following content:

```bash
# Backend API Port
TASK_PORT=8000

# NextAuth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET="your_auth_secret_here"

# Google OAuth Credentials (same as backend)
AUTH_GOOGLE_ID="your_google_client_id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your_google_client_secret"
```

#### 2. Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
```

Create `.env` with the following content:

```bash
# Frontend Configuration
FRONTEND_ORIGIN=http://localhost:3000
ENV=dev
SQLALCHEMY_ECHO=false

# Database Configuration
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Session Configuration (generate with: openssl rand -base64 32)
SECRET_KEY=your_secret_key_here

# JWT Configuration (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Supabase Configuration (for file attachments)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
STORAGE_BUCKET=task-attachments
MAX_FILE_SIZE_BYTES=52428800
```

**Important Notes:**
- Replace all placeholder values (starting with `your_`) with your actual credentials
- For Google OAuth, ensure the same Client ID and Secret are used in both frontend and backend
- Generate secure random strings for `AUTH_SECRET`, `SECRET_KEY`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` using: `openssl rand -base64 32`
- Make sure your Supabase project has a storage bucket named `task-attachments` (or update the `STORAGE_BUCKET` value)

### Running the Application

#### Option 1: Using the Start Script (Recommended)

The easiest way to start the entire application is using the provided script:

```bash
./start-app.sh
```

This script will:
- Clear any processes running on port 3000
- Stop and rebuild all backend Docker containers
- Start all backend services (nginx proxy, tasks, users, taskattachments)
- Install frontend dependencies
- Start the frontend development server

**To stop the application:**
Press `Ctrl+C` in the terminal where the script is running. This will gracefully shut down both frontend and backend services.

#### Option 2: Manual Setup

If you prefer to start services individually:

**Backend:**
```bash
cd backend
docker compose down          # Stop existing containers
docker compose up -d --build # Build and start all services
```

The backend will be available at `http://localhost:8000`

**Frontend:**
```bash
cd frontend
npm install    # Install dependencies (first time only)
npm run dev    # Start development server
```

The frontend will be available at `http://localhost:3000`

### Verifying the Setup

Once everything is running:

1. **Backend API**: Visit http://localhost:8000 to check if the backend is responding
2. **Frontend**: Visit http://localhost:3000 to access the application
3. **Docker Containers**: Run `docker ps` to see all running containers:
   - `backend_proxy` (nginx)
   - `tasks_app`
   - `users_app`
   - `taskattachments_app`

### Troubleshooting Setup

**Port 3000 already in use:**
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

**Docker containers not starting:**
- Ensure Docker Desktop is running
- Check Docker logs: `docker compose logs -f`
- Verify `.env` file is properly configured in the `backend` directory

**Frontend dependencies issues:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Database connection errors:**
- Verify database credentials in `backend/.env`
- Ensure the database server is accessible
- Check that `DB_HOST` and `DB_PORT` are correct
- Test connection: `telnet your_db_host 5432`

**OAuth authentication not working:**
- Ensure Google OAuth credentials are identical in both `frontend/.env` and `backend/.env`
- Verify redirect URI in Google Cloud Console matches `GOOGLE_REDIRECT_URI`
- Check that `http://localhost:3000/auth/callback` is added as an authorized redirect URI

**File upload errors:**
- Verify Supabase credentials in `backend/.env`
- Ensure the storage bucket exists in your Supabase project
- Check bucket permissions allow service role access

## Testing

This project includes comprehensive testing across both frontend and backend.


### Running Tests

#### Frontend Tests
To run all frontend tests:
```bash
cd frontend
npm run build           # Tests build
npm test                # Run all tests
```

#### All Backend Tests
To run all backend tests across all services:
```bash
cd backend
./test-all.sh
```

#### Individual Service Tests
Each service has its own test scripts:

**Example Service:**
```bash
cd backend/Example
./Scripts/test-unit.sh      # Unit tests only
./Scripts/test-integration.sh  # Integration tests only
```


### Test Structure

#### Frontend Tests
- **Framework**: Jest with React Testing Library
- **Location**: Co-located with components or in `/src/utils/_Tests/`
- **Types**:
  - Component tests: UI rendering, user interactions, state management
  - Utility tests: Pure function logic, data transformations
  - Integration tests: API calls, form submissions
- **Configuration**: `jest.config.ts` with Next.js integration

#### Backend Unit Tests
- **Purpose**: Test individual components in isolation
- **Markers**: `@pytest.mark.unit`
- **Scope**: Functions, classes, and methods without external dependencies
- **Speed**: Fast execution, no database or network calls

#### Backend Integration Tests
- **Purpose**: Test complete workflows and API endpoints
- **Markers**: `@pytest.mark.integration`
- **Scope**: End-to-end API testing with mocked external dependencies
- **Requirements**: No external database required (tests use mocks)


### Test Environment Setup

#### Prerequisites
- Python 3.12
- pytest and pytest-cov
- Service-specific dependencies


### Test Coverage

Tests cover:
- **Core functionality**: Business logic and API endpoints
- **Error handling**: Invalid inputs, network failures, database errors
- **Integration**: API endpoint workflows (with mocked external dependencies)
- **Edge cases**: Boundary conditions and error scenarios


### Continuous Integration

Tests run automatically in GitHub Actions CI/CD pipeline:
- **Automated**: Triggers on push to main and pull requests
- **Matrix strategy**: Backend services tested independently in parallel
- **Integration tests**: Optional via manual workflow dispatch or repository variable
- **XML reporting**: JUnit-compatible test results for all services


### Troubleshooting

- Check service-specific test documentation
- Review test output for specific error messages
- Integration tests use mocks, so no external credentials needed