import celoMetadata from './data/'

describe('Schema validation', () => {
  Object.entries(celoMetadata).forEach(([project, projectMetadata]) => {
    // eslint-disable-next-line jest/valid-title
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
