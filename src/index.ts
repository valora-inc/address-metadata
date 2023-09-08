import {
  Network,
  Environment,
  OverrideType,
  RTDBMetadata,
  TokenInfo,
  NetworkId,
} from './types'
import CeloMainnetTokensInfo from './data/mainnet/celo-tokens-info.json'
import CeloAlfajoresTokensInfo from './data/testnet/celo-alfajores-tokens-info.json'
import EthereumMainnetTokensInfo from './data/mainnet/ethereum-tokens-info.json'
import EthereumSepoliaTokensInfo from './data/testnet/ethereum-sepolia-tokens-info.json'
import MainnetAddressesExtraInfo from './data/mainnet/addresses-extra-info.json'
import TestnetAddressesExtraInfo from './data/testnet/addresses-extra-info.json'
import AddressesExtraInfoSchema from './schemas/addresses-extra-info'
import { transformCeloTokensForRTDB } from './utils/transforms'
import { RTDBAddressToTokenInfoSchema } from './schemas/tokens-info'
import { HttpFunction } from '@google-cloud/functions-framework'
import { wrap } from './wrap'
import { loadCloudFunctionConfig } from './config'

export function getCeloRTDBMetadata(environment: Environment): RTDBMetadata[] {
  const [tokensInfo, addressesExtraInfo] =
    environment === 'mainnet'
      ? [CeloMainnetTokensInfo, MainnetAddressesExtraInfo]
      : [CeloAlfajoresTokensInfo, TestnetAddressesExtraInfo]
  return [
    {
      data: addressesExtraInfo,
      schema: AddressesExtraInfoSchema,
      rtdbLocation: 'addressesExtraInfo',
      overrideType: OverrideType.OverrideAll,
    },
    {
      data: transformCeloTokensForRTDB(tokensInfo),
      schema: RTDBAddressToTokenInfoSchema,
      rtdbLocation: 'tokensInfo',
      overrideType: OverrideType.DeleteMissingKeysAndUpdate,
    },
  ]
}

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

export function _getTokensInfo(networkIds: NetworkId[]): {
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

export const _getTokensInfoHttpFunction: HttpFunction = async (_req, res) => {
  const { networkIds } = loadCloudFunctionConfig() // in the future we could use this as a default set of network id's to include in the response, and accept a list of network id's as a query param to override it
  const tokensInfo = _getTokensInfo(networkIds)
  res.status(200).send({ ...tokensInfo })
}

// named this way to avoid collision with cloud function getTokensInfo from valora-rest-api.
//  TODO deprecate getTokensInfo cloud function from valora-rest-api
export const getTokensInfoCF: HttpFunction = wrap({
  loadConfig: loadCloudFunctionConfig,
  httpFunction: _getTokensInfoHttpFunction,
})
