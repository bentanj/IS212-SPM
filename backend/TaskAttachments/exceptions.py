class InvalidFileTypeError(Exception):
    pass


class FileSizeExceededError(Exception):
    pass


class StorageQuotaExceededError(Exception):
    def __init__(self, message: str, current_usage_bytes: int):
        super().__init__(message)
        self.current_usage_bytes = current_usage_bytes


class AttachmentNotFoundError(Exception):
    pass


