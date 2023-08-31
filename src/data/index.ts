import celoMainnetRTDBMetadata from './mainnet/'
import celoTestnetRTDBMetadata from './testnet'
import { RTDBMetadata } from '../types'

const celoMetadata: Record<'testnet' | 'mainnet', RTDBMetadata[]> = {
  mainnet: celoMainnetRTDBMetadata,
  testnet: celoTestnetRTDBMetadata,
}

export default celoMetadata
