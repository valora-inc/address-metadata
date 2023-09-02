import { getTokenInfoDTO } from './transforms'
import { NetworkId } from '../types'

describe('transforms tests', () => {
  it('getTokenInfoDTO', () => {
    expect(
      getTokenInfoDTO(
        {
          address: '0x471ece3750da237f93b8e339c536989b8978a438',
          name: 'Poof',
          symbol: 'POOF',
          decimals: 18,
        },
        NetworkId['celo-mainnet'],
      ),
    ).toEqual({
      address: '0x471ece3750da237f93b8e339c536989b8978a438',
      name: 'Poof',
      symbol: 'POOF',
      decimals: 18,
      tokenId: 'celo-mainnet_0x471ece3750da237f93b8e339c536989b8978a438',
    })
  })
  it('getTokenInfoDTO: works for native tokens with or without address', () => {
    expect(
      getTokenInfoDTO(
        {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
          isNative: true,
        },
        NetworkId['ethereum-mainnet'],
      ),
    ).toEqual({
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      isNative: true,
      tokenId: 'ethereum-mainnet_native',
    })
    expect(
      getTokenInfoDTO(
        {
          address: '0x471ece3750da237f93b8e339c536989b8978a438',
          name: 'Celo',
          symbol: 'CELO',
          isNative: true,
          decimals: 18,
        },
        NetworkId['celo-mainnet'],
      ),
    ).toEqual({
      address: '0x471ece3750da237f93b8e339c536989b8978a438',
      name: 'Celo',
      symbol: 'CELO',
      isNative: true,
      decimals: 18,
      tokenId: 'celo-mainnet_native',
    })
  })
  it.todo('getNetworkToTokensInfoDTO')
})
