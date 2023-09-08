import { TokenInfo } from '../types'

type CeloRTDBTokenInfo = Omit<TokenInfo, 'network' | 'isNative'>

// Transforms the Celo tokens info data in this repo into the format used in the RTDB collection
export function transformCeloTokensForRTDB(
  celoTokensInfo: Omit<TokenInfo, 'network'>[],
): Record<string, CeloRTDBTokenInfo> {
  return Object.fromEntries(
    celoTokensInfo.map((rawTokenInfo) => {
      const { address, isNative, ...rest } = rawTokenInfo
      return [address, { address, ...rest }]
    }),
  )
}
