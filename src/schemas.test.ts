import allMetadata from './data/'

describe('Schema validation', () => {
  Object.entries(allMetadata).forEach(([network, networkMetadata]) => {
    describe(network, () => {
      it.each(networkMetadata)('$rtdbLocation', ({ data, schema }) => {
        const validationResult = schema.validate(data)
        expect(validationResult.error).toBe(undefined)
      })
    })
  })
})
