import AddressesExtraInfoData from './addresses-extra-info.json'
import TokensInfoData from './tokens-info.json'
import AddressesExtraInfoSchema from '../../schemas/addresses-extra-info'
import { OverrideType, RTDBMetadata } from '../../types'
import TokensInfoSchema from '../../schemas/tokens-info'

const mainnetRTDBMetadata: RTDBMetadata[] = [
  {
    data: AddressesExtraInfoData,
    schema: AddressesExtraInfoSchema,
    rtdbLocation: 'addressesExtraInfo',
    overrideType: OverrideType.OverrideAll,
  },
  {
    data: TokensInfoData,
    schema: TokensInfoSchema,
    rtdbLocation: 'tokensInfo',
    overrideType: OverrideType.DeleteMissingKeysAndUpdate,
  },
]

export default mainnetRTDBMetadata
