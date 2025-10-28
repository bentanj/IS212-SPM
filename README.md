# IS212-SPM

## Testing

This project includes comprehensive testing across both frontend and backend.

### Running Tests

#### Frontend Tests
To run all frontend tests:
```bash
cd frontend
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
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
- **Purpose**: Test complete workflows and service interactions
- **Markers**: `@pytest.mark.integration`
- **Scope**: End-to-end functionality with real dependencies
- **Requirements**: Real database credentials for integration tests

### Test Configuration

#### Authentication Service
- **Read-only mode**: Configured for read-only operations only
- **OAuth 2.0**: Tests Google OAuth flow with PKCE
- **Database**: PostgreSQL with connection pooling
- **Note**: Integration tests automatically skip when no real database credentials are available

#### Tasks Service
- **Full CRUD**: Complete task management functionality
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API**: RESTful endpoints with proper error handling

### Test Environment Setup

#### Prerequisites
- Python 3.12 (recommended for CI/CD compatibility)
- pytest and pytest-cov
- Service-specific dependencies

#### Environment Variables
Each service requires its own `.env` file with:
- Database connection strings
- OAuth credentials (for Authentication service)
- Service-specific configuration

### Test Coverage

Tests cover:
- **Core functionality**: All business logic and API endpoints
- **Error handling**: Invalid inputs, network failures, database errors
- **Security**: Authentication, authorization, input validation
- **Integration**: Service-to-service communication
- **Edge cases**: Boundary conditions and error scenarios

### Continuous Integration

Tests are designed to run in CI/CD pipelines:
- **Docker-based**: Consistent environment across platforms
- **Parallel execution**: Services can be tested independently
- **XML reporting**: JUnit-compatible test results
- **Coverage reporting**: Code coverage metrics (Tasks service only)

### Troubleshooting

#### Common Issues
1. **Python version mismatch**: Use Python 3.12 for consistency with CI/CD
2. **Missing dependencies**: Run `pip install -r requirements.txt`
3. **Database connection**: Ensure PostgreSQL is accessible
4. **Integration test credentials**: Provide real database credentials for integration tests

#### Getting Help
- Check service-specific test documentation
- Review test output for specific error messages
- Ensure all environment variables are properly configured