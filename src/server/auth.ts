import { PrismaAdapter } from "@auth/prisma-adapter"
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth"
import { type Adapter } from "next-auth/adapters"
import AuthAdapter from "~/server/auth-adapter"

import CredentialsProvider from "next-auth/providers/credentials"

import { env } from "~/env/server.mjs"
import { db } from "~/server/db"
import { createPrismaClient } from "./db/prisma"
import { logger } from "./logger"
import { PrismaClient } from "@prisma/client/extension"

const prismaClient = createPrismaClient()

const nextAuthLogger = logger.child({ scope: "nextauth" })

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"]
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          ...user,
          //id: token?.id,
        },
      }
    },
    jwt(params) {
      nextAuthLogger.info("nextauth.jwt: start", params)

      const { token, account, user } = params

      return { ...token, ...account, ...user }
    },
  },
  adapter: AuthAdapter(
    prismaClient as unknown as PrismaClient,
  ) as unknown as Adapter,
  session: {
    maxAge:
      env.NODE_ENV === "production"
        ? 60 * 60 * 12 /* 12 hours */
        : 60 * 60 * 24 * 7 /* 7 days */,
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "example@mail.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "********",
        },
      },

      async authorize(credentials, req) {
        const user = await prismaClient.user.findFirst({
          where: {
            email: credentials?.email,
          },
        })

        if (user) {
          return user
        } else {
          return null
        }
      },
    }),
  ],
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions)
