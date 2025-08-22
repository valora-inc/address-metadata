import { Environment, OverrideType, RTDBMetadata } from './types'
import CeloMainnetTokensInfo from './data/mainnet/celo-tokens-info.json'
import CeloAlfajoresTokensInfo from './data/testnet/celo-alfajores-tokens-info.json'
import MainnetAddressesExtraInfo from './data/mainnet/addresses-extra-info.json'
import TestnetAddressesExtraInfo from './data/testnet/addresses-extra-info.json'
import AddressesExtraInfoSchema from './schemas/addresses-extra-info'
import { transformCeloTokensForRTDB } from './utils/transforms'
import { RTDBAddressToTokenInfoSchema } from './schemas/tokens-info'
import { HttpFunction } from '@google-cloud/functions-framework'
import { wrap } from './wrap'
import { loadCloudFunctionConfig } from './config'
import { getTokensInfoByNetworkIds } from './tokens-info'

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
      overrideType: OverrideType.KeepInternalKeys([
        'historicalUsdPrices',
        'usdPrice',
        'priceFetchedAt',
      ]),
    },
  ]
}

export const _getTokensInfoHttpFunction: HttpFunction = async (_req, res) => {
  const { networkIds } = loadCloudFunctionConfig() // in the future we could use this as a default set of network id's to include in the response, and accept a list of network id's as a query param to override it
  const tokensInfo = getTokensInfoByNetworkIds(networkIds)
  res.status(200).send({ ...tokensInfo })
}

export const getTokensInfo: HttpFunction = wrap({
  loadConfig: loadCloudFunctionConfig,
  httpFunction: _getTokensInfoHttpFunction,
})
