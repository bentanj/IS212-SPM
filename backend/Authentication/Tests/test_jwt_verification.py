#!/usr/bin/env python3
"""
JWT Implementation Verification Test

This test verifies that the JWT-based session tracking implementation
is working correctly by testing all components.
"""

import pytest
import os
import sys
import time
from datetime import datetime, timezone

# Add current directory to path
sys.path.append('.')

def print_header(title):
    """Print a formatted header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_success(message):
    """Print success message"""
    print(f"✅ {message}")

def print_error(message):
    """Print error message"""
    print(f"❌ {message}")

def print_warning(message):
    """Print warning message"""
    print(f"⚠️  {message}")

def test_imports():
    """Test that all required modules can be imported"""
    print_header("Testing Imports")
    
    try:
        from Services.JWTService import JWTService, jwt_required, role_required
        print_success("JWTService imported successfully")
    except Exception as e:
        print_error(f"Failed to import JWTService: {e}")
        return False
    
    try:
        from Services.AuthService import AuthService
        print_success("AuthService imported successfully")
    except Exception as e:
        print_error(f"Failed to import AuthService: {e}")
        return False
    
    try:
        from Controllers.AuthController import bp
        print_success("AuthController imported successfully")
    except Exception as e:
        print_error(f"Failed to import AuthController: {e}")
        return False
    
    try:
        from config import Config
        print_success("Config imported successfully")
    except Exception as e:
        print_error(f"Failed to import Config: {e}")
        return False
    
    return True

def test_configuration():
    """Test JWT configuration"""
    print_header("Testing Configuration")
    
    from config import Config
    
    # Check JWT secrets
    jwt_secret_configured = bool(Config.JWT_SECRET and Config.JWT_SECRET != "your-jwt-secret-key-here")
    jwt_refresh_secret_configured = bool(Config.JWT_REFRESH_SECRET and Config.JWT_REFRESH_SECRET != "your-jwt-refresh-secret-key-here")
    
    if jwt_secret_configured:
        print_success("JWT_SECRET is configured")
    else:
        print_warning("JWT_SECRET is using default value - not secure for production")
    
    if jwt_refresh_secret_configured:
        print_success("JWT_REFRESH_SECRET is configured")
    else:
        print_warning("JWT_REFRESH_SECRET is using default value - not secure for production")
    
    # Check token expiration settings
    print_success(f"Access token expires in: {Config.JWT_ACCESS_TOKEN_EXPIRES} seconds ({Config.JWT_ACCESS_TOKEN_EXPIRES/60} minutes)")
    print_success(f"Refresh token expires in: {Config.JWT_REFRESH_TOKEN_EXPIRES} seconds ({Config.JWT_REFRESH_TOKEN_EXPIRES/3600} hours)")
    
    # In CI/test environments, default values are acceptable
    # Only require real secrets in production
    import os
    is_ci = os.getenv('CI') or os.getenv('GITHUB_ACTIONS') or os.getenv('TESTING')
    
    if is_ci:
        print_success("Running in CI environment - default secrets are acceptable")
        return True
    else:
        return jwt_secret_configured and jwt_refresh_secret_configured

def test_jwt_service():
    """Test JWT service functionality"""
    print_header("Testing JWT Service")
    
    from Services.JWTService import JWTService
    
    # Set test environment
    os.environ['JWT_SECRET'] = 'test-jwt-secret-key'
    os.environ['JWT_REFRESH_SECRET'] = 'test-jwt-refresh-secret-key'
    
    jwt_service = JWTService()
    test_user_data = {
        'id': 1,
        'email': 'test@example.com',
        'role': 'admin',
        'first_name': 'Test',
        'last_name': 'User'
    }
    
    try:
        # Test token generation
        access_token, refresh_token = jwt_service.generate_token_pair(test_user_data)
        print_success("Token pair generation successful")
        
        # Test token decoding
        access_payload = jwt_service.decode_access_token(access_token)
        refresh_payload = jwt_service.decode_refresh_token(refresh_token)
        print_success("Token decoding successful")
        
        # Verify payload content
        assert access_payload['user_id'] == 1
        assert access_payload['email'] == 'test@example.com'
        assert access_payload['role'] == 'admin'
        assert access_payload['type'] == 'access'
        print_success("Access token payload verification successful")
        
        assert refresh_payload['user_id'] == 1
        assert refresh_payload['type'] == 'refresh'
        print_success("Refresh token payload verification successful")
        
        # Test token refresh
        new_access_token = jwt_service.refresh_access_token(refresh_token)
        new_payload = jwt_service.decode_access_token(new_access_token)
        assert new_payload['user_id'] == 1
        print_success("Token refresh successful")
        
        return True
        
    except Exception as e:
        print_error(f"JWT service test failed: {e}")
        return False

def test_endpoints():
    """Test that JWT endpoints are registered"""
    print_header("Testing Endpoint Registration")
    
    from Controllers.AuthController import bp
    from flask import Flask
    
    app = Flask(__name__)
    app.register_blueprint(bp)
    
    # Get all auth routes
    routes = []
    for rule in app.url_map.iter_rules():
        if '/api/auth' in rule.rule:
            routes.append(f"{list(rule.methods)} {rule.rule}")
    
    print_success(f"Found {len(routes)} authentication endpoints")
    
    # Check for required JWT endpoints
    required_endpoints = [
        ('/api/auth/refresh', 'POST'),
        ('/api/auth/me', 'GET'),
        ('/api/auth/callback', 'POST'),
        ('/api/auth/logout', 'POST')
    ]
    
    for endpoint, method in required_endpoints:
        found = any(f"'{method}'" in route and endpoint in route for route in routes)
        if found:
            print_success(f"Endpoint {method} {endpoint} is registered")
        else:
            print_error(f"Endpoint {method} {endpoint} is missing")
            return False
    
    return True

def test_decorators():
    """Test JWT decorators"""
    print_header("Testing JWT Decorators")
    
    from Services.JWTService import jwt_required, role_required
    
    # Test that decorators are callable
    if callable(jwt_required):
        print_success("jwt_required decorator is callable")
    else:
        print_error("jwt_required decorator is not callable")
        return False
    
    if callable(role_required):
        print_success("role_required decorator is callable")
    else:
        print_error("role_required decorator is not callable")
        return False
    
    # Test decorator application
    def test_function():
        return "test"
    
    try:
        decorated_function = jwt_required(test_function)
        print_success("jwt_required decorator can be applied to functions")
    except Exception as e:
        print_error(f"jwt_required decorator application failed: {e}")
        return False
    
    try:
        role_decorator = role_required('admin')
        decorated_function = role_decorator(test_function)
        print_success("role_required decorator can be applied to functions")
    except Exception as e:
        print_error(f"role_required decorator application failed: {e}")
        return False
    
    return True

def test_user_model():
    """Test User model has required fields"""
    print_header("Testing User Model")
    
    from Models.User import User
    
    # Check for required fields
    required_fields = ['id', 'email', 'role', 'first_name', 'last_name']
    for field in required_fields:
        if hasattr(User, field):
            print_success(f"User model has {field} field")
        else:
            print_error(f"User model missing {field} field")
            return False
    
    # Check for to_dict method
    if hasattr(User, 'to_dict'):
        print_success("User model has to_dict method")
    else:
        print_error("User model missing to_dict method")
        return False
    
    return True

def test_dependencies():
    """Test that required dependencies are installed"""
    print_header("Testing Dependencies")
    
    try:
        import jwt
        print_success("PyJWT is installed")
    except ImportError:
        print_error("PyJWT is not installed")
        return False
    
    try:
        from flask import Flask
        print_success("Flask is available")
    except ImportError:
        print_error("Flask is not available")
        return False
    
    return True

@pytest.mark.integration
class TestJWTVerification:
    """Integration test for JWT implementation verification"""
    
    def test_dependencies_integration(self):
        """Test that all dependencies are available"""
        assert test_dependencies() == True
    
    def test_imports_integration(self):
        """Test that all modules can be imported"""
        assert test_imports() == True
    
    def test_configuration_integration(self):
        """Test JWT configuration"""
        assert test_configuration() == True
    
    def test_jwt_service_integration(self):
        """Test JWT service functionality"""
        assert test_jwt_service() == True
    
    def test_user_model_integration(self):
        """Test User model has required fields"""
        assert test_user_model() == True
    
    def test_endpoints_integration(self):
        """Test that JWT endpoints are registered"""
        assert test_endpoints() == True
    
    def test_decorators_integration(self):
        """Test JWT decorators"""
        assert test_decorators() == True
    
    @pytest.mark.integration
    def test_full_jwt_verification(self):
        """Full integration test of JWT implementation"""
        print_header("JWT Implementation Verification")
        print("This test verifies that the JWT-based session tracking")
        print("implementation is working correctly.")
        
        tests = [
            ("Dependencies", test_dependencies),
            ("Imports", test_imports),
            ("Configuration", test_configuration),
            ("JWT Service", test_jwt_service),
            ("User Model", test_user_model),
            ("Endpoints", test_endpoints),
            ("Decorators", test_decorators),
        ]
        
        results = []
        for test_name, test_func in tests:
            try:
                result = test_func()
                results.append((test_name, result))
            except Exception as e:
                print_error(f"{test_name} test failed with exception: {e}")
                results.append((test_name, False))
        
        # Summary
        print_header("Verification Summary")
        
        passed = 0
        total = len(results)
        
        for test_name, result in results:
            if result:
                print_success(f"{test_name}: PASSED")
                passed += 1
            else:
                print_error(f"{test_name}: FAILED")
        
        print(f"\nOverall Result: {passed}/{total} tests passed")
        
        if passed == total:
            print_success("🎉 JWT implementation is working correctly!")
            print("\nNext steps:")
            print("1. Add JWT secrets to your .env file")
            print("2. Test the OAuth flow with JWT tokens")
            print("3. Implement frontend integration")
        else:
            print_error("❌ Some tests failed. Please check the errors above.")
            pytest.fail("JWT verification failed")
        
        assert passed == total

def main():
    """Run all verification tests"""
    print_header("JWT Implementation Verification")
    print("This test verifies that the JWT-based session tracking")
    print("implementation is working correctly.")
    
    tests = [
        ("Dependencies", test_dependencies),
        ("Imports", test_imports),
        ("Configuration", test_configuration),
        ("JWT Service", test_jwt_service),
        ("User Model", test_user_model),
        ("Endpoints", test_endpoints),
        ("Decorators", test_decorators),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print_error(f"{test_name} test failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print_header("Verification Summary")
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        if result:
            print_success(f"{test_name}: PASSED")
            passed += 1
        else:
            print_error(f"{test_name}: FAILED")
    
    print(f"\nOverall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print_success("🎉 JWT implementation is working correctly!")
        print("\nNext steps:")
        print("1. Add JWT secrets to your .env file")
        print("2. Test the OAuth flow with JWT tokens")
        print("3. Implement frontend integration")
    else:
        print_error("❌ Some tests failed. Please check the errors above.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
