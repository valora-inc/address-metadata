import { _getTokensInfoHttpFunction } from './index'
import { loadCloudFunctionConfig } from './config'
import { NetworkId } from './types'
import mocked = jest.mocked

jest.mock('./config')

describe('index', () => {
  it('_getTokensInfoHttpFunction', async () => {
    const req = {} as any
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any
    mocked(loadCloudFunctionConfig).mockReturnValue({
      networkIds: [NetworkId['ethereum-mainnet'], NetworkId['celo-mainnet']],
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
