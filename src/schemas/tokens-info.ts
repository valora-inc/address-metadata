import Joi from 'joi'
import AddressSchema from './address-schema'

const TokensInfoSchema = Joi.object().pattern(
  AddressSchema,
  Joi.object({
    address: AddressSchema.required(),
    imageUrl: Joi.string(),
    name: Joi.string().required(),
    decimals: Joi.number().required(),
    symbol: Joi.string().required(),
    isCoreToken: Joi.boolean(),
    pegTo: Joi.string()
  }),
)

export default TokensInfoSchema
