import Joi, { CustomValidator } from 'joi'
import fs from 'fs'
import { URL } from 'url'
import path from 'path'
import AddressSchema from './address-schema'
import semver from 'semver'
import { NetworkId } from '../types'

export const checkMatchingAsset = (value: string) => {
  const url = new URL(value)
  const filename = path.basename(url.pathname)
  const assetPath = path.join(__dirname, '../../assets/tokens', filename)
  if (!fs.existsSync(assetPath)) {
    throw new Error(`Missing asset at '${path.relative(__dirname, assetPath)}'`)
  }

  return value
}

const MIN_SWAP_VERSION = '1.60.0'

const checkMinVersion: CustomValidator = (value) => {
  if (!semver.gte(value, MIN_SWAP_VERSION)) {
    throw new Error(
      `Minimum version for swappable token is ${MIN_SWAP_VERSION}`,
    )
  }
}

const imageUrlSchema = Joi.string()
  // For now only allow assets within this repo
  .pattern(
    /^https:\/\/raw.githubusercontent.com\/valora-inc\/address-metadata\/main\/assets\/tokens\/[^/]+\.png$/,
  )
  .uri()
  .custom(checkMatchingAsset, 'has a matching asset')

const BaseTokenInfoSchema = Joi.object({
  address: AddressSchema,
  imageUrl: imageUrlSchema,
  name: Joi.string().required(),
  decimals: Joi.number().required(),
  symbol: Joi.string().required(),
  isCoreToken: Joi.boolean(),
  isSupercharged: Joi.boolean(),
  pegTo: AddressSchema,
  // Forcing flag to be false if decimals is not 18
  isSwappable: Joi.when('decimals', {
    is: 18,
    then: Joi.boolean(),
    otherwise: Joi.valid(false),
  }),
  minimumAppVersionToSwap: Joi.string()
    .pattern(/^\d+\.\d+\.\d+$/)
    .custom(checkMinVersion, 'has a valid version'),
  isNative: Joi.boolean(),
  infoUrl: Joi.string()
    .uri()
    .pattern(/^https:\/\/www.coingecko.com\/en\/coins/),
  showZeroBalance: Joi.boolean(),
  isStableCoin: Joi.boolean(),
  isCashInEligible: Joi.boolean(),
  isCashOutEligible: Joi.boolean(),
})

const ProcessedTokenInfoSchema = BaseTokenInfoSchema.concat(
  Joi.object({
    networkId: Joi.valid(...Object.values(NetworkId)).required(),
    tokenId: Joi.string().required(),
    networkIconUrl: Joi.alternatives().conditional('isNative', {
      is: true,
      then: Joi.forbidden(),
      otherwise: imageUrlSchema.required(),
    }),
  }),
)

const getTokenInfoSchema = (base: Joi.ObjectSchema<any>) =>
  Joi.alternatives().try(
    Joi.object({
      // native tokens don't have an address except CELO
      isNative: Joi.valid(true).required(),
      symbol: Joi.string().invalid('CELO').required(),
      address: Joi.forbidden(),
    }).concat(base),
    Joi.object({
      // CELO is native and has an address
      isNative: Joi.valid(true).required(),
      symbol: Joi.valid('CELO').required(),
      address: AddressSchema.required(),
    }).concat(base),
    Joi.object({
      // all non-native tokens require address
      isNative: Joi.boolean().invalid(true),
      symbol: Joi.string().required(),
      address: AddressSchema.required(),
      bridge: Joi.string().optional(),
    }).concat(base),
  )

export const TokenInfoSchemaJSON = getTokenInfoSchema(BaseTokenInfoSchema)
export const TokenInfoSchemaProcessed = getTokenInfoSchema(
  ProcessedTokenInfoSchema,
)

export const RTDBAddressToTokenInfoSchema = Joi.object().pattern(
  AddressSchema,
  BaseTokenInfoSchema.concat(
    Joi.object({
      address: AddressSchema.required(),
      // This checks it's referencing a token address that exists in the root object
      pegTo: Joi.valid(Joi.ref('/', { in: true })),
    }),
  ),
)
