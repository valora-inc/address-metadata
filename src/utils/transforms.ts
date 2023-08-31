import { TokenInfo } from '../types'

// Transforms the Celo tokens info data in this repo into the format used in the RTDB collection
export function transformCeloTokensInfo(
  celoTokensInfo: TokenInfo[],
): Record<string, Omit<TokenInfo, 'isNative'>> {
  return Object.fromEntries(
    celoTokensInfo.map((rawTokenInfo) => {
      const { address, isNative, ...rest } = rawTokenInfo
      return [address, { address, ...rest }]
    }),
  )
}
