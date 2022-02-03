import Joi from 'joi'

const AddressSchema = Joi.string().regex(/^0x[a-fA-F0-9]{40}$/)

export default AddressSchema
