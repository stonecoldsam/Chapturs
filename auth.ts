import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
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
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google" && profile?.email_verified) {
        try {
          // Create or find user in our database
          const dbUser = await prisma.user.upsert({
            where: { email: profile.email! },
            update: {
              displayName: profile.name || undefined,
              avatar: profile.picture || undefined,
            },
            create: {
              id: user.id, // Use NextAuth's generated ID
              email: profile.email!,
              username: profile.email!.split('@')[0] + '_' + Date.now(), // Generate unique username
              displayName: profile.name || undefined,
              avatar: profile.picture || undefined,
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

          console.log('User and Author profile authenticated and synced to database:', dbUser.email)
          return true
        } catch (error) {
          console.error('Error creating/updating user in database:', error)
          return false
        }
      }
      return profile?.email_verified === true
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user && token.sub) {
        session.user.id = token.sub
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
