/**
 * An error with an HTTP status, turned into `{ error, details? }` by the error handler.
 * Throw these from services and middleware; anything else becomes a 500.
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details: string[] = [],
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/** 422 with the list of problems, as the dashboard shows them above the form. */
export class ValidationError extends HttpError {
  constructor(details: string[], message = "Some fields need fixing.") {
    super(422, message, details);
    this.name = "ValidationError";
  }
}

export const notFound = (message: string) => new HttpError(404, message);
export const conflict = (message: string) => new HttpError(409, message);
