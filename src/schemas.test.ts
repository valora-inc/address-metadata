import { getCeloRTDBMetadata } from './index'

describe('Schema validation', () => {
  describe('Celo RTDB metadata', () => {
    it.each(['mainnet', 'testnet'] as const)(`%s`, (environment) => {
      for (const { data, schema } of getCeloRTDBMetadata(environment)) {
        const validationResult = schema.validate(data, {
          convert: false, // prevents casting values to the required types (e.g. a string to a number)
          abortEarly: false, // returns all errors at once
        })
        expect(validationResult.error).toBe(undefined)
      }
    })
  })
})
