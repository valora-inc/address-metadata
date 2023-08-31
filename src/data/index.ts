import mainnetRTDBMetadata from './mainnet/'
import testnetRTDBMetadata from './testnet'
import { RTDBMetadata } from '../types'

const allMetadata: Record<'testnet' | 'mainnet', RTDBMetadata[]> = {
  mainnet: mainnetRTDBMetadata,
  testnet: testnetRTDBMetadata,
}

export default allMetadata
