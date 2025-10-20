from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
from config import Config
from sqlalchemy import text

engine = create_engine(
    Config.SQLALCHEMY_DATABASE_URI,
    echo=Config.SQLALCHEMY_ECHO,
    future=True,
)
SessionLocal = scoped_session(
    sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
)
Base = declarative_base()

def init_db(engine_to_use=None):
    # import models here so Base.metadata is populated
    from Models.Task import Task  # noqa
    
    # Use provided engine or default to global engine
    target_engine = engine_to_use if engine_to_use is not None else engine
    Base.metadata.create_all(bind=target_engine)
