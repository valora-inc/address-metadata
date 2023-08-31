import celoMetadata from './data/'
import ethereumMainnetTokensInfo from './data/mainnet/ethereum-tokens-info.json'
import ethereumTestnetTokensInfo from './data/testnet/ethereum-sepolia-tokens-info.json'
import { checkMatchingAsset } from './schemas/tokens-info'

describe('Schema validation', () => {
  Object.entries(celoMetadata).forEach(([project, projectMetadata]) => {
    // eslint-disable-next-line jest/valid-title
    describe(`celo-${project}`, () => {
      it.each(projectMetadata)('$rtdbLocation', ({ data, schema }) => {
        const validationResult = schema.validate(data, {
          convert: false, // prevents casting values to the required types (e.g. a string to a number)
          abortEarly: false, // returns all errors at once
        })
        expect(validationResult.error).toBe(undefined)
      })
    })
  })
  it.each(
    ethereumTestnetTokensInfo
      .map((tokenInfo) => ({
        tokenInfo,
        tokensInNetwork: ethereumTestnetTokensInfo,
        networkName: 'ethereum-testnet',
      }))
      .concat(
        ethereumMainnetTokensInfo.map((tokenInfo) => ({
          tokenInfo,
          tokensInNetwork: ethereumMainnetTokensInfo,
          networkName: 'ethereum-mainnet',
        })),
      ),
  )('$networkName $tokenInfo.symbol', ({ tokenInfo, tokensInNetwork }) => {
    // native tokens don't have an address; all others do
    expect(
      tokenInfo.isNative
        ? !tokenInfo.address && tokenInfo.symbol === 'ETH'
        : tokenInfo.address?.match(/^0x[a-f0-9]{40}$/),
    ).toBeTruthy()
    expect(tokenInfo.imageUrl).toMatch(
      /^https:\/\/raw.githubusercontent.com\/valora-inc\/address-metadata\/main\/assets\/tokens\/[^/]+\.png$/,
    )
    checkMatchingAsset(tokenInfo.imageUrl)
    expect(
      'pegTo' in tokenInfo && typeof tokenInfo.pegTo === 'string'
        ? tokensInNetwork.find((t) => t.address === tokenInfo.pegTo)
        : true,
    ).toBeTruthy()
    expect(
      // if swappable, must have 18 decimals
      !('isSwappable' in tokenInfo) ||
        !tokenInfo.isSwappable ||
        tokenInfo.decimals === 18,
    ).toBeTruthy()
  })
})
