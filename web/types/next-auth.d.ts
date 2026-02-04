import 'next-auth'

declare module 'next-auth' {
  interface Session {
    twitterId?: string
    twitterUsername?: string
    twitterName?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    twitterId?: string
    twitterUsername?: string
    twitterName?: string
  }
}
