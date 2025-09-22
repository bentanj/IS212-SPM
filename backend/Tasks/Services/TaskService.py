from typing import Iterable
from ..Repositories.TaskRepository import TaskRepository
from ..Models.Task import Task

class TaskService:
    def __init__(self, repo: TaskRepository):
        self.repo = repo

    def list_tasks(self) -> Iterable[Task]:
        return self.repo.list()