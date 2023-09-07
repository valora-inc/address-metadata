import { _getTokensInfoHttpFunction } from './index'
import mocked = jest.mocked
import { loadConfig } from './config'

jest.mock('./config')

describe('index', () => {
  it('_getTokensInfoHttpFunction', async () => {
    const req = {} as any
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any
    mocked(loadConfig).mockReturnValue({
      project: 'mainnet',
      databaseUrl: 'mock-db-url',
      gcloudProject: 'celo-mobile-mainnet',
    })
    await _getTokensInfoHttpFunction(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({
      celo: expect.any(Array),
      ethereum: expect.any(Array),
    })
  })
})
