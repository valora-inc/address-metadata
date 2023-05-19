import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
const sizeOfImage = promisify(require('image-size'))

describe('assets', () => {
  describe('tokens', () => {
    const ASSETS_DIRECTORY = './assets/tokens'
    const REQUIRED_ASSET_HEIGHT = 256
    const REQUIRED_ASSET_WIDTH = 256
    const REQUIRED_ASSET_TYPE = 'png'

    // TODO: update assets so we can remove the need for this exception list
    const ASSETS_SIZE_EXCEPTIONS = new Set([
      'ABR.png',
      'ARI.png',
      'FTM.png',
      'IMMO.png',
      'NTMX.png',
      'PACT.png',
      'UBE.png',
      'cEUR.png',
      'cREAL.png',
      'cRecy.png',
      'cUSD.png',
      'mCELO.png',
      'mCELOxOLD.png',
      'mcEUR.png',
      'mcEURxOLD.png',
      'mcUSD.png',
      'mcUSDxOLD.png',
      'mcREAL.png',
      'stabilUSD.png',
      'portal_ETH.png'
    ])

    const assetPaths = fs
      .readdirSync(ASSETS_DIRECTORY)
      .map((assetFilename) => path.join(ASSETS_DIRECTORY, assetFilename))

    it.each(assetPaths)('%s is the required size', async (assetPath) => {
      const { height, width } = await sizeOfImage(assetPath)
      if (ASSETS_SIZE_EXCEPTIONS.has(path.basename(assetPath))) {
        // Just check it's a square
        /* eslint-disable jest/no-conditional-expect */
        expect(height).toBeGreaterThan(0)
        expect(height).toBe(width)
        /* eslint-enable jest/no-conditional-expect */
        return
      }
      expect(height).toBe(REQUIRED_ASSET_HEIGHT)
      expect(width).toBe(REQUIRED_ASSET_WIDTH)
    })

    it.each(assetPaths)('%s is the required type', async (assetPath) => {
      const { type: assetType } = await sizeOfImage(assetPath)
      expect(assetType).toBe(REQUIRED_ASSET_TYPE)
    })
  })

  describe('addresses', () => {
    const ASSETS_DIRECTORY = './assets/addresses'
    const REQUIRED_ASSET_HEIGHT = 256
    const REQUIRED_ASSET_WIDTH = 256
    const REQUIRED_ASSET_TYPE = /(png|jpg)/

    const assetPaths = fs
      .readdirSync(ASSETS_DIRECTORY)
      .map((assetFilename) => path.join(ASSETS_DIRECTORY, assetFilename))

    // TODO: update assets so they can pass these requirements
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip.each(assetPaths)('%s is the required size', async (assetPath) => {
      const { height, width } = await sizeOfImage(assetPath)
      expect(height).toBe(REQUIRED_ASSET_HEIGHT)
      expect(width).toBe(REQUIRED_ASSET_WIDTH)
    })

    it.each(assetPaths)('%s is the required type', async (assetPath) => {
      const { type: assetType } = await sizeOfImage(assetPath)
      expect(assetType).toMatch(REQUIRED_ASSET_TYPE)
    })
  })
})
