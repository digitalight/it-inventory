import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Check if user is in allowed users list
        const allowedUser = await prisma.allowedUser.findUnique({
          where: { email: user.email! }
        })
        
        if (!allowedUser) {
          return false // Deny access if not in allowed users
        }
        
        return true
      }
      return true
    },
    async session({ session, user }) {
      if (session?.user?.email) {
        // Add user info to session
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email }
        })
        
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
          session.user.isActive = dbUser.isActive
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database"
  }
})
