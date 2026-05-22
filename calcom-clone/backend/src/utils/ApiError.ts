export class ApiError extends Error {
  statusCode: number
  errors?: unknown

  constructor(statusCode: number, message = 'Something went wrong', errors?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
  }
}
