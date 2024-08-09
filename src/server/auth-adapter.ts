import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { Adapter } from "next-auth/adapters"

const AuthAdapter = (prisma: PrismaClient): Adapter => {
  const prismaAdapter = PrismaAdapter(prisma)

  return {
    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({
        where: {
          email: email.toLowerCase(),
        },
      })

      const userEmail = user?.email

      if (!user || !userEmail) return null

      return {
        ...user,
        email: userEmail,
      }
    },

    createUser() {
      throw new Error("User sign up is not supported")
    },

    async getUser(id: string) {
      const user = await prisma?.user.findUnique({
        where: {
          id,
        },
      })

      const userEmail = user?.email

      if (!user || !userEmail) return null

      return {
        ...user,
        email: userEmail,
      }
    },

    async getUserByAccount(providerAccountId) {
      const userAccount = await prisma.account.findFirst({
        where: {
          providerAccountId: providerAccountId.providerAccountId,
        },
        select: {
          user: true,
        },
      })

      const userEmail = userAccount?.user?.email

      if (!userAccount?.user || !userEmail) return null

      return {
        ...userAccount.user,
        email: userEmail,
      }
    },

    async updateUser(user) {
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: user.emailVerified,
        },
      })

      const userEmail = updatedUser.email

      if (!userEmail) {
        throw new Error("User email not found")
      }

      return {
        ...updatedUser,
        email: userEmail,
        emailVerified: updatedUser.emailVerified,
      }
    },

    async getSessionAndUser(sessionToken: string) {
      const session = await prisma.session.findUnique({
        where: {
          sessionToken,
        },
        select: {
          user: true,
          expires: true,
        },
      })

      if (!session || !session.user.id) return null

      const userEmail = session.user.email

      if (!userEmail) return null

      return {
        session: {
          sessionToken,
          userId: session.user.id,
          expires: session.expires,
        },
        user: {
          ...session.user,
          email: userEmail,
        },
      }
    },

    deleteUser: prismaAdapter.deleteUser,
    linkAccount: prismaAdapter.linkAccount,
    unlinkAccount: prismaAdapter.unlinkAccount,
    createSession: prismaAdapter.createSession,
    updateSession: prismaAdapter.updateSession,
    deleteSession: prismaAdapter.deleteSession,
    createVerificationToken: prismaAdapter.createVerificationToken,
    useVerificationToken: prismaAdapter.useVerificationToken,
  }
}

export default AuthAdapter
