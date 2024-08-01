import { WinstonTransport as AxiomTransport } from "@axiomhq/winston"
import { isUndefined, omitBy } from "lodash"
import { memoryUsage } from "node:process"
import winston, { format, transports } from "winston"
import { consoleFormat } from "winston-console-format"

import { env } from "~/env/server.mjs"

import { loggerContext } from "./logger-context"

const prodTransports = winston.createLogger({
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    // You can pass an option here, if you don't the transport is configured automatically
    // using environment variables like `AXIOM_DATASET` and `AXIOM_TOKEN`
    new AxiomTransport({
      dataset: env.AXIOM_DATASET,
      token: env.AXIOM_TOKEN ?? "",
    }),
  ],
})

const devTransport = new transports.Console({
  format: format.combine(
    format.colorize({ all: true }),
    format.padLevels(),
    consoleFormat({
      showMeta: true,
      metaStrip: ["request"],
      inspectOptions: {
        depth: Number.POSITIVE_INFINITY,
        colors: true,
        maxArrayLength: Number.POSITIVE_INFINITY,
        breakLength: 120,
        compact: Number.POSITIVE_INFINITY,
      },
    }),
  ),
})

const isProd = env.NODE_ENV === "production"
const transport = isProd ? prodTransports : devTransport

export const logger = winston.createLogger({
  level: env.LOG_LEVEL || "info",
  transports: transport,
  exceptionHandlers: transport,
  rejectionHandlers: transport,
  ...(isProd && {
    defaultMeta: {
      environment: isProd,
      get request() {
        return buildRequestMeta()
      },
    },
  }),
})

type LogArg = unknown

export interface Logger {
  info(...args: LogArg[]): void
  warn(...args: LogArg[]): void
  error(...args: LogArg[]): void
  debug(...args: LogArg[]): void
}

const formatMemoryUsage = (bytes: number) =>
  `${Math.round((bytes / 1024 / 1024) * 100) / 100}MB`

function buildRequestMeta() {
  const req = loggerContext.get("request")
  const session = loggerContext.get("session")
  const timestamp = loggerContext.get("timestamp")
  const correlationId = loggerContext.get("correlationId")

  const url = new URL(`${env.NEXT_PUBLIC_APP_URL}${req?.url ?? ""}`)
  const searchParams = JSON.stringify([...url.searchParams.entries()])
  const { rss, heapUsed, heapTotal } = memoryUsage()

  const meta = omitBy(
    {
      host: req?.headers.host,
      id: correlationId,
      ip: req?.headers["x-forwarded-for"],
      method: req?.method,
      path: url.pathname,
      search: url.search,
      searchParams: searchParams,
      scheme: req?.headers?.referer?.split("://")[0],
      statusCode: req?.statusCode,
      userAgent: req?.headers["user-agent"],
      userId: session?.user?.id,
      timestamp: timestamp,
      processMemory: formatMemoryUsage(rss),
      heapMemory: `${formatMemoryUsage(heapUsed)} used / ${formatMemoryUsage(
        heapTotal,
      )} allocated`,
    },
    isUndefined,
  )

  return meta
}
