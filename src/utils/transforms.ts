import { CeloTokenInfo } from '../types'

// Transforms the raw tokens info data in this repo, into the format used in the RTDB collection
export function transformRawTokensInfo(rawTokensInfo: CeloTokenInfo[]) {
  return Object.fromEntries(
    rawTokensInfo.map((rawTokenInfo) => {
      return [rawTokenInfo.address, rawTokenInfo]
    }),
  )
}
