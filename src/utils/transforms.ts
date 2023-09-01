import {
  Network,
  Environment,
  NetworkId,
  TokenInfo,
  TokenInfoDTO,
} from '../types'

// Transforms the Celo tokens info data in this repo into the format used in the RTDB collection
export function transformCeloTokensForRTDB(
  celoTokensInfo: TokenInfo[],
): Record<string, Omit<TokenInfo, 'isNative'>> {
  return Object.fromEntries(
    celoTokensInfo.map((rawTokenInfo) => {
      const { address, isNative, ...rest } = rawTokenInfo
      return [address, { address, ...rest }]
    }),
  )
}

const EnvironmentToNetworkIds: Record<
  Environment,
  Record<Network, NetworkId>
> = {
  mainnet: {
    [Network.ethereum]: NetworkId['ethereum-mainnet'],
    [Network.celo]: NetworkId['celo-mainnet'],
  },
  testnet: {
    [Network.ethereum]: NetworkId['ethereum-sepolia'],
    [Network.celo]: NetworkId['celo-alfajores'],
  },
}

export function getTokenInfoDTO(
  tokenInfo: TokenInfo,
  network: NetworkId,
): TokenInfoDTO {
  return {
    ...tokenInfo,
    tokenId: `${network}_${tokenInfo.isNative ? 'native' : tokenInfo.address}`,
  }
}

export function getNetworkToTokensInfoDTO(
  networkToTokensInfo: Record<Network, TokenInfo[]>,
  environment: Environment,
): Record<Network, TokenInfoDTO[]> {
  const networkToId = EnvironmentToNetworkIds[environment]
  const output = {} as Record<Network, TokenInfoDTO[]>
  for (const [network, tokensInfo] of Object.entries(networkToTokensInfo) as [
    Network,
    TokenInfo[],
  ][]) {
    output[network] = tokensInfo.map((tokenInfo) =>
      getTokenInfoDTO(tokenInfo, networkToId[network]),
    )
  }
  return output
}
