import Joi, { CustomValidator } from 'joi'
import fs from 'fs'
import { URL } from 'url'
import path from 'path'
import AddressSchema from './address-schema'

const checkMatchingAsset: CustomValidator = (value) => {
  const url = new URL(value)
  const filename = path.basename(url.pathname)
  const assetPath = path.join(__dirname, '../../assets/addresses', filename)
  if (!fs.existsSync(assetPath)) {
    throw new Error(`Missing asset at '${path.relative(__dirname, assetPath)}'`)
  }

  return value
}

const AddressesExtraInfoSchema = Joi.object().pattern(
  AddressSchema,
  Joi.object({
    imageUrl: Joi.string()
      // For now only allow assets within this repo
      .pattern(
        /^https:\/\/raw.githubusercontent.com\/valora-inc\/address-metadata\/main\/assets\/addresses\/[^/]+\.(png|jpg)$/,
      )
      .uri()
      .custom(checkMatchingAsset, 'has a matching asset'),
    name: Joi.string().required(),
    isProviderAddress: Joi.boolean(),
    isCeloRewardSender: Joi.boolean(),
  }),
)

export default AddressesExtraInfoSchema
