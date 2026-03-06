import { Request, Response, NextFunction } from 'express'
import { verifyToken as verifyWithAuthService } from '../clients/auth.client'
import { sendError } from '../utils/response'

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return sendError(res, 'No token provided', 401)
    const token = authHeader.split(' ')[1]
    req.user = await verifyWithAuthService(token)
    next()
  } catch {
    return sendError(res, 'Invalid or expired token', 401)
  }
}
