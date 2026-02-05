import "next-auth"

declare module "next-auth" {
  interface Session {
    twitterId?: string
    twitterUsername?: string
    twitterName?: string
    accessToken?: string
  }
}
