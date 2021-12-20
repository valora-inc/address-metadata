import allMetadata from './data/'

describe('Schema validation', () => {
  Object.entries(allMetadata).forEach(([project, projectMetadata]) => {
    describe(project, () => {
      it.each(projectMetadata)('$rtdbLocation', ({ data, schema }) => {
        const validationResult = schema.validate(data)
        expect(validationResult.error).toBe(undefined)
      })
    })
  })
})
