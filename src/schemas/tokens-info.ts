import Joi, { CustomValidator } from 'joi'
import fs from 'fs'
import { URL } from 'url'
import path from 'path'
import AddressSchema from './address-schema'

const checkMatchingAsset: CustomValidator = (value) => {
  const url = new URL(value)
  const filename = path.basename(url.pathname)
  const assetPath = path.join(__dirname, '../../assets/tokens', filename)
  if (!fs.existsSync(assetPath)) {
    throw new Error(`Missing asset at '${path.relative(__dirname, assetPath)}'`)
  }

  return value
}

const TokensInfoSchema = Joi.object().pattern(
  AddressSchema,
  Joi.object({
    address: AddressSchema.required(),
    imageUrl: Joi.string()
      // For now only allow assets within this repo
      .pattern(
        /^https:\/\/raw.githubusercontent.com\/valora-inc\/address-metadata\/main\/assets\/tokens\/[^/]+\.png$/,
      )
      .uri()
      .custom(checkMatchingAsset, 'has a matching asset'),
    name: Joi.string().required(),
    decimals: Joi.number().required(),
    symbol: Joi.string().required(),
    isCoreToken: Joi.boolean(),
    isSupercharged: Joi.boolean(),
    // This checks it's referencing a token address that exists in the root object
    pegTo: Joi.valid(Joi.ref('/', { in: true })),
    // Forcing flag to be false if decimals is not 18
    isSwappable: Joi.when('decimals', {
      is: 18,
      then: Joi.boolean(),
      otherwise: Joi.valid(false),
    }),
  }),
)

export default TokensInfoSchema
