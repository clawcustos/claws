import NextAuth from "next-auth"
import Twitter from "next-auth/providers/twitter"

interface TwitterProfile {
  data?: {
    id?: string
    username?: string
    name?: string
  }
  id?: string
  username?: string
  name?: string
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Store Twitter user info AND access token
      if (account && profile) {
        const p = profile as TwitterProfile
        token.twitterId = p.data?.id || p.id
        token.twitterUsername = p.data?.username || p.username
        token.twitterName = p.data?.name || p.name
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // Make Twitter info available in the session
      session.twitterId = token.twitterId as string
      session.twitterUsername = token.twitterUsername as string
      session.twitterName = token.twitterName as string
      session.accessToken = token.accessToken as string
      return session
    },
  },
})
