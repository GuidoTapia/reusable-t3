import { createNamespace } from "cls-hooked"
import { NextApiRequest, NextApiResponse } from "next"
import { Session } from "next-auth"

type LoggerContext = Partial<{
  session: Session | null
  correlationId: string
  timestamp: number
  request: NextApiRequest
  response: NextApiResponse
  client: string
}>

export const loggerContext = createNamespace<LoggerContext>("logger-context")
