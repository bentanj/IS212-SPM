class TaskError(Exception):
    pass


class TaskNotFoundError(TaskError):
    pass


class TaskValidationError(TaskError):
    pass


class InvalidTaskStatusError(TaskError):
    pass


