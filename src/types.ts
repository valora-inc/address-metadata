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
  project: Environment
  databaseUrl: string
}

export interface TokenInfo {
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
}

export enum Network { // environment-agnostic network name
  celo = 'celo',
  ethereum = 'ethereum',
}

export enum NetworkId { // environment-specific
  ['celo-mainnet'] = 'celo-mainnet',
  ['celo-alfajores'] = 'celo-alfajores',
  ['ethereum-mainnet'] = 'ethereum-mainnet',
  ['ethereum-sepolia'] = 'ethereum-sepolia',
}

export type Environment = 'mainnet' | 'testnet'
