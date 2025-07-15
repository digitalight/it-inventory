import Google from "next-auth/providers/google"

export const authConfig = {
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnAuthPage = nextUrl.pathname.startsWith('/auth')
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnAuthPage) {
        return Response.redirect(new URL('/', nextUrl))
      }
      
      // Allow access to auth pages and home page
      if (isOnAuthPage || nextUrl.pathname === '/') {
        return true
      }
      
      // Require authentication for all other pages
      return isLoggedIn
    },
    async session({ session, token }: any) {
      if (session.user && token.email) {
        session.user.role = token.role as string
      }
      return session
    },
    async jwt({ token, user, account }: any) {
      if (user && account) {
        // Check if user email is in allowed list
        const allowedEmails = process.env.ALLOWED_EMAILS?.split(',').map(email => email.trim()) || []
        const isAllowed = allowedEmails.includes(user.email || '')
        
        if (!isAllowed) {
          throw new Error('Access denied: Email not authorized')
        }
        
        // Check if user is admin
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
        const isAdmin = adminEmails.includes(user.email || '')
        
        token.role = isAdmin ? 'admin' : 'user'
      }
      return token
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: process.env.GOOGLE_WORKSPACE_DOMAIN, // Optional: restrict to specific domain
        },
      },
    }),
  ],
}
