import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { blacklistService } from '../services/blacklist.service'
import { sendError } from '../utils/response'

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401)
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)

    // Check blacklist trước
    const isBlacklisted = await blacklistService.isBlacklisted(payload.jti)
    if (isBlacklisted) {
      return sendError(res, 'Token has been revoked', 401)
    }

    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    return sendError(res, 'Invalid or expired token', 401)
  }
}
