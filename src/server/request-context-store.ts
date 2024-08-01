import { createNamespace } from "cls-hooked"
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { Session } from "next-auth"
import { v4 } from "uuid"

type RequestContext = {
  session?: Session | null
  correlationId?: string
}

export const requestContext = createNamespace<RequestContext>("request-context")

export const withRequestContext = (handler: NextApiHandler) => {
  return (req: NextApiRequest, res: NextApiResponse<unknown>) => {
    return requestContext.run(() => {
      const correlationId = v4()
      requestContext.set("correlationId", correlationId)
      return handler(req, res)
    })
  }
}
