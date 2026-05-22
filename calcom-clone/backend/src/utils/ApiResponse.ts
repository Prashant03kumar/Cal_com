import { Response } from 'express'

export class ApiResponse<T = unknown> {
  statusCode: number
  data: T
  message: string
  success: boolean

  constructor(statusCode: number, data: T, message = 'Success') {
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.success = statusCode < 400
  }
}

export function sendResponse<T>(res: Response, statusCode: number, data: T) {
  return res.status(statusCode).json(data)
}

export function sendNoContent(res: Response) {
  return res.sendStatus(204)
}
