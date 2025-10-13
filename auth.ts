import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Discord from "next-auth/providers/discord"
import { prisma } from '@/lib/database/PrismaService'

export const { handlers, signIn, signOut, auth } = NextAuth({
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
      
      if (email && emailVerified) {
        try {
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

          // Create or ensure author profile exists for this user
          await prisma.author.upsert({
            where: { userId: dbUser.id },
            update: {}, // No updates needed for existing authors
            create: {
              userId: dbUser.id,
              verified: false, // New authors start unverified
              socialLinks: '[]', // Empty social links array
            },
          })

          console.log(`User authenticated via ${account?.provider}:`, dbUser.email)
          return true
        } catch (error) {
          console.error('Error creating/updating user in database:', error)
          return false
        }
      }
      return false // Reject if no email or email not verified
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user && token.sub) {
        session.user.id = token.sub
        
        // Fetch user role from database
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true }
          })
          if (dbUser?.role) {
            session.user.role = dbUser.role
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
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
