import { Request, Response, NextFunction } from 'express'
import { ServiceError } from '../../../shared/types'
import { logger } from '../utils/logger'

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err, path: req.path }, 'Unhandled error')
  if (err instanceof ServiceError) {
    return res.status(err.statusCode).json({ success: false, data: null, error: err.message })
  }
  return res.status(500).json({ success: false, data: null, error: 'Internal server error' })
}
