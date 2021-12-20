import mainnetRTDBMetadata from './mainnet/'
import alfajoresRTDBMetadata from './alfajores'
import { RTDBMetadata } from '../types'

const allMetadata: Record<string, RTDBMetadata[]> = {
  mainnet: mainnetRTDBMetadata,
  alfajores: alfajoresRTDBMetadata,
}

export default allMetadata
