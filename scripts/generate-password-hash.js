/**
 * Script for å generere passord-hash til .env filen
 * 
 * Kjør med: node scripts/generate-password-hash.js <ditt-passord>
 * 
 * Eksempel: node scripts/generate-password-hash.js hemmelig123
 */

const bcrypt = require('bcryptjs')

const password = process.argv[2]

if (!password) {
  console.log('\n❌ Du må oppgi et passord!\n')
  console.log('Bruk: node scripts/generate-password-hash.js <ditt-passord>')
  console.log('Eksempel: node scripts/generate-password-hash.js hemmelig123\n')
  process.exit(1)
}

const hash = bcrypt.hashSync(password, 10)

console.log('\n✅ Passord-hash generert!\n')
console.log('Legg til denne linjen i din .env fil:\n')
console.log(`SITE_PASSWORD_HASH="${hash}"`)
console.log('\n')

