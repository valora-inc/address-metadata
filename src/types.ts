import Joi from 'joi'

export class OverrideType {
  static readonly OverrideAll = new OverrideType(true, true)
  static readonly OnlyUpdates = new OverrideType(false, false)
  static readonly DeleteMissingKeysAndUpdate = new OverrideType(false, true)

  // private to disallow creating other instances of this type
  private constructor(
    public readonly shouldOverride: boolean,
    public readonly deleteMissingKeys: boolean,
  ) {}
}

export interface RTDBMetadata {
  data: any
  schema: Joi.Schema
  rtdbLocation: string
  overrideType: OverrideType
}

export interface Config {
  project: 'testnet' | 'mainnet'
  databaseUrl: string
}

export type TokenInfo = {
  name: string
  symbol: string
  decimals: number
  imageUrl?: string
} & (
  | { address: string; isNative: false | undefined }
  | { address: undefined; isNative: true }
) // typically native tokens like ETH do not have an address

export type CeloTokenInfo = Omit<TokenInfo, 'address' | 'isNative'> & {
  address: string // all Celo tokens have an address, even native CELO
  isNative?: boolean
  isCoreToken?: boolean
  pegTo?: string
}
