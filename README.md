# IS212-SPM

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