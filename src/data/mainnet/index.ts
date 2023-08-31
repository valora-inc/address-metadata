import AddressesExtraInfoData from './addresses-extra-info.json'
import TokensInfoData from './celo-tokens-info.json'
import AddressesExtraInfoSchema from '../../schemas/addresses-extra-info'
import { OverrideType, RTDBMetadata } from '../../types'
import CeloTokensInfoSchema from '../../schemas/tokens-info'
import { transformCeloTokensInfo } from '../../utils/transforms'

const celoMainnetRTDBMetadata: RTDBMetadata[] = [
  {
    data: AddressesExtraInfoData,
    schema: AddressesExtraInfoSchema,
    rtdbLocation: 'addressesExtraInfo',
    overrideType: OverrideType.OverrideAll,
  },
  {
    data: transformCeloTokensInfo(TokensInfoData),
    schema: CeloTokensInfoSchema,
    rtdbLocation: 'tokensInfo',
    overrideType: OverrideType.DeleteMissingKeysAndUpdate,
  },
]

export default celoMainnetRTDBMetadata
