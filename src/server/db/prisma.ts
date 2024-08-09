/* eslint-disable no-var */
import { Prisma, PrismaClient } from "@prisma/client"
import * as runtime from "@prisma/client/runtime/library"

import { env } from "~/env/server.mjs"

import { loggingExtension } from "~/server/db/extensions/logging"
import { auditingExtension } from "./extensions/auditing"
import { softDeleteExtension } from "./extensions/soft-delete"

declare global {
  var prisma:
    | PrismaClient<Prisma.PrismaClientOptions, "query" | "error" | "warn">
    | undefined
  var prismaListenersAdded: boolean | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: [
      { emit: "event", level: "query" },
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  })

// Only the extended client should be used. Get the client and pass it through the handlers or set it on context
export const createPrismaClient = () => {
  return prisma
    .$extends(softDeleteExtension())
    .$extends(loggingExtension())
    .$extends(auditingExtension())
}

export type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>
export type PrismaTransactionClient = Omit<
  ExtendedPrismaClient,
  runtime.ITXClientDenyList
>

if (env.NODE_ENV !== "production") {
  global.prisma = prisma
}
