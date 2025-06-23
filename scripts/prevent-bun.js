#!/usr/bin/env node

/**
 * Script to prevent Bun from being used as package manager
 * This project has been migrated to npm and should not use Bun
 */

// Check if running with Bun
if (process.env.npm_execpath && process.env.npm_execpath.includes('bun')) {
  console.error('\n❌ ERROR: Bun is not allowed in this project');
  console.error('📦 This project uses npm as the package manager');
  console.error('🔧 Please use: npm install');
  console.error('');
  process.exit(1);
}

// Check if bun command is being used
if (process.env.npm_command === 'bun' || process.argv.includes('bun')) {
  console.error('\n❌ ERROR: Bun commands are not allowed');
  console.error('📦 This project has been migrated from Bun to npm');
  console.error('🔧 Use equivalent npm commands instead');
  console.error('');
  process.exit(1);
}

// Check for bun lockfile
const fs = require('fs');
const path = require('path');

const bunLockPath = path.join(process.cwd(), 'bun.lockb');
if (fs.existsSync(bunLockPath)) {
  console.error('\n❌ ERROR: Bun lockfile detected (bun.lockb)');
  console.error('📦 This project uses npm, not Bun');
  console.error('🧹 Remove bun.lockb and use npm install');
  console.error('');
  process.exit(1);
}

console.log('✅ Package manager check passed - using npm');