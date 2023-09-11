import {
  Network,
  Environment,
  OverrideType,
  RTDBMetadata,
  TokenInfo,
  NetworkId,
} from './types'
import CeloMainnetTokensInfo from './data/mainnet/celo-tokens-info.json'
import CeloTestnetTokensInfo from './data/testnet/celo-alfajores-tokens-info.json'
import EthereumMainnetTokensInfo from './data/mainnet/ethereum-tokens-info.json'
import EthereumTestnetTokensInfo from './data/testnet/ethereum-sepolia-tokens-info.json'
import MainnetAddressesExtraInfo from './data/mainnet/addresses-extra-info.json'
import TestnetAddressesExtraInfo from './data/testnet/addresses-extra-info.json'
import AddressesExtraInfoSchema from './schemas/addresses-extra-info'
import { addTokenIds, transformCeloTokensForRTDB } from './utils/transforms'
import { RTDBAddressToTokenInfoSchema } from './schemas/tokens-info'
import { HttpFunction } from '@google-cloud/functions-framework'
import { wrap } from './wrap'
import { loadCloudFunctionConfig } from './config'

export function getCeloRTDBMetadata(environment: Environment): RTDBMetadata[] {
  const [tokensInfo, addressesExtraInfo] =
    environment === 'mainnet'
      ? [CeloMainnetTokensInfo, MainnetAddressesExtraInfo]
      : [CeloTestnetTokensInfo, TestnetAddressesExtraInfo]
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

export function _getTokensInfo(
  environment: Environment,
): Record<Network, TokenInfo[]> {
  return environment === 'mainnet'
    ? {
        [Network.ethereum]: addTokenIds(
          EthereumMainnetTokensInfo,
          NetworkId['ethereum-mainnet'],
        ),
        [Network.celo]: addTokenIds(
          CeloMainnetTokensInfo,
          NetworkId['celo-mainnet'],
        ),
      }
    : {
        [Network.ethereum]: addTokenIds(
          EthereumTestnetTokensInfo,
          NetworkId['ethereum-sepolia'],
        ),
        [Network.celo]: addTokenIds(
          CeloTestnetTokensInfo,
          NetworkId['celo-alfajores'],
        ),
      }
}

export const _getTokensInfoHttpFunction: HttpFunction = async (_req, res) => {
  const { environment } = loadCloudFunctionConfig()
  const tokensInfo = _getTokensInfo(environment)
  res.status(200).send({ ...tokensInfo })
}

// named this way to avoid collision with cloud function getTokensInfo from valora-rest-api.
//  TODO deprecate getTokensInfo cloud function from valora-rest-api
export const getTokensInfoCF: HttpFunction = wrap({
  loadConfig: loadCloudFunctionConfig,
  httpFunction: _getTokensInfoHttpFunction,
})
