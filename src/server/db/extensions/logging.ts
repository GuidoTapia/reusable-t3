import { Prisma } from "@prisma/client"

import { Logger, logger as defaultLogger } from "~/server/logger"

export const loggingExtension = (logger: Logger = defaultLogger) =>
  Prisma.defineExtension((prismaClient) =>
    prismaClient.$extends({
      query: {
        async $queryRaw({ args, query, operation }) {
          const start = performance.now()
          try {
            const result = await query(args)
            const end = performance.now()
            const time = end - start

            logger.info(`Prisma - ${operation}: ${time}ms`, {
              operation,
              sql: args.text,
              params: args.values,
              time,
            })

            return result
          } catch (error) {
            const end = performance.now()
            const time = end - start

            logger.error(`Prisma Error - ${operation}`, {
              sql: args.text,
              params: args.values,
              error,
              time,
            })
            throw error
          }
        },
        $allModels: {
          async $allOperations({ model, args, query, operation }) {
            const start = performance.now()
            try {
              const result = await query(args)
              const end = performance.now()
              const time = end - start

              logger.info(`Prisma - ${operation} - ${model}: ${time}ms`, {
                model,
                operation,
                args: JSON.stringify(args),
                time,
              })

              return result
            } catch (error) {
              const end = performance.now()
              const time = end - start

              logger.error(`Prisma Error - ${operation} - ${model}`, {
                model,
                operation,
                args: JSON.stringify(args),
                error,
                time,
              })
              throw error
            }
          },
        },
      },
    }),
  )
