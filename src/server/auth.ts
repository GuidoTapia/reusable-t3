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
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
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
    /*CredentialsProvider({
    name: "Claim Number",
    type: "credentials",
    credentials: {
      email: {
        label: "Email",
        type: "text",
        placeholder: "mail@example.com",
      },
      claimNumber: {
        label: "Claim #",
        type: "text",
        placeholder: "123456789",
      },
    },
    async authorize(credentials) {
      if (!credentials) return null;

      const involvedPartyMatchesQuery = kysely
        .selectFrom("involved_parties as ip")
        .innerJoin("claims as c", "c.id", "ip.claim_id")
        .where("c.claim_number", "=", Number(credentials?.claimNumber))
        .where((eb) =>
          eb.exists(
            sql`(SELECT 1 FROM unnest(ip.email_addresses) AS email WHERE lower(email) ILIKE ${
              "%" + (credentials.email ?? "") + "%"
            })`,
          ),
        )
        .select([
          "ip.id",
          "ip.has_system_access as hasSystemAccess",
          "ip.name",
          "ip.type",
          "ip.organization_id as organizationId",
          "c.id as claimId",
        ]);

      const involvedPartyMatches = await prismaClient.$kyselyQuery(
        involvedPartyMatchesQuery.compile(),
      );

      const involvedParty = involvedPartyMatches?.[0];

      try {
        if (!involvedParty) return null;

        const response = {
          id: involvedParty.id,
          email: credentials.email,
          name: involvedParty.name ?? "No name",
          claimNumber: credentials.claimNumber,
          isActive: true,
          role:
            involvedParty.type === "RENTER"
              ? AuthorizationRoles.RENTER
              : AuthorizationRoles.INVOLVED_PARTY,
          organizationId: involvedParty.organizationId,
        };

        return response;
      } catch (error) {
        if (error instanceof Error) {
          logger.error(
            `Involved party with e-mail ${credentials?.email} could not sign into the app. Error: ${error.message}`,
          );

          captureException(error);
c
          throw new Error("Invalid credentials");
        }

        return null;
      }
    },
  }),*/
  ],
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions)
