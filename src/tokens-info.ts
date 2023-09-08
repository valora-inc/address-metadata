import { Network, NetworkId, TokenInfo } from './types'
import CeloMainnetTokensInfo from './data/mainnet/celo-tokens-info.json'
import CeloAlfajoresTokensInfo from './data/testnet/celo-alfajores-tokens-info.json'
import EthereumMainnetTokensInfo from './data/mainnet/ethereum-tokens-info.json'
import EthereumSepoliaTokensInfo from './data/testnet/ethereum-sepolia-tokens-info.json'

const networkIdToTokensInfo: Record<NetworkId, Omit<TokenInfo, 'network'>[]> = {
  [NetworkId['celo-mainnet']]: CeloMainnetTokensInfo,
  [NetworkId['celo-alfajores']]: CeloAlfajoresTokensInfo,
  [NetworkId['ethereum-mainnet']]: EthereumMainnetTokensInfo,
  [NetworkId['ethereum-sepolia']]: EthereumSepoliaTokensInfo,
}

const networkIdToNetwork: Record<NetworkId, Network> = {
  [NetworkId['celo-mainnet']]: Network.celo,
  [NetworkId['celo-alfajores']]: Network.celo,
  [NetworkId['ethereum-mainnet']]: Network.ethereum,
  [NetworkId['ethereum-sepolia']]: Network.ethereum,
}

export function getTokenId(
  { isNative, address }: Partial<TokenInfo>,
  networkId: NetworkId,
): string {
  return `${networkId}:${isNative ? 'native' : address}`
}

export function getTokensInfo(networkIds: NetworkId[]): {
  [tokenId: string]: TokenInfo
} {
  const output: { [tokenId: string]: TokenInfo } = {}
  for (const networkId of networkIds) {
    const network = networkIdToNetwork[networkId]
    for (const tokenInfo of networkIdToTokensInfo[networkId]) {
      output[getTokenId(tokenInfo, networkId)] = { ...tokenInfo, network }
    }
  }
  return output
}
