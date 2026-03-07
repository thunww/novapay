#!/bin/sh
set -e

echo "Running migrations..."
npx prisma migrate deploy

echo "Checking if DB needs seeding..."
USER_COUNT=$(npx tsx -e "
import prisma from './src/config/prisma';
prisma.user.count().then(n => { console.log(n); process.exit(0); }).catch(() => { console.log(0); process.exit(0); });
" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
  echo "✓ Seeded!"
else
  echo "✓ DB already has data, skipping seed"
fi

echo "Starting auth-service..."
exec npx tsx src/index.ts
