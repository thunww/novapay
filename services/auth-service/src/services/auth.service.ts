import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../config/prisma'
import redis from '../config/redis'
import { env } from '../config/env'
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '../utils/jwt'
import { blacklistService } from './blacklist.service'
import { ServiceError } from '../../../shared/types'

export const authService = {
  async register(username: string, email: string, password: string) {
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })
    if (exists) throw new ServiceError(409, 'Email or username already exists')

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { username, email, passwordHash },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    })
    // Tạo account cho user mới
    try {
      await fetch(`${env.ACCOUNT_SERVICE_URL}/api/account/internal/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': env.INTERNAL_SECRET },
        body: JSON.stringify({ userId: user.id }),
      })
    } catch (e) {
      console.error('Failed to create account for user', user.id, e)
    }
    return user
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new ServiceError(401, 'Invalid credentials')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new ServiceError(401, 'Invalid credentials')

    const accessToken = generateAccessToken(user.id, user.role)
    const refreshToken = generateRefreshToken()

    // Lưu refresh token vào DB
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    }
  },

  async logout(accessToken: string, refreshToken?: string) {
    // Blacklist access token
    try {
      const payload = verifyAccessToken(accessToken)
      const ttl = payload.exp - Math.floor(Date.now() / 1000)
      await blacklistService.add(payload.jti, ttl)
    } catch {
      // Token đã expired thì không cần blacklist
    }

    // Revoke refresh token
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true },
      })
    }
  },

  async refresh(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new ServiceError(401, 'Invalid refresh token')
    }

    // Rotation: revoke cũ, tạo mới
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    })

    const newAccessToken = generateAccessToken(stored.user.id, stored.user.role)
    const newRefreshToken = generateRefreshToken()

    await prisma.refreshToken.create({
      data: {
        userId: stored.user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    })
    if (!user) throw new ServiceError(404, 'User not found')
    // Tạo account cho user mới
    try {
      await fetch(`${env.ACCOUNT_SERVICE_URL}/api/account/internal/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': env.INTERNAL_SECRET },
        body: JSON.stringify({ userId: user.id }),
      })
    } catch (e) {
      console.error('Failed to create account for user', user.id, e)
    }
    return user
  },
}
