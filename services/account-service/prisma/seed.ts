import { PrismaClient } from '../src/generated/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.$queryRaw<{ id: string; username: string }[]>`
    SELECT id, username FROM auth."User"
  `

  const balanceMap: Record<string, number> = {
    admin: 0,
    alice: 10000000,
    bob:   5000000,
    carol: 7500000,
  }

  for (const user of result) {
    await prisma.account.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        balance: balanceMap[user.username] ?? 0,
        currency: 'VND',
      },
    })
    console.log(`✓ Created account for ${user.username}: ${balanceMap[user.username] ?? 0} VND`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())