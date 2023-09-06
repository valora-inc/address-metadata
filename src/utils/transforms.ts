import { NetworkId, TokenInfo } from '../types'

type CeloRTDBTokenInfo = Omit<TokenInfo, 'isNative' | 'networkId'>

// Transforms the Celo tokens info data in this repo into the format used in the RTDB collection
export function transformCeloTokensForRTDB(
  celoTokensInfo: Omit<TokenInfo, 'networkId'>[],
): Record<string, CeloRTDBTokenInfo> {
  return Object.fromEntries(
    celoTokensInfo.map((rawTokenInfo) => {
      const { address, isNative, ...rest } = rawTokenInfo
      return [address, { address, ...rest }]
    }),
  )
}

export function addNetworkId(
  partialTokenInfo: Omit<TokenInfo, 'networkId'>[],
  networkId: NetworkId,
): TokenInfo[] {
  return partialTokenInfo.map((token) => ({ ...token, networkId }))
}
