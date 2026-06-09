import "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
    emailVerified?: Date | null
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      firstName?: string | null
      lastName?: string | null
      phone?: string | null
      emailVerified?: Date | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    id?: string
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
    emailVerified?: string | null
  }
}
