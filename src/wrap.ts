import {
  HttpFunction,
  Request,
  Response,
} from '@google-cloud/functions-framework'
import { getLoggingMiddleware, logger } from './log'
import { ValoraGcloudProject } from './types'
import { asyncHandler } from '@valora/http-handler'

export function wrap({
  httpFunction,
  loadConfig,
}: {
  httpFunction: HttpFunction
  loadConfig: () => { gcloudProject: ValoraGcloudProject }
}): HttpFunction {
  const asyncHttpFunction = asyncHandler(httpFunction, logger)
  return (req: Request, res: Response) => {
    const loggingMiddleware = getLoggingMiddleware(loadConfig().gcloudProject)
    return loggingMiddleware(req, res, () => asyncHttpFunction(req, res))
  }
}
