import AddressesExtraInfoData from './addresses-extra-info.json'
import TokensInfoData from './celo-alfajores-tokens-info.json'
import AddressesExtraInfoSchema from '../../schemas/addresses-extra-info'
import CeloTokensInfoSchema from '../../schemas/tokens-info'
import { OverrideType, RTDBMetadata } from '../../types'
import { transformCeloTokensInfo } from '../../utils/transforms'

const celoTestnetRTDBMetadata: RTDBMetadata[] = [
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

export default celoTestnetRTDBMetadata
