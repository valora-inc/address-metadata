import { TokenInfoJSON } from '../types'

type CeloRTDBTokenInfo = Omit<TokenInfoJSON, 'isNative' | 'bridge'>

// Transforms the Celo tokens info data in this repo into the format used in the RTDB collection
export function transformCeloTokensForRTDB(
  celoTokensInfo: TokenInfoJSON[],
): Record<string, CeloRTDBTokenInfo> {
  return Object.fromEntries(
    celoTokensInfo.map((rawTokenInfo) => {
      const { address, isNative, bridge, name: rawName, ...rest } = rawTokenInfo
      const name = bridge ? `${rawName} (${bridge})` : rawName
      return [address, { address, name, ...rest }]
    }),
  )
}
