import Joi from 'joi'
import AddressSchema from './address-schema'

const TokensInfoSchema = Joi.object().pattern(
  AddressSchema,
  Joi.object({
    address: AddressSchema,
    imageUrl: Joi.string(),
    name: Joi.string().required(),
    decimals: Joi.number(),
    symbol: Joi.string(),
    isCoreToken: Joi.boolean(),
  }),
)

export default TokensInfoSchema
