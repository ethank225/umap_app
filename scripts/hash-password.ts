/**
 * Utility script to hash passwords for the login table
 *
 * Usage:
 *   npx tsx scripts/hash-password.ts "mypassword"
 *
 * Or run it with Node:
 *   node -r esbuild-register scripts/hash-password.ts "mypassword"
 */

import bcrypt from 'bcryptjs'

const password = process.argv[2]

if (!password) {
  console.error('Usage: npx tsx scripts/hash-password.ts "your-password"')
  process.exit(1)
}

async function hashPassword(plainPassword: string) {
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds)

  console.log('\n===========================================')
  console.log('Password Hash Generated')
  console.log('===========================================')
  console.log('\nPlain text:', plainPassword)
  console.log('\nHashed:', hashedPassword)
  console.log('\n===========================================')
  console.log('Use this SQL to insert the user:')
  console.log('===========================================')
  console.log(`
INSERT INTO login (username, password)
VALUES ('your_username', '${hashedPassword}');
`)
  console.log('===========================================\n')
}

hashPassword(password)
