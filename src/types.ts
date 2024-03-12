import Joi from 'joi'

export class OverrideType {
  static readonly OverrideAll = new OverrideType(true, [])
  static readonly KeepInternalKeys = (keepInternalKeys?: string[]) =>
    new OverrideType(false, keepInternalKeys)

  // private to disallow creating other instances of this type
  private constructor(
    public readonly shouldOverride: boolean,
    public readonly keptInternalKeys: string[] = [],
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

// The token info type for the static data stored in the JSON files
export interface TokenInfoJSON {
  name: string
  symbol: string
  decimals: number
  address?: string
  imageUrl?: string
  isNative?: boolean
  isL2Native?: boolean
  isCoreToken?: boolean
  isFeeCurrency?: boolean
  feeCurrencyAdapterAddress?: string
  feeCurrencyAdapterDecimals?: number
  canTransferWithComment?: boolean
  pegTo?: string
  isSupercharged?: boolean
  bridge?: string
  isStableCoin?: boolean // used to show / hide price delta on token details
  showZeroBalance?: boolean
  isCashInEligible?: boolean
  isCashOutEligible?: boolean
  infoUrl?: string // The coingecko url
}

// The token info type after a small amount of processing which is used in the cloud function
export interface TokenInfo extends TokenInfoJSON {
  networkId: NetworkId
  tokenId: string
  networkIconUrl?: string
}

export enum NetworkId {
  ['celo-mainnet'] = 'celo-mainnet',
  ['celo-alfajores'] = 'celo-alfajores',
  ['ethereum-mainnet'] = 'ethereum-mainnet',
  ['ethereum-sepolia'] = 'ethereum-sepolia',
  ['arbitrum-one'] = 'arbitrum-one',
  ['arbitrum-sepolia'] = 'arbitrum-sepolia',
  ['op-mainnet'] = 'op-mainnet',
  ['op-sepolia'] = 'op-sepolia',
}

export type Environment = 'mainnet' | 'testnet'

export type ValoraGcloudProject =
  | 'celo-mobile-alfajores'
  | 'celo-mobile-mainnet'
