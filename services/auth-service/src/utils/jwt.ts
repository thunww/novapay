import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { env } from '../config/env'
import { JwtPayload } from '../../../shared/types'

export const generateAccessToken = (userId: string, role: string): string => {
  const payload = { sub: userId, role, jti: uuidv4() }
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as string,
  } as jwt.SignOptions)
}

export const generateRefreshToken = (): string => uuidv4()

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}

export const decodeToken = (token: string) => {
  return jwt.decode(token) as JwtPayload | null
}
