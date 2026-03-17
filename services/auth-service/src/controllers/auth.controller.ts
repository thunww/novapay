import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service'
import { rateLimitService } from '../services/rateLimit.service'
import { sendSuccess, sendError } from '../utils/response'
import { z } from 'zod'

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const body = registerSchema.parse(req.body)
      const user = await authService.register(body.username, body.email, body.password)
      return sendSuccess(res, user, 'Registration successful', 201)
    } catch (err) {
      next(err)
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Rate limit theo IP
      const ip = req.ip || 'unknown'
      const { allowed, remaining } = await rateLimitService.checkAndIncrement(ip)
      if (!allowed) {
        return sendError(res, 'Too many login attempts. Try again in 15 minutes.', 429)
      }

      const body = loginSchema.parse(req.body)
      const result = await authService.login(body.email, body.password)

      // Reset rate limit sau login thành công
      await rateLimitService.reset(ip)

      // Set refresh token httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      return sendSuccess(res, {
        accessToken: result.accessToken,
        user: result.user,
      }, 'Login successful')
    } catch (err) {
      next(err)
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1] || ''
      const refreshToken = req.cookies?.refreshToken
      await authService.logout(accessToken, refreshToken)
      res.clearCookie('refreshToken')
      return sendSuccess(res, null, 'Logged out successfully')
    } catch (err) {
      next(err)
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken
      if (!refreshToken) return sendError(res, 'No refresh token', 401)

      const tokens = await authService.refresh(refreshToken)

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      return sendSuccess(res, { accessToken: tokens.accessToken })
    } catch (err) {
      next(err)
    }
  },

  async verify(req: Request, res: Response, next: NextFunction) {
    // INTERNAL ONLY — được gọi bởi các services khác
    try {
      return sendSuccess(res, { user: req.user })
    } catch (err) {
      next(err)
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.id)
      return sendSuccess(res, user)
    } catch (err) {
      next(err)
    }
  },
}
