from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
from Users.config import Config
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

def init_db():
    # import models here so Base.metadata is populated
    from Users.Models.User import User  # noqa
    Base.metadata.create_all(bind=engine)