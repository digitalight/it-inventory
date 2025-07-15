import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const allowedEmails = process.env.ALLOWED_EMAILS?.split(',').map(email => email.trim()) || []
const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: process.env.GOOGLE_WORKSPACE_DOMAIN,
        },
      },
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      return allowedEmails.includes(user.email)
    },
    async session({ session, token }) {
      if (session?.user?.email) {
        // Extend the session user object
        const extendedUser = session.user as typeof session.user & {
          role: string
          isActive: boolean
          id: string
        }
        
        extendedUser.role = adminEmails.includes(session.user.email) ? 'ADMIN' : 'USER'
        extendedUser.isActive = true
        extendedUser.id = token.sub || ''
      }
      return session
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.role = adminEmails.includes(user.email) ? 'ADMIN' : 'USER'
        token.isActive = true
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt"
  }
})
