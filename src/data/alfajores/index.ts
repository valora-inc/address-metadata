import AddressesExtraInfoData from './addresses-extra-info.json'
import AddressesExtraInfoSchema from '../../schemas/addresses-extra-info'
import { RTDBMetadata } from '../../types'

const alfajoresRTDBMetadata: RTDBMetadata[] = [
  {
    data: AddressesExtraInfoData,
    schema: AddressesExtraInfoSchema,
    rtdbLocation: 'addressesExtraInfo',
  },
]

export default alfajoresRTDBMetadata
