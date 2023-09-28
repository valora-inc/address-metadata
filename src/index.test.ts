import { _getTokensInfoHttpFunction } from './index'
import { loadCloudFunctionConfig } from './config'
import { NetworkId } from './types'
import { getTokensInfoByNetworkIds } from './tokens-info'
import mocked = jest.mocked

jest.mock('./config')
jest.mock('./tokens-info')

describe('index', () => {
  it('_getTokensInfoHttpFunction', async () => {
    const req = {} as any
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any
    mocked(loadCloudFunctionConfig).mockReturnValue({
      networkIds: [NetworkId['ethereum-mainnet'], NetworkId['celo-mainnet']],
      gcloudProject: 'celo-mobile-mainnet',
    })
    const mockTokensInfo = {
      'ethereum-mainnet:native': {
        tokenId: 'ethereum-mainnet:native',
        networkId: NetworkId['ethereum-mainnet'],
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
        isNative: true,
        imageUrl:
          'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/ETH.png',
      },
      'celo-mainnet:native': {
        tokenId: 'celo-mainnet:native',
        address: '0x471ece3750da237f93b8e339c536989b8978a438',
        decimals: 18,
        imageUrl:
          'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/CELO.png',
        isCoreToken: true,
        name: 'Celo',
        symbol: 'CELO',
        isNative: true,
        networkId: NetworkId['celo-mainnet'],
      },
    }
    mocked(getTokensInfoByNetworkIds).mockReturnValue(mockTokensInfo)
    await _getTokensInfoHttpFunction(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(mockTokensInfo)
  })
})
