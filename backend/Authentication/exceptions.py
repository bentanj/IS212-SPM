class ValidationError(Exception):
    """Custom validation error"""
    pass

class AuthenticationError(Exception):
    """Custom authentication error"""
    pass

class AuthorizationError(Exception):
    """Custom authorization error"""
    pass