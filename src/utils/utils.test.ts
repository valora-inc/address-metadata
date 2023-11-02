import { keepInternalKeys } from './utils'

describe('Keep Internal Keys', () => {
  const toUpdateValues = {
    '0x1234': {
      address: '0x1234',
      decimal: 18,
      imageUrl: 'https://example.com',
    },
    '0x1235': {
      address: '0x1235',
      decimal: 8,
      imageUrl: 'https://example2.com',
    },
    '0x1236': {
      address: '0x1236',
      decimal: 18,
      imageUrl: 'https://example3.com',
    },
  }

  const currentValues = {
    '0x1234': {
      address: '0x1234old',
      decimal: 18,
      imageUrl: 'https://example.com',
      usdPrice: '1',
      historicalUsdPrices: {
        lastDay: {
          price: '1.2',
        },
      },
    },
    '0x1235': {
      address: '0x1235old',
      decimal: 8,
      imageUrl: 'https://example2.com',
      usdPrice: '2',
      historicalUsdPrices: {
        lastDay: {
          price: '2.2',
        },
      },
    },
  }

  it("returns the expected object when there aren't keys to keep", () => {
    const updateObject = keepInternalKeys(toUpdateValues, currentValues, [])

    expect(updateObject).toMatchObject(toUpdateValues)
  })

  it('returns the expected object when there are internal keys to keep', () => {
    const updateObject = keepInternalKeys(toUpdateValues, currentValues, [
      'usdPrice',
      'historicalUsdPrices',
    ])

    const expectedObject = {
      '0x1234': {
        address: '0x1234',
        decimal: 18,
        imageUrl: 'https://example.com',
        usdPrice: '1',
        historicalUsdPrices: {
          lastDay: {
            price: '1.2',
          },
        },
      },
      '0x1235': {
        address: '0x1235',
        decimal: 8,
        imageUrl: 'https://example2.com',
        usdPrice: '2',
        historicalUsdPrices: {
          lastDay: {
            price: '2.2',
          },
        },
      },
      '0x1236': {
        address: '0x1236',
        decimal: 18,
        imageUrl: 'https://example3.com',
      },
    }

    expect(expectedObject).toMatchObject(updateObject)
  })
})
