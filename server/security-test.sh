#!/bin/bash

# MITRA AI - Security Test Runner
# This script runs comprehensive security tests for the authentication system

echo "🔒 MITRA AI Security Test Suite"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run tests
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${YELLOW}Running $test_name...${NC}"
    
    if eval $test_command; then
        echo -e "${GREEN}✓ $test_name PASSED${NC}"
        return 0
    else
        echo -e "${RED}✗ $test_name FAILED${NC}"
        return 1
    fi
}

# Test categories
BRUTE_FORCE_TESTS="Brute Force Protection Tests"
INPUT_VALIDATION_TESTS="Input Validation Tests"
RATE_LIMITING_TESTS="Rate Limiting Tests"
ACCOUNT_LOCKOUT_TESTS="Account Lockout Tests"
RECAPTCHA_TESTS="reCAPTCHA Tests"
INTEGRATION_TESTS="Integration Tests"

# Run test suites
echo ""
echo "🛡️  Testing Brute Force Protection..."
run_test "SQL Injection Protection" "npm run test:security:sql-injection"
run_test "XSS Protection" "npm run test:security:xss"
run_test "Common Password Detection" "npm run test:security:common-passwords"

echo ""
echo "📝 Testing Input Validation..."
run_test "Email Validation" "npm run test:security:email-validation"
run_test "Password Complexity" "npm run test:security:password-complexity"
run_test "Input Sanitization" "npm run test:security:input-sanitization"

echo ""
echo "⏱️  Testing Rate Limiting..."
run_test "IP-based Rate Limiting" "npm run test:security:rate-limit-ip"
run_test "Endpoint Rate Limiting" "npm run test:security:rate-limit-endpoint"
run_test "Rate Limit Headers" "npm run test:security:rate-limit-headers"

echo ""
echo "🔒 Testing Account Lockout..."
run_test "Failed Login Tracking" "npm run test:security:failed-attempts"
run_test "Account Lockout Mechanism" "npm run test:security:account-lockout"
run_test "Lockout Duration" "npm run test:security:lockout-duration"

echo ""
echo "🤖 Testing Bot Detection..."
run_test "reCAPTCHA Integration" "npm run test:security:recaptcha"
run_test "User Agent Detection" "npm run test:security:user-agent"
run_test "Risk Assessment" "npm run test:security:risk-assessment"

echo ""
echo "🔗 Testing Integration Security..."
run_test "Security End-to-End" "npm run test:security:e2e"
run_test "CORS Configuration" "npm run test:security:cors"
run_test "Error Handling" "npm run test:security:error-handling"

echo ""
echo "📊 Security Test Summary"
echo "======================"

# Run comprehensive security scan
echo "Running comprehensive security analysis..."
npm run test:security:comprehensive

echo ""
echo "🎯 Security Recommendations"
echo "========================"

# Check environment variables
if [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}⚠️  JWT_SECRET not set${NC}"
else
    echo -e "${GREEN}✓ JWT_SECRET is configured${NC}"
fi

if [ -z "$RECAPTCHA_SECRET_KEY" ]; then
    echo -e "${YELLOW}⚠️  RECAPTCHA_SECRET_KEY not set (Production only)${NC}"
else
    echo -e "${GREEN}✓ reCAPTCHA keys are configured${NC}"
fi

# Check database security
echo "Checking database connection security..."
npm run security:check-database

# Check CORS configuration
echo "Checking CORS configuration..."
npm run security:check-cors

echo ""
echo "🔍 Additional Security Checks"

# Check for common vulnerabilities
echo "Running automated vulnerability scan..."
npm audit --audit-level moderate

# Check code security
echo "Running code security analysis..."
npx eslint --ext .ts src/ --config .eslintrc.security.js

echo ""
echo "📈 Performance Impact Analysis"
echo "=============================="

# Test response times under security load
echo "Measuring security overhead..."
npm run test:security:performance

echo ""
echo "✅ Security Test Suite Complete!"
echo "================================"

# Generate security report
echo "Generating security report..."
npm run security:report

echo ""
echo "📋 Security Report Generated: security-report.html"
echo "📋 Detailed logs: security-test.log"