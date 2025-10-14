class TaskError(Exception):
    pass

class TaskNotFoundError(TaskError):
    pass

class TaskValidationError(TaskError):
    pass

class InvalidTaskStatusError(TaskError):
    pass

# New Report Exceptions
class ReportError(Exception):
    pass

class ReportValidationError(ReportError):
    pass

class ReportGenerationError(ReportError):
    pass
