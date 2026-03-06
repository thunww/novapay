import { Response } from 'express'
import { ApiResponse } from '../../../shared/types'

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200) => {
  const response: ApiResponse<T> = { success: true, data, message }
  return res.status(statusCode).json(response)
}

export const sendError = (res: Response, error: string, statusCode = 400) => {
  const response: ApiResponse = { success: false, data: null, error }
  return res.status(statusCode).json(response)
}
