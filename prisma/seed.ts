// Database seeding script
import DatabaseService from '../src/lib/database/PrismaService'

async function main() {
  await DatabaseService.seedDatabase()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })
