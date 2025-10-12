import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const cfg = {
    tier: 'R',
    patterns: ['explicitmarker', 'verybadword']
  }

  const rule = await prisma.validationRule.upsert({
    where: { name: 'R - explicit marker' },
    update: { config: JSON.stringify(cfg), isActive: true, severity: 'high' },
    create: { name: 'R - explicit marker', type: 'safety', isActive: true, config: JSON.stringify(cfg), severity: 'high' }
  })

  console.log('Upserted rule:', rule)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => process.exit(0))
