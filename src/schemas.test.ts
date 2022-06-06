import allMetadata from './data/'
import AddressSchema from "./schemas/address-schema";

describe('Schemas work as expected', () => {
  describe('AddressSchema', () => {
    it('allows uppercase', () => {
      expect(AddressSchema.validate('0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA').error).toBeUndefined()
    })
    it('allows mixed case', () => {
      expect(AddressSchema.validate('0xaaaaaaaaaaaaaaaaaaaaAAAAAAAAAAAAAAAAAAAA').error).toBeUndefined()
    })
    it('allows lowercase', () => {
      expect(AddressSchema.validate('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa').error).toBeUndefined()
    })
  })
})

describe('Schema validation', () => {
  Object.entries(allMetadata).forEach(([project, projectMetadata]) => {
    describe(project, () => {
      it.each(projectMetadata)('$rtdbLocation', ({ data, schema }) => {
        const validationResult = schema.validate(data, {
          convert: false, // prevents casting values to the required types (e.g. a string to a number)
          abortEarly: false, // returns all errors at once
        })
        expect(validationResult.error).toBe(undefined)
      })
    })
  })
})
