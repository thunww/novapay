#!/bin/sh
set -e

echo "Running migrations..."
npx prisma migrate deploy

echo "Starting service..."
exec npx tsx src/index.ts
