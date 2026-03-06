import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { env } from '../config/env'
import { JwtPayload } from '../../../shared/types'

export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign(
    { sub: userId, role, jti: uuidv4() },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  )
}

export const generateRefreshToken = (): string => uuidv4()

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload
  } catch {
    return null
  }
}
