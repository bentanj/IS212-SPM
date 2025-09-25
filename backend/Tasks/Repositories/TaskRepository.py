from typing import Iterable, Optional
from sqlalchemy.orm import Session
from ..Models.Task import Task

class TaskRepository:
    def __init__(self, session: Session):
        self.session = session

