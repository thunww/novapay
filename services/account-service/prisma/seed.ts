import { PrismaClient } from '../src/generated/client'
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.account.count()
  if (count > 0) {
    console.log('✓ Already seeded, skipping')
    return
  }

  const result = await prisma.$queryRaw<{ id: string; username: string }[]>`
    SELECT id, username FROM auth."User"
  `

  if (result.length === 0) {
    console.log('⚠ No users found, skipping account seed')
    return
  }

  const balanceMap: Record<string, number> = {
    admin: 0,
    alice: 10000000,
    bob:   5000000,
    carol: 7500000,
  }

  for (const user of result) {
    await prisma.account.upsert({
      where: { userId: user.id },
      update: {
        balance: balanceMap[user.username] ?? 0,
      },
      create: {
        userId: user.id,
        balance: balanceMap[user.username] ?? 0,
        currency: 'VND',
      },
    })
    console.log(`✓ Seeded account for ${user.username}: ${balanceMap[user.username] ?? 0} VND`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())