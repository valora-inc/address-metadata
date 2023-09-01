import { getCeloRTDBMetadata, getTokensInfo } from './index'
import { TokenInfo } from './types'
import {
  RTDBAddressToTokenInfoSchema,
  TokenInfoSchema,
} from './schemas/tokens-info'
import Joi from 'joi'

function validateWithSchema(value: any, schema: Joi.Schema) {
  return schema.validate(value, {
    convert: false, // prevents casting values to the required types (e.g. a string to a number)
    abortEarly: false, // returns all errors at once
  })
}

describe('Schema validation', () => {
  describe('Joi sanity checks', () => {
    it('forbids CELO to not have an address', () => {
      const validationResult = validateWithSchema(
        {
          name: 'Celo',
          symbol: 'CELO',
          decimals: 18,
        },
        TokenInfoSchema,
      )
      expect(validationResult.error).not.toBe(undefined)
    })
    it('forbids non-CELO native tokens to have an address', () => {
      const validationResult = validateWithSchema(
        {
          name: 'New native token',
          symbol: 'XYZ',
          decimals: 18,
          isNative: true,
          address: '0x471ece3750da237f93b8e339c536989b8978a438',
        },
        TokenInfoSchema,
      )
      expect(validationResult.error).not.toBe(undefined)
    })
    it('forbids pegging to phantom address', () => {
      const validationResult = validateWithSchema(
        {
          '0x7037f7296b2fc7908de7b57a89efaa8319f0c500': {
            address: '0x7037f7296b2fc7908de7b57a89efaa8319f0c500',
            decimals: 18,
            imageUrl:
              'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/mCELOxOLD.png',
            name: 'Moola CELO AToken',
            symbol: 'mCELO',
            pegTo: '0x471ece3750da237f93b8e339c536989b8978a438',
          },
        },
        RTDBAddressToTokenInfoSchema,
      )
      expect(validationResult.error).not.toBe(undefined)
    })
    it('allows pegging to included address', () => {
      const validationResult = validateWithSchema(
        {
          '0x7037f7296b2fc7908de7b57a89efaa8319f0c500': {
            address: '0x7037f7296b2fc7908de7b57a89efaa8319f0c500',
            decimals: 18,
            imageUrl:
              'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/mCELOxOLD.png',
            name: 'Moola CELO AToken',
            symbol: 'mCELO',
            pegTo: '0x471ece3750da237f93b8e339c536989b8978a438',
          },
          '0x471ece3750da237f93b8e339c536989b8978a438': {
            address: '0x471ece3750da237f93b8e339c536989b8978a438',
            decimals: 18,
            imageUrl:
              'https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/CELO.png',
            isCoreToken: true,
            name: 'Celo native asset',
            symbol: 'CELO',
            isSwappable: true,
            isNative: true,
          },
        },
        RTDBAddressToTokenInfoSchema,
      )
      expect(validationResult.error).toBeUndefined()
    })
  })

  describe('Celo RTDB metadata', () => {
    it.each(['mainnet', 'testnet'] as const)(`%s`, (environment) => {
      for (const { data, schema } of getCeloRTDBMetadata(environment)) {
        const validationResult = validateWithSchema(data, schema)
        expect(validationResult.error).toBe(undefined)
      }
    })
  })

  describe('Tokens info data', () => {
    const tokensInfo: TokenInfo[] = (['mainnet', 'testnet'] as const)
      .map(getTokensInfo)
      .flatMap(Object.values)
      .flat()
    it.each(tokensInfo)('tokenInfo %o', (tokenInfo) => {
      const validationResult = validateWithSchema(tokenInfo, TokenInfoSchema)
      expect(validationResult.error).toBe(undefined)
    })
  })
})
