import { NetworkId, TokenInfoProcessed, TokenInfoJSON } from './types'
import CeloMainnetTokensInfo from './data/mainnet/celo-tokens-info.json'
import CeloAlfajoresTokensInfo from './data/testnet/celo-alfajores-tokens-info.json'
import EthereumMainnetTokensInfo from './data/mainnet/ethereum-tokens-info.json'
import EthereumSepoliaTokensInfo from './data/testnet/ethereum-sepolia-tokens-info.json'

const networkIdToTokensInfo: Record<NetworkId, TokenInfoJSON[]> =
  {
    [NetworkId['celo-mainnet']]: CeloMainnetTokensInfo,
    [NetworkId['celo-alfajores']]: CeloAlfajoresTokensInfo,
    [NetworkId['ethereum-mainnet']]: EthereumMainnetTokensInfo,
    [NetworkId['ethereum-sepolia']]: EthereumSepoliaTokensInfo,
  }

export function getTokenId(
  { isNative, address }: Partial<TokenInfoProcessed>,
  networkId: NetworkId,
): string {
  return `${networkId}:${isNative ? 'native' : address}`
}

export function getTokensInfoByNetworkIds(networkIds: NetworkId[]): {
  [tokenId: string]: TokenInfoProcessed
} {
  const output: { [tokenId: string]: TokenInfoProcessed } = {}
  for (const networkId of networkIds) {
    for (const tokenInfo of networkIdToTokensInfo[networkId]) {
      output[getTokenId(tokenInfo, networkId)] = { ...tokenInfo, networkId, tokenId: getTokenId(tokenInfo, networkId) }
    }
  }
  return output
}
