import { addTokenIds } from './transforms'
import { NetworkId } from '../types'

describe('transforms', () => {
  it('addTokenIds', () => {
    expect(
      addTokenIds(
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
        'test-network-id' as NetworkId,
      ),
    ).toEqual([
      {
        name: 'New erc20 token',
        symbol: 'NET',
        decimals: 18,
        address: '0x123',
        tokenId: `test-network-id:0x123`,
      },
      {
        name: 'New native token',
        symbol: 'NNT',
        decimals: 18,
        isNative: true,
        tokenId: `test-network-id:native`,
      },
    ])
  })
})
