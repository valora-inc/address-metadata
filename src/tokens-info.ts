import { NetworkId, NetworkName, TokenInfo, TokenInfoJSON } from './types'
import CeloMainnetTokensInfo from './data/mainnet/celo-tokens-info.json'
import CeloAlfajoresTokensInfo from './data/testnet/celo-alfajores-tokens-info.json'
import EthereumMainnetTokensInfo from './data/mainnet/ethereum-tokens-info.json'
import EthereumSepoliaTokensInfo from './data/testnet/ethereum-sepolia-tokens-info.json'

const networkIdToTokensInfo: Record<NetworkId, TokenInfoJSON[]> = {
  [NetworkId['celo-mainnet']]: CeloMainnetTokensInfo,
  [NetworkId['celo-alfajores']]: CeloAlfajoresTokensInfo,
  [NetworkId['ethereum-mainnet']]: EthereumMainnetTokensInfo,
  [NetworkId['ethereum-sepolia']]: EthereumSepoliaTokensInfo,
}

const networkIdToNetworkName: Record<NetworkId, NetworkName> = {
  [NetworkId['celo-mainnet']]: NetworkName.Celo,
  [NetworkId['celo-alfajores']]: NetworkName.Celo,
  [NetworkId['ethereum-mainnet']]: NetworkName.Ethereum,
  [NetworkId['ethereum-sepolia']]: NetworkName.Ethereum,
}

export function getTokenId(
  { isNative, address }: Partial<TokenInfo>,
  networkId: NetworkId,
): string {
  return `${networkId}:${isNative ? 'native' : address}`
}

export function getTokensInfoByNetworkIds(networkIds: NetworkId[]): {
  [tokenId: string]: TokenInfo
} {
  const output: { [tokenId: string]: TokenInfo } = {}
  for (const networkId of networkIds) {
    const nativeImageUrl = networkIdToTokensInfo[networkId].find(
      (tokenInfo) => tokenInfo.isNative,
    )?.imageUrl
    for (const tokenInfo of networkIdToTokensInfo[networkId]) {
      const tokenId = getTokenId(tokenInfo, networkId)
      output[tokenId] = {
        ...tokenInfo,
        networkId,
        tokenId,
        networkName: networkIdToNetworkName[networkId],
        networkIconUrl: tokenInfo.isNative ? undefined : nativeImageUrl,
      }
    }
  }
  return output
}
