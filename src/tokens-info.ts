import { NetworkId, TokenInfo, TokenInfoJSON } from './types'
import CeloMainnetTokensInfo from './data/mainnet/celo-tokens-info.json'
import CeloAlfajoresTokensInfo from './data/testnet/celo-alfajores-tokens-info.json'
import EthereumMainnetTokensInfo from './data/mainnet/ethereum-tokens-info.json'
import EthereumSepoliaTokensInfo from './data/testnet/ethereum-sepolia-tokens-info.json'
import ArbitrumOneTokensInfo from './data/mainnet/arbitrum-one-tokens-info.json'
import ArbitrumSepoliaTokensInfo from './data/testnet/arbitrum-sepolia-tokens-info.json'
import OptimismMainnetTokensInfo from './data/mainnet/optimism-tokens-info.json'
import OptimismSepoliaTokensInfo from './data/testnet/optimism-sepolia-tokens-info.json'
import PolygonPoSMainnetTokensInfo from './data/mainnet/polygon-pos-tokens-info.json'
import PolygonPoSAmoyTokensInfo from './data/testnet/polygon-pos-amoy-tokens-info.json'
import BaseMainnetTokensInfo from './data/mainnet/base-tokens-info.json'
import BaseSepoliaTokensInfo from './data/testnet/base-sepolia-tokens-info.json'

const networkIdToTokensInfo: Record<NetworkId, TokenInfoJSON[]> = {
  [NetworkId['celo-mainnet']]: CeloMainnetTokensInfo,
  [NetworkId['celo-alfajores']]: CeloAlfajoresTokensInfo,
  [NetworkId['ethereum-mainnet']]: EthereumMainnetTokensInfo,
  [NetworkId['ethereum-sepolia']]: EthereumSepoliaTokensInfo,
  [NetworkId['arbitrum-one']]: ArbitrumOneTokensInfo,
  [NetworkId['arbitrum-sepolia']]: ArbitrumSepoliaTokensInfo,
  [NetworkId['op-mainnet']]: OptimismMainnetTokensInfo,
  [NetworkId['op-sepolia']]: OptimismSepoliaTokensInfo,
  [NetworkId['polygon-pos-mainnet']]: PolygonPoSMainnetTokensInfo,
  [NetworkId['polygon-pos-amoy']]: PolygonPoSAmoyTokensInfo,
  [NetworkId['base-mainnet']]: BaseMainnetTokensInfo,
  [NetworkId['base-sepolia']]: BaseSepoliaTokensInfo,
}

const networkIdToNetworkIconUrl: Record<NetworkId, string> = {
  [NetworkId['ethereum-mainnet']]:
    'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/ETH.png',
  [NetworkId['ethereum-sepolia']]:
    'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/ETH.png',
  [NetworkId['celo-mainnet']]:
    'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/CELO.png',
  [NetworkId['celo-alfajores']]:
    'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/CELO.png',
  [NetworkId['arbitrum-one']]:
    'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/ARB.png',
  [NetworkId['arbitrum-sepolia']]:
    'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/ARB.png',
  [NetworkId['op-mainnet']]:
    'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/OP.png',
  [NetworkId['op-sepolia']]:
    'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/OP.png',
  [NetworkId['polygon-pos-mainnet']]:
    'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/MATIC.png',
  [NetworkId['polygon-pos-amoy']]:
    'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/MATIC.png',
  [NetworkId['base-mainnet']]:
    'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/BASE.png',
  [NetworkId['base-sepolia']]:
    'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/BASE.png',
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
    const networkIconUrl = networkIdToNetworkIconUrl[networkId]
    for (const tokenInfo of networkIdToTokensInfo[networkId]) {
      const tokenId = getTokenId(tokenInfo, networkId)
      output[tokenId] = {
        ...tokenInfo,
        networkId,
        tokenId,
        networkIconUrl:
          tokenInfo.isNative && !tokenInfo.isL2Native
            ? undefined
            : networkIconUrl,
        isCoreToken: tokenInfo.isFeeCurrency, // for backwards compatibility. `isCoreToken` is deprecated
      }
    }
  }
  return output
}
