import Joi from 'joi'

const AddressSchema = Joi.string().regex(/^0x[a-fA-F0-9]{40}$/)

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
