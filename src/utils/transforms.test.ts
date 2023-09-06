import { addNetworkIdAndTokenIds } from './transforms'
import { NetworkId } from '../types'

describe('transforms', () => {
  it('addNetworkIdAndTokenIds', () => {
    expect(
      addNetworkIdAndTokenIds(
        [
          {
            name: 'New erc20 token',
            symbol: 'NET',
            decimals: 18,
            address: '0x123',
          },
          {
            name: 'New native token',
            symbol: 'NNT',
            decimals: 18,
            isNative: true,
          },
        ],
        NetworkId['celo-alfajores'],
      ),
    ).toEqual([
      {
        name: 'New erc20 token',
        symbol: 'NET',
        decimals: 18,
        address: '0x123',
        networkId: NetworkId['celo-alfajores'],
        tokenId: `${NetworkId['celo-alfajores']}:0x123`,
      },
      {
        name: 'New native token',
        symbol: 'NNT',
        decimals: 18,
        isNative: true,
        networkId: NetworkId['celo-alfajores'],
        tokenId: `${NetworkId['celo-alfajores']}:native`,
      },
    ])
  })
})
