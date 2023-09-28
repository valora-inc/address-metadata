import { getCeloRTDBMetadata } from './index'
import { getTokensInfoByNetworkIds } from './tokens-info'
import { NetworkId, TokenInfo } from './types'
import {
  TokenInfoSchemaProcessed,
  RTDBAddressToTokenInfoSchema,
  TokenInfoSchemaJSON,
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
    describe('TokenInfoSchema', () => {
      it('forbids CELO to not have an address', () => {
        const validationResult = validateWithSchema(
          {
            name: 'Celo',
            symbol: 'CELO',
            decimals: 18,
          },
          TokenInfoSchemaJSON,
        )
        expect(validationResult.error).toBeDefined()
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
          TokenInfoSchemaJSON,
        )
        expect(validationResult.error).toBeDefined()
      })
      it('requires non-native tokens to have an address', () => {
        const validationResult = validateWithSchema(
          {
            name: 'New normal token',
            symbol: 'XYZ',
            decimals: 18,
          },
          TokenInfoSchemaJSON,
        )
        expect(validationResult.error).toBeDefined()
      })
    })
    describe('RTDBAddressToTokenInfoSchema', () => {
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
        expect(validationResult.error).toBeDefined()
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
              name: 'Celo',
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
    const tokensInfo: TokenInfo[] = Object.values(
      getTokensInfoByNetworkIds(Object.values(NetworkId)),
    )
    it.each(tokensInfo)('tokenInfo %o', (tokenInfo) => {
      const validationResult = validateWithSchema(
        tokenInfo,
        TokenInfoSchemaProcessed,
      )
      expect(validationResult.error).toBe(undefined)
    })
    it('pegTo fields are addresses for valid tokens', () => {
      for (const networkId of Object.values(NetworkId)) {
        const addresses = []
        const pegToAddresses = []
        for (const tokenInfo of Object.values(
          getTokensInfoByNetworkIds([networkId]),
        )) {
          if (tokenInfo.address) {
            addresses.push(tokenInfo.address)
          }
          if (tokenInfo.pegTo) {
            pegToAddresses.push(tokenInfo.pegTo)
          }
        }
        for (const pegToAddress of pegToAddresses) {
          expect(addresses.includes(pegToAddress)).toEqual(true)
        }
      }
    })
  })
})
