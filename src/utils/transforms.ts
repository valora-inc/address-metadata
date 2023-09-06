import { NetworkId, TokenInfo } from '../types'

type PreIdTokenInfo = Omit<TokenInfo, 'tokenId'> // token info from JSON files. the JSON file's name implies the network id, which is used along with isNative and address to compute a token id

type CeloRTDBTokenInfo = Omit<PreIdTokenInfo, 'isNative'>

// Transforms the Celo tokens info data in this repo into the format used in the RTDB collection
export function transformCeloTokensForRTDB(
  celoTokensInfo: PreIdTokenInfo[],
): Record<string, CeloRTDBTokenInfo> {
  return Object.fromEntries(
    celoTokensInfo.map((rawTokenInfo) => {
      const { address, isNative, ...rest } = rawTokenInfo
      return [address, { address, ...rest }]
    }),
  )
}

export function addTokenIds(
  partialTokenInfo: PreIdTokenInfo[],
  networkId: NetworkId,
): TokenInfo[] {
  return partialTokenInfo.map((token) => ({
    ...token,
    tokenId: `${networkId}:${token.isNative ? 'native' : token.address}`,
  }))
}
