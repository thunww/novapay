import { Request, Response, NextFunction } from 'express'
import { sendError } from '../utils/response'

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') return sendError(res, 'Admin access required', 403)
  next()
}
