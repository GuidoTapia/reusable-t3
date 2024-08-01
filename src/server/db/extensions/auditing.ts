/* eslint-disable security/detect-object-injection */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeTypeEnum, Prisma } from "@prisma/client"
import { Operation } from "@prisma/client/runtime/library"
import Case from "case"
import { omit } from "lodash"
import { v4 as uuidV4 } from "uuid"

import { loggerContext } from "~/server/logger"

const getOperationType = (operation: Operation, hasDeletedAt?: boolean) => {
  switch (operation) {
    case "createMany":
    case "create": {
      return ChangeTypeEnum.CREATE
    }
    case "updateMany":
    case "update": {
      if (hasDeletedAt) return ChangeTypeEnum.DELETE
      return ChangeTypeEnum.UPDATE
    }
    case "deleteMany":
    case "delete": {
      return ChangeTypeEnum.DELETE
    }
    default: {
      throw new Error(`Unknown operation type: ${operation}`)
    }
  }
}

const getCurrentUser = async () => {
  let user = loggerContext.get("session")?.user ?? null

  return user
}

export const auditingExtension = () =>
  Prisma.defineExtension((prismaClient) => {
    return prismaClient.$extends({
      query: {
        $allModels: {
          /*async $allOperations({ args, query, operation, model }) {
            if (model === "VerificationToken" || model === "Session")
              return query(args);*/
          /*switch (operation) {
              case "create":
              case "update":
              case "delete": {
                const shadowModelName = `${Case.camel(model)}Shadow`;
                const currentUser = await getCurrentUser();

                // safeguard against tables that do not have a shadow table counterpart
                if (
                  !(prismaClient as Record<string, any>)[shadowModelName] ||
                  !currentUser
                ) {
                  return query(args);
                }

                const queryResult = await query(args);

                if (!queryResult)
                  throw new Error("Auditing: Query result is null");

                const shadowOperationType: ChangeTypeEnum = getOperationType(
                  operation,
                  "data" in args &&
                    args.data &&
                    "deletedAt" in args.data &&
                    Boolean(args.data.deletedAt),
                );

                const queryResultWithoutId = omit(
                  queryResult as unknown as object,
                  "id",
                );

                for (const key in queryResultWithoutId) {
                  const value = (queryResultWithoutId as Record<string, any>)[
                    key
                  ];

                  if (
                    Array.isArray(value) ||
                    (typeof value === "object" && !(value instanceof Date))
                  ) {
                    delete (queryResultWithoutId as Record<string, any>)[key];
                  }
                }

                // creates a shadow record
                await (prismaClient as Record<string, any>)[
                  shadowModelName
                ].create({
                  data: {
                    ...queryResultWithoutId,
                    changeType: shadowOperationType,
                    timestamp: new Date(),
                    [`source${model}Id`]: (queryResult as unknown as any).id,
                    updatedById: currentUser.id,
                  },
                });

                return queryResult;
              }
              case "upsert": {
                const shadowModelName = `${Case.camel(model)}Shadow`;
                const clientId = loggerContext.get("client");
                const currentUser = await getCurrentUser();
                const queryResult = await query(args);

                if (!queryResult)
                  throw new Error("Auditing: Query result is null");

                const queryResultWithoutId = omit(
                  queryResult as Record<string, any>,
                  "id",
                );

                // safeguard against tables that do not have a shadow table counterpart
                if (
                  !(prismaClient as Record<string, any>)[shadowModelName] ||
                  !currentUser
                ) {
                  return queryResult;
                }

                if (queryResult === null) {
                  throw new Error("Query result is null");
                }

                const existingItem = await (
                  prismaClient as Record<string, any>
                )[Case.camel(model)].findFirst({
                  where: {
                    id: (queryResult as Record<string, any>).id,
                  },
                });

                let changeType: ChangeTypeEnum = ChangeTypeEnum.CREATE;

                if (existingItem) {
                  changeType = ChangeTypeEnum.UPDATE;
                }

                // creates a shadow record
                await (prismaClient as Record<string, any>)[
                  shadowModelName
                ].create({
                  data: {
                    ...queryResultWithoutId,
                    changeType,
                    timestamp: new Date(),
                    [`source${model}Id`]: (queryResult as unknown as any).id,
                    updatedById: currentUser.id,
                  },
                });

                return queryResult;
              }
              case "updateMany": {
                const shadowModelName = `${Case.camel(model)}Shadow`;
                const clientId = loggerContext.get("client");
                const currentUser = await getCurrentUser();

                // safeguard against tables that do not have a shadow table counterpart
                if (
                  !(prismaClient as Record<string, any>)[shadowModelName] ||
                  !currentUser
                ) {
                  return query(args);
                }

                const queryResult = await query(args);

                if (!queryResult)
                  throw new Error("Auditing: Query result is null");

                const rowsToUpdate = await (
                  prismaClient as Record<string, any>
                )[model].findMany({
                  where: args.where,
                });

                const shadowOperationType: ChangeTypeEnum = getOperationType(
                  operation,
                  "data" in args &&
                    "deletedAt" in args.data &&
                    Boolean(args.data.deletedAt),
                );

                await (prismaClient as Record<string, any>)[
                  shadowModelName
                ].createMany({
                  data: rowsToUpdate.map((claim: Record<string, any>) => ({
                    ...claim,
                    id: undefined,
                    changeType: shadowOperationType,
                    timestamp: new Date(),
                    [`source${model}Id`]: (claim as unknown as any).id,
                    updatedById: currentUser.id,
                  })),
                });

                return queryResult;
              }
              case "createMany": {
                const shadowModelName = `${Case.camel(model)}Shadow`;
                const clientId = loggerContext.get("client");
                const currentUser = await getCurrentUser();

                // safeguard against tables that do not have a shadow table counterpart
                if (
                  !(prismaClient as Record<string, any>)[shadowModelName] ||
                  !currentUser
                ) {
                  return query(args);
                }

                const newRecordsData = args.data as object[];
                const newRecords = newRecordsData.map((record) => {
                  const id = (record as any)?.id || uuidV4();

                  return {
                    ...record,
                    id,
                  };
                });

                const queryResult = await query({ data: newRecords });

                if (!queryResult)
                  throw new Error("Auditing: Query result is null");

                const shadowOperationType: ChangeTypeEnum = getOperationType(
                  operation,
                  "data" in args &&
                    "deletedAt" in args.data &&
                    Boolean(args.data.deletedAt),
                );

                const shadowRecords = newRecords.map((record) => {
                  for (const key in record) {
                    const value = (record as Record<string, any>)[key];

                    if (
                      Array.isArray(value) ||
                      (typeof value === "object" && !(value instanceof Date))
                    ) {
                      delete (record as Record<string, any>)[key];
                    }
                  }

                  return {
                    ...record,
                    changeType: shadowOperationType,
                    timestamp: new Date(),
                    [`source${model}Id`]: record.id,
                    updatedById: currentUser.id,
                    id: undefined,
                  };
                });

                await (prismaClient as Record<string, any>)[
                  shadowModelName
                ].createMany({
                  data: shadowRecords,
                });

                return queryResult;
              }
            }

            return query(args);
          },*/
        },
      },
    })
  })
