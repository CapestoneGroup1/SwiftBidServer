export class BadRequest extends Error {
  statusCode: number
  constructor(message: string) {
    super(message)
    this.name = "BadRequest"
    this.statusCode = 400
  }
}

export class NotFound extends Error {
  statusCode: number
  constructor(message: string) {
    super(message)
    this.name = "NotFound"
    this.statusCode = 404
  }
}

export class UnAuthenticatedError extends Error {
  statusCode: number
  constructor(message: string) {
    super(message)
    this.name = "UnAuthenticatedError"
    this.statusCode = 401
  }
}

export class ForbiddenError extends Error {
  statusCode: number
  constructor(message: string) {
    super(message)
    this.name = "ForbiddenError"
    this.statusCode = 403
  }
}
export class InternalServerError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
    this.statusCode = 500;
  }
}
