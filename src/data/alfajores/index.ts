import AddressesExtraInfoData from './addresses-extra-info.json'
import TokensInfoData from './tokens-info.json'
import AddressesExtraInfoSchema from '../../schemas/addresses-extra-info'
import TokensInfoSchema from '../../schemas/tokens-info'
import { RTDBMetadata } from '../../types'

const alfajoresRTDBMetadata: RTDBMetadata[] = [
  {
    data: AddressesExtraInfoData,
    schema: AddressesExtraInfoSchema,
    rtdbLocation: 'addressesExtraInfo',
    shouldOverride: true,
  },
  {
    data: TokensInfoData,
    schema: TokensInfoSchema,
    rtdbLocation: 'tokensInfo',
    shouldOverride: false,
  },
]

export default alfajoresRTDBMetadata
