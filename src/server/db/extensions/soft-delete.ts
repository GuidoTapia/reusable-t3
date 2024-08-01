import { Prisma } from "@prisma/client"

export const softDeleteExtension = () =>
  Prisma.defineExtension((prismaClient) => {
    return prismaClient.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query, operation, model }) {
            switch (operation) {
              case "findMany":
              case "findFirstOrThrow":
              case "findFirst":
              case "count": {
                // safeguard against tables that do not have a deletedAt column
                const prismaModels = Prisma.dmmf.datamodel.models
                for (const prismaModel of prismaModels) {
                  const modelName = prismaModel.name
                  if (modelName === model) {
                    if (
                      !prismaModel.fields.some((f) => f.name === "deletedAt")
                    ) {
                      return query(args)
                    }

                    return query({
                      ...args,
                      where: {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        deletedAt: null as any,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ...(args.where as any),
                      },
                    })
                  }
                }
              }
            }
            return query(args)
          },
        },
      },
    })
  })
