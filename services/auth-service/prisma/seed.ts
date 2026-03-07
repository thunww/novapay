import { PrismaClient } from '../src/generated/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = (pw: string) => bcrypt.hashSync(pw, 10)

  const users = [
    { username: 'admin', email: 'admin@novapay.com', password: 'Admin@123', role: 'ADMIN' as const },
    { username: 'alice', email: 'alice@novapay.com', password: 'Alice@123', role: 'USER' as const },
    { username: 'bob',   email: 'bob@novapay.com',   password: 'Bob@123',   role: 'USER' as const },
    { username: 'carol', email: 'carol@novapay.com', password: 'Carol@123', role: 'USER' as const },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        username: u.username,
        email: u.email,
        passwordHash: hash(u.password),
        role: u.role,
      },
    })
    console.log(`✓ Seeded user: ${u.username}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())