#!/bin/bash
# Docker-specific build script
set -e

echo "Installing Prisma engines..."
npm install @prisma/engines --save-dev

echo "Generating Prisma client..."
npx prisma generate

echo "Building application..."
npm run build:prod

echo "Build completed successfully!"