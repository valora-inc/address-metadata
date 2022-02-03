import Joi from 'joi'
import AddressSchema from './address-schema'

const AddressesExtraInfoSchema = Joi.object().pattern(
  AddressSchema,
  Joi.object({
    imageUrl: Joi.string(),
    name: Joi.string().required(),
    isProviderAddress: Joi.boolean(),
    isCeloRewardSender: Joi.boolean(),
  }),
)

export default AddressesExtraInfoSchema
