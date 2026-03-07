#!/bin/sh
set -e

echo "Running migrations..."
npx prisma migrate deploy

echo "Checking if DB needs seeding..."
ACCOUNT_COUNT=$(npx tsx -e "
import prisma from './src/config/prisma';
prisma.account.count().then(n => { console.log(n); process.exit(0); }).catch(() => { console.log(0); process.exit(0); });
" 2>/dev/null || echo "0")

if [ "$ACCOUNT_COUNT" = "0" ]; then
  echo "Seeding accounts..."
  npx tsx prisma/seed.ts
  echo "✓ Seeded!"
else
  echo "✓ DB already has data, skipping seed"
fi

echo "Starting account-service..."
exec npx tsx src/index.ts
