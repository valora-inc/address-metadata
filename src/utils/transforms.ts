import { TokenInfoJSON } from '../types'

type CeloRTDBTokenInfo = Omit<
  TokenInfoJSON,
  'isNative' | 'bridge' | 'isL2Native'
>

// Transforms the Celo tokens info data in this repo into the format used in the RTDB collection
export function transformCeloTokensForRTDB(
  celoTokensInfo: TokenInfoJSON[],
): Record<string, CeloRTDBTokenInfo> {
  return Object.fromEntries(
    celoTokensInfo.map((rawTokenInfo) => {
      const {
        address,
        isNative,
        bridge,
        isL2Native,
        name: rawName,
        ...rest
      } = rawTokenInfo
      const name = bridge ? `${rawName} (${bridge})` : rawName
      const isCoreToken = rawTokenInfo.isFeeCurrency // for backwards compatibility. `isCoreToken` is deprecated
      return [
        address,
        {
          address,
          name,
          ...rest,
          ...(isCoreToken !== undefined ? { isCoreToken } : null),
        },
      ]
    }),
  )
}
