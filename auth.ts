import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Discord from "next-auth/providers/discord"
import { prisma } from '@/lib/database/PrismaService'

// Validate required environment variables
const requiredEnvVars = ['AUTH_SECRET', 'AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET']
const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '))
  console.error('Please add these to your Vercel environment variables:')
  console.error('- AUTH_SECRET (generate with: openssl rand -base64 32)')
  console.error('- AUTH_GOOGLE_ID (from Google Cloud Console)')
  console.error('- AUTH_GOOGLE_SECRET (from Google Cloud Console)')
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    // Google OAuth (primary recommended option)
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    
    // GitHub OAuth (optional - fast setup, no verification needed)
    ...(process.env.AUTH_GITHUB_ID ? [
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
      })
    ] : []),
    
    // Discord OAuth (optional - popular with webnovel readers)
    ...(process.env.AUTH_DISCORD_ID ? [
      Discord({
        clientId: process.env.AUTH_DISCORD_ID,
        clientSecret: process.env.AUTH_DISCORD_SECRET,
      })
    ] : []),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      // Support multiple providers (Google, GitHub, Discord)
      const email = profile?.email
      const emailVerified = profile?.email_verified ?? true // GitHub/Discord don't have this field
      
      console.log('🔐 Sign-in attempt:', {
        provider: account?.provider,
        email,
        emailVerified,
        nextAuthUserId: user.id
      })
      
      if (!email) {
        console.error('❌ Sign-in rejected: No email in profile')
        return false
      }
      
      if (!emailVerified) {
        console.error('❌ Sign-in rejected: Email not verified')
        return false
      }
      
      try {
        console.log('📝 Attempting to upsert user in database...')
        
        // Create or find user in our database
        const dbUser = await prisma.user.upsert({
          where: { email },
          update: {
            displayName: profile.name || undefined,
            // Support different avatar field names across providers
            avatar: (profile as any).picture || (profile as any).avatar_url || (profile as any).image || undefined,
          },
          create: {
            id: user.id, // Use NextAuth's generated ID
            email,
            username: email.split('@')[0] + '_' + Date.now(), // Generate unique username
            displayName: profile.name || undefined,
            avatar: (profile as any).picture || (profile as any).avatar_url || (profile as any).image || undefined,
          },
        })
        
        console.log('✅ User upserted:', {
          email: dbUser.email,
          id: dbUser.id,
          username: dbUser.username
        })

        // Create or ensure author profile exists for this user
        console.log('📝 Attempting to upsert author profile for userId:', dbUser.id)
        
        await prisma.author.upsert({
          where: { userId: dbUser.id },
          update: {}, // No updates needed for existing authors
          create: {
            userId: dbUser.id,
            verified: false, // New authors start unverified
            socialLinks: '[]', // Empty social links array
          },
        })
        
        console.log('✅ Author profile ready:', {
          authorId: (await prisma.author.findUnique({ where: { userId: dbUser.id } }))?.id,
          userId: dbUser.id
        })
        console.log(`✅ User authenticated via ${account?.provider}:`, dbUser.email)
        return true
      } catch (error) {
        console.error('❌ Database error during sign-in:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        
        // Check if it's a connection error
        if (error instanceof Error) {
          console.error('Error message:', error.message)
          console.error('Error stack:', error.stack)
        }
        
        return false
      }
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user && token.sub) {
        session.user.id = token.sub
        console.log('[Session Callback] Setting session.user.id from token.sub:', token.sub)
        
        // Fetch user role from database
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true, email: true }
          })
          if (dbUser?.role) {
            session.user.role = dbUser.role
          }
          console.log('[Session Callback] User found in DB:', dbUser ? `email=${dbUser.email}` : 'NOT FOUND')
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
      } else {
        console.log('[Session Callback] Missing session.user or token.sub')
      }
      return session
    },
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and/or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
})
