from typing import Iterable, Optional
from sqlalchemy.orm import Session
from ..Models.Task import Task

class TaskRepository:
    def __init__(self, session: Session):
        self.session = session

    def list(self) -> Iterable[Task]:
        return self.session.query(Task).all()

    def get(self, task_id: int) -> Optional[Task]:
        return self.session.get(Task, task_id)