import AddressesExtraInfoData from './addresses-extra-info.json'
import AddressesExtraInfoSchema from '../../schemas/addresses-extra-info'
import { RTDBMetadata } from '../../types'

const mainnetRTDBMetadata: RTDBMetadata[] = [
  {
    data: AddressesExtraInfoData,
    schema: AddressesExtraInfoSchema,
    rtdbLocation: 'addressesExtraInfo',
  },
]

export default mainnetRTDBMetadata
