import allMetadata from './data/'

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
