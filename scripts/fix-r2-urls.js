#!/usr/bin/env node
/**
 * Fix R2 Image URLs Migration
 * 
 * This script updates all R2 image URLs in the database from the incorrect
 * account ID to the correct one.
 * 
 * Before: pub-bcdec06776b58a6802e2c3face0f004c.r2.dev
 * After:  pub-505fbfcdba444803a75ae90dd308aa04.r2.dev
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const OLD_DOMAIN = 'pub-bcdec06776b58a6802e2c3face0f004c.r2.dev'
const NEW_DOMAIN = 'pub-505fbfcdba444803a75ae90dd308aa04.r2.dev'

async function main() {
  console.log('🔍 Checking for images with incorrect R2 URLs...\n')

  // Check Work cover images
  const worksWithOldUrl = await prisma.work.findMany({
    where: {
      coverImage: {
        contains: OLD_DOMAIN
      }
    },
    select: {
      id: true,
      title: true,
      coverImage: true
    }
  })

  console.log(`📚 Found ${worksWithOldUrl.length} works with old R2 URLs`)
  if (worksWithOldUrl.length > 0) {
    console.log('   Works:', worksWithOldUrl.map(w => w.title).join(', '))
  }

  // Check User avatars
  const usersWithOldAvatar = await prisma.user.findMany({
    where: {
      avatar: {
        contains: OLD_DOMAIN
      }
    },
    select: {
      id: true,
      username: true,
      avatar: true
    }
  })

  console.log(`\n👤 Found ${usersWithOldAvatar.length} users with old avatar URLs`)

  // Check CharacterProfile images
  const charactersWithOldUrl = await prisma.characterProfile.findMany({
    where: {
      profileImage: {
        contains: OLD_DOMAIN
      }
    },
    select: {
      id: true,
      name: true,
      profileImage: true
    }
  })

  console.log(`🎭 Found ${charactersWithOldUrl.length} character profiles with old profile image URLs\n`)

  const totalAffected = 
    worksWithOldUrl.length + 
    usersWithOldAvatar.length + 
    charactersWithOldUrl.length

  if (totalAffected === 0) {
    console.log('✅ No records need updating!')
    return
  }

  console.log(`\n📝 Total records to update: ${totalAffected}\n`)
  console.log('🔄 Starting migration...\n')

  let updatedCount = 0

  // Update Work cover images
  for (const work of worksWithOldUrl) {
    const newUrl = work.coverImage.replace(OLD_DOMAIN, NEW_DOMAIN)
    await prisma.work.update({
      where: { id: work.id },
      data: { coverImage: newUrl }
    })
    console.log(`✓ Updated work: ${work.title}`)
    console.log(`  Old: ${work.coverImage}`)
    console.log(`  New: ${newUrl}\n`)
    updatedCount++
  }

  // Update User avatars
  for (const user of usersWithOldAvatar) {
    const newUrl = user.avatar.replace(OLD_DOMAIN, NEW_DOMAIN)
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: newUrl }
    })
    console.log(`✓ Updated user avatar: ${user.username}`)
    updatedCount++
  }

  // Update CharacterProfile images
  for (const character of charactersWithOldUrl) {
    const newUrl = character.profileImage.replace(OLD_DOMAIN, NEW_DOMAIN)
    await prisma.characterProfile.update({
      where: { id: character.id },
      data: { profileImage: newUrl }
    })
    console.log(`✓ Updated character profile: ${character.name}`)
    updatedCount++
  }

  console.log(`\n✨ Migration complete! Updated ${updatedCount} records.\n`)
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
