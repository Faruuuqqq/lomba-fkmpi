# E2E Testing for MITRA AI Platform

This directory contains comprehensive end-to-end tests for the MITRA AI platform's analytics and new AI features.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Playwright browsers installed (`npm run test:e2e:install`)

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Run tests with UI
npm run test:e2e:ui

# Generate test code
npm run test:e2e:generate-code

# View test report
npm run test:e2e:report
```

## 📁 Test Structure

```
tests/e2e/
├── fixtures/
│   ├── test-creds.ts          # Test credentials and project data
│   └── page-fixtures.ts      # Custom Playwright fixtures
├── utils/
│   ├── test-helpers.ts       # Helper functions for common actions
│   └── cleanup.ts           # Test data cleanup utilities
├── reasoning-map.spec.ts     # Tests for reasoning map generation
├── ethics-check.spec.ts       # Tests for ethics checking
├── analytics.spec.ts         # Tests for analytics dashboard
├── complete-workflow.spec.ts # Tests for complete user workflows
├── setup.ts                 # Global test setup
└── README.md               # This file
```

## 🧪 Test Coverage

### 1. Reasoning Map Generation Tests
- ✅ Successful map generation
- ✅ Error handling for empty content
- ✅ Data persistence
- ✅ Multiple map generations
- ✅ Loading states
- ✅ Network error handling

### 2. Ethics Checking Tests
- ✅ Successful ethics analysis
- ✅ Identification of ethical issues
- ✅ No issues for ethical content
- ✅ Error handling for empty content
- ✅ Loading states
- ✅ Multiple ethics checks
- ✅ Network error handling
- ✅ Detailed issue explanations

### 3. Analytics Dashboard Tests
- ✅ Dashboard display
- ✅ Zero usage for new users
- ✅ Usage tracking for reasoning maps
- ✅ Usage tracking for ethics checks
- ✅ Combined feature usage
- ✅ Feature usage breakdown
- ✅ Performance metrics
- ✅ Empty state handling
- ✅ Real-time updates
- ✅ Navigation
- ✅ Error handling
- ✅ Response time calculations

### 4. Complete Workflow Tests
- ✅ Full user journey (registration → AI features → analytics)
- ✅ Multiple projects with AI features
- ✅ Data persistence across sessions
- ✅ Concurrent request handling
- ✅ Content validation
- ✅ Different content types

## 🎯 Key Test Features

### Smart Test Data Management
- Automatic cleanup of test projects
- Isolated test environments
- Configurable test credentials

### Robust Error Testing
- Network failure simulation
- Empty content validation
- Loading state verification
- Error message display

### Analytics Verification
- Real-time usage tracking
- Performance metric validation
- Data persistence checks
- Multi-user scenarios

### Complete User Workflows
- Registration to project completion
- AI feature integration testing
- Cross-feature data consistency

## 🔧 Configuration

### Environment Variables
```bash
FRONTEND_URL=http://localhost:3000    # Frontend application URL
DATABASE_URL=postgresql://...        # Test database URL
```

### Playwright Configuration
- Multi-browser support (Chrome, Firefox, Safari)
- Automatic server startup
- Screenshot/video on failure
- Trace files for debugging

## 📊 Test Data

### Test Projects
- **Sample**: Educational essay about AI in education (150+ words)
- **Minimal**: Short content for validation testing
- **Various**: Scientific, philosophical, and controversial content

### Test Users
- Unique email addresses for test isolation
- Standardized test passwords
- Configurable user names

## 🛠️ Test Utilities

### TestHelpers Class
Common actions including:
- User registration/login
- Project creation
- AI feature usage
- Analytics navigation
- Data cleanup

### Custom Fixtures
- `testHelpers`: Pre-configured helper instance
- `authenticatedPage`: Page with logged-in user

## 📝 Best Practices

### Test Isolation
- Each test runs with clean state
- Unique test data for each test
- Automatic cleanup after tests

### Error Scenarios
- Network failures
- Invalid inputs
- Edge cases
- Loading states

### Performance Considerations
- Reasonable timeouts
- Parallel test execution
- Efficient selectors

## 🚨 Important Notes

### Before Running Tests
1. Ensure backend server is running
2. Install Playwright browsers
3. Configure test database
4. Check environment variables

### Test Dependencies
- Backend API must be accessible
- Database must allow test connections
- Frontend must compile successfully

## 🔍 Debugging

### When Tests Fail
1. Run with `--headed` flag to see browser
2. Use `--debug` mode for step-by-step execution
3. Check test reports and screenshots
4. Review trace files for detailed execution

### Common Issues
- **Timeout failures**: Increase timeout or check loading states
- **Element not found**: Verify selectors and component rendering
- **Network errors**: Check API endpoints and connectivity
- **Data persistence**: Verify database cleanup between tests

## 📈 Coverage Metrics

The E2E test suite covers:
- ✅ All new AI features (reasoning maps, ethics checking)
- ✅ Analytics dashboard functionality
- ✅ Complete user workflows
- ✅ Error handling and edge cases
- ✅ Cross-browser compatibility
- ✅ Performance and reliability

## 🚀 Continuous Integration

These tests are designed to run in CI/CD environments:
- Headless execution
- Parallel test running
- Automatic reporting
- Test result artifacts

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [Test Organization](https://playwright.dev/docs/test-organization)