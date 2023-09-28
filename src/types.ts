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

export interface UpdateRTDBConfig {
  project: Environment
  databaseUrl: string
}

export interface TokensInfoCFConfig {
  gcloudProject: ValoraGcloudProject
  networkIds: NetworkId[]
}

export interface TokenInfo {
  tokenId: string
  name: string
  symbol: string
  decimals: number
  networkId: NetworkId
  address?: string
  imageUrl?: string
  isNative?: boolean
  isCoreToken?: boolean
  pegTo?: string
  isSupercharged?: boolean
  bridge?: string
}

export enum NetworkId {
  ['celo-mainnet'] = 'celo-mainnet',
  ['celo-alfajores'] = 'celo-alfajores',
  ['ethereum-mainnet'] = 'ethereum-mainnet',
  ['ethereum-sepolia'] = 'ethereum-sepolia',
}

export type Environment = 'mainnet' | 'testnet'

export type ValoraGcloudProject =
  | 'celo-mobile-alfajores'
  | 'celo-mobile-mainnet'
