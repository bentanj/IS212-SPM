class UserError(Exception):
    pass


class UserNotFoundError(UserError):
    pass


class UserValidationError(UserError):
    pass


class UserAlreadyExistsError(UserError):
    pass


class InvalidUserRoleError(UserError):
    pass