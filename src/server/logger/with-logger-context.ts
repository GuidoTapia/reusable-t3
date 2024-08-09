import { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { v4 } from "uuid"

import { loggerContext } from "./logger-context"

export const withLoggerContext = (handler: NextApiHandler) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    return loggerContext.run(() => {
      const correlationId = v4()

      req.headers["x-correlation-id"] = correlationId

      loggerContext.set("correlationId", correlationId)
      loggerContext.set("timestamp", Date.now())
      loggerContext.set("request", req)
      loggerContext.set("response", res)

      return handler(req, res)
    })
  }
}
