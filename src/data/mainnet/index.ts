import AddressesExtraInfoData from './addresses-extra-info.json'
import TokensInfoData from './celo-tokens-info.json'
import AddressesExtraInfoSchema from '../../schemas/addresses-extra-info'
import { OverrideType, RTDBMetadata } from '../../types'
import TokensInfoSchema from '../../schemas/tokens-info'
import { transformRawTokensInfo } from '../../utils/transforms'

const mainnetRTDBMetadata: RTDBMetadata[] = [
  {
    data: AddressesExtraInfoData,
    schema: AddressesExtraInfoSchema,
    rtdbLocation: 'addressesExtraInfo',
    overrideType: OverrideType.OverrideAll,
  },
  {
    data: transformRawTokensInfo(TokensInfoData),
    schema: TokensInfoSchema,
    rtdbLocation: 'tokensInfo',
    overrideType: OverrideType.DeleteMissingKeysAndUpdate,
  },
]

export default mainnetRTDBMetadata
