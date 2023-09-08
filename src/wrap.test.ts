import mocked = jest.mocked
import { getLoggingMiddleware, logger } from './log'
import { wrap } from './wrap'
import { Request, Response } from '@google-cloud/functions-framework'
import { asyncHandler } from '@valora/http-handler'

jest.mock('./log')
jest.mock('@valora/http-handler')

describe('wrap', () => {
  it('wraps a function with logging middleware and async handler', () => {
    const mockLoggingMiddleware = jest
      .fn()
      .mockImplementation((req, res, next) => next(req, res)) // this mock just lets us check that 'next' is set to the httpFunction parameter given to 'wrap'
    mocked(getLoggingMiddleware).mockReturnValue(mockLoggingMiddleware)
    const mockHttpFunction = jest.fn()
    const mockAsyncHttpFunction = jest.fn()
    mocked(asyncHandler).mockReturnValue(mockAsyncHttpFunction)
    const mockLoadConfig = jest
      .fn()
      .mockReturnValue({ gcloudProject: 'test-gcloud-project' })
    const wrapped = wrap({
      httpFunction: mockHttpFunction,
      loadConfig: mockLoadConfig,
    })
    expect(mockLoadConfig).not.toHaveBeenCalled() // don't call loadConfig until the wrapped function is called
    expect(asyncHandler).toHaveBeenCalledWith(mockHttpFunction, logger)
    const mockReq = {} as Request
    const mockRes = {} as Response
    wrapped(mockReq, mockRes)
    expect(mockLoadConfig).toHaveBeenCalled()
    expect(getLoggingMiddleware).toHaveBeenCalledWith('test-gcloud-project')
    expect(mockLoggingMiddleware).toHaveBeenCalledWith(
      mockReq,
      mockRes,
      expect.any(Function),
    )
    expect(mockAsyncHttpFunction).toHaveBeenCalledWith(mockReq, mockRes)
  })
})
