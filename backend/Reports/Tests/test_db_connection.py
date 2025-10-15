"""
Test database connection independently
Run from: backend/reports/ directory
Command: python tests/test_db_connection.py
"""

import os
import sys
from pathlib import Path

# Add parent directory to Python path to import config and db modules
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from dotenv import load_dotenv

# Load environment variables from parent directory
env_path = parent_dir / '.env'
load_dotenv(dotenv_path=env_path)

# Test configuration
print("=" * 60)
print("DATABASE CONNECTION TEST")
print("=" * 60)

# Check environment variables
required_vars = ["DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT", "DB_NAME"]
print("\n1. Checking environment variables:")
for var in required_vars:
    value = os.getenv(var)
    if var == "DB_PASSWORD":
        masked_value = "*" * len(value) if value else "NOT SET"
        print(f"   {var}: {masked_value}")
    else:
        print(f"   {var}: {value if value else 'NOT SET'}")

# Test configuration import
print("\n2. Testing config.py import:")
try:
    from config import Config
    Config.validate()
    print(f"   ✓ Configuration loaded successfully")
    print(f"   Connection string: {Config.get_connection_string()}")
except Exception as e:
    print(f"   ✗ Configuration error: {str(e)}")
    exit(1)

# Test database connection
print("\n3. Testing database connection:")
try:
    from sqlalchemy import create_engine, text
    
    engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
    
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        version = result.scalar()
        print(f"   ✓ Connected successfully!")
        print(f"   PostgreSQL version: {version[:50]}...")
        
        # Test table existence
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        tables = [row[0] for row in result]
        print(f"\n   Available tables ({len(tables)}):")
        for table in tables:
            print(f"   - {table}")
            
except Exception as e:
    print(f"   ✗ Connection failed: {str(e)}")
    exit(1)

# Test session factory
print("\n4. Testing session factory:")
try:
    from db import SessionLocal, test_connection
    
    if test_connection():
        print("   ✓ Session factory working")
        
        # Test actual query
        session = SessionLocal()
        from sqlalchemy import text
        result = session.execute(text("SELECT COUNT(*) FROM tasks"))
        count = result.scalar()
        print(f"   ✓ Found {count} tasks in database")
        session.close()
    else:
        print("   ✗ Session test failed")
        
except Exception as e:
    print(f"   ✗ Session error: {str(e)}")

print("\n" + "=" * 60)
print("DATABASE CONNECTION TEST COMPLETE")
print("=" * 60)
