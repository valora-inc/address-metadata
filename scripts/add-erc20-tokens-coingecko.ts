/* eslint-disable no-console */
import axios from 'axios'
import fs from 'fs'
import Jimp from 'jimp'
import { createPublicClient, erc20Abi, http } from 'viem'
import * as viemChains from 'viem/chains'
import yargs from 'yargs'

// This function is used to log a warning if resizing an original token image
// that is too far from a square shape (since we expect a 256x256 square).
function isSquareEnough(width: number, height: number) {
  const tolerance = 0.1
  const difference = Math.abs(width - height)
  const maxDifference = Math.max(width, height) * tolerance

  return difference <= maxDifference
}

// This function fetches an image from imageUrl, resizes it to 256x256, and
// saves it to filePath. It logs warnings if the processed image may require
// manual intervention.
async function fetchAndSaveTokenImage(imageUrl: string, filePath: string) {
  function logImageWarning(warning: string) {
    console.warn(`⚠️ ${filePath}: ${warning}. Image url: ${imageUrl}`)
  }

  const response = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    responseEncoding: 'binary',
  })
  const imageFile = await Jimp.read(response.data)

  const imageWidth = imageFile.getWidth()
  const imageHeight = imageFile.getHeight()
  if (!isSquareEnough(imageWidth, imageHeight)) {
    logImageWarning(
      'Original image is not square, please inspect the resized image',
    )
  }
  if (imageWidth < 231 || imageHeight < 231) {
    logImageWarning(
      'Original image was upscaled by > 10%, please inspect the quality of the image',
    )
  }

  console.log('Resizing image...')
  const resizedImage = await imageFile
    .resize(256, 256)
    .quality(80)
    .getBufferAsync(Jimp.MIME_PNG)

  console.log('Saving image...')
  if (fs.existsSync(filePath)) {
    logImageWarning(
      'A token image already exists and was overwritten, please check the git diff',
    )
  }
  fs.writeFileSync(filePath, resizedImage, 'binary')

  const maxFileSizeInBytes = 60 * 1024 // 50 KB
  const fileSizeInBytes = fs.statSync(filePath).size
  if (fileSizeInBytes > maxFileSizeInBytes) {
    logImageWarning('Image file size exceeds 60 KB, please resize manually')
  }
}

async function getTokensByMarketCap(
  categoryId: string,
  numberOfResults: number,
  pageNumber: number,
) {
  const coingeckoResponse = await axios.get(
    'https://api.coingecko.com/api/v3/coins/markets',
    {
      params: {
        vs_currency: 'usd',
        category: categoryId,
        order: 'market_cap_desc',
        per_page: numberOfResults,
        page: pageNumber,
        sparkline: false,
        locale: 'en',
      },
    },
  )
  if (coingeckoResponse.status !== 200 || !coingeckoResponse.data) {
    throw new Error(`Encountered error fetching tokens list from Coingecko`)
  }

  return coingeckoResponse.data
}

async function getTokenDetails(id: string, platformId: string) {
  const coingeckoResponse = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${id}`,
    {
      params: {
        localization: false,
        tickers: false,
        market_data: false,
        community_data: false,
        developer_data: false,
        sparkline: false,
      },
    },
  )
  if (
    coingeckoResponse.status !== 200 ||
    !coingeckoResponse.data?.detail_platforms?.[platformId]
  ) {
    throw new Error(`Encountered error fetching token details for token ${id}`)
  }

  return coingeckoResponse.data.detail_platforms[platformId]
}

// This function adds new supported tokens to the app by querying the top coins
// by market cap from Coingecko for a given chain, and adds the token metadata
// to the relevant data file. It also fetches, resizes, and saves the token
// image. This function will print a summary log for all the tokens that failed
// to be added automatically.
async function main(args: ReturnType<typeof parseArgs>) {
  const {
    categoryId,
    platformId,
    numberOfResults,
    tokensInfoFilePath,
    viemChainId,
    pageNumber,
  } = args

  console.log('Reading existing tokens info from ', tokensInfoFilePath)
  const existingTokensInfo = require(`../${tokensInfoFilePath}`)
  const existingLowerCaseTokenSymbols = new Set(
    existingTokensInfo.map((token: any) => token.symbol.toLowerCase()),
  )
  const newTokensInfo = [...existingTokensInfo]
  const fetchFailedTokenIds = []

  console.log('Fetching tokens list by market cap from Coingecko')
  const tokensByMarketCap = await getTokensByMarketCap(
    categoryId,
    numberOfResults,
    pageNumber,
  )

  for (let i = 0; i < tokensByMarketCap.length; i++) {
    const token = tokensByMarketCap[i]
    const { id, image } = token
    if (!id) {
      console.warn(`⚠️ No id found for token ${token}`)
      continue
    }

    console.log(
      `(${i + 1}/${tokensByMarketCap.length}) Processing token ${id}...`,
    )
    if (existingLowerCaseTokenSymbols.has(token.symbol.toLowerCase())) {
      console.log(`Token ${id} already exists`)
      continue
    }
    if (!image) {
      console.warn(`⚠️ No id or image found for token ${token}`)
      fetchFailedTokenIds.push(id)
      continue
    }

    // avoid rate limit 10-30 requests / minute
    // https://apiguide.coingecko.com/getting-started/error-and-rate-limit#rate-limit
    await new Promise((resolve) => setTimeout(resolve, 15_000))

    // get token address from coingecko /coins/{id} endpoint, annoyingly this is
    // not returned in the /coins/markets response
    let address = undefined
    let decimals = undefined
    try {
      console.log('Fetching token details from Coingecko...')
      const tokenDetails = await getTokenDetails(id, platformId)
      decimals = tokenDetails.decimal_place
      address = tokenDetails.contract_address

      if (!address || !decimals) {
        throw new Error(
          `No address or decimals returned from Coingecko for token ${id}`,
        )
      }
    } catch (error) {
      console.warn(
        `⚠️ Encountered error fetching token address for ${id} from Coingecko: ${error}`,
      )
      fetchFailedTokenIds.push(id)
      continue
    }

    // get token metadata from token contract directly. Coingecko manually adds
    // some info to their token list and the token symbol in particular is
    // always (incorrectly) lowercased.
    const client = createPublicClient({
      chain: (viemChains as any)[viemChainId],
      transport: http(),
    })
    const [symbol, name] = await client.multicall({
      contracts: [
        {
          address,
          abi: erc20Abi,
          functionName: 'symbol',
        },
        {
          address,
          abi: erc20Abi,
          functionName: 'name',
        },
      ],
      allowFailure: false,
    })

    // read the token image from coingecko and resize before saving. continue if
    // the image cannot be saved successfully, we don't want imageless tokens.
    try {
      const filePath = `./assets/tokens/${symbol}.png`
      await fetchAndSaveTokenImage(image, filePath)
    } catch (error) {
      console.warn(
        `⚠️ Encountered error fetching/resizing/writing image, skipping ${id}. ${error}`,
      )
      fetchFailedTokenIds.push(id)
      continue
    }

    newTokensInfo.push({
      name,
      symbol,
      decimals,
      address,
      imageUrl: `https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/${symbol}.png`,
      isNative: false,
      infoUrl: `https://www.coingecko.com/en/coins/${id}`,
    })

    // update the file after every token is fetched because the coingecko rate
    // limit can be unpredictable and we don't want to lose progress
    console.log('Updating tokens info file with new token...')
    const newTokensInfoString = JSON.stringify(newTokensInfo, null, 2)
    // our lint rules require a newline at the end of the file
    fs.writeFileSync(tokensInfoFilePath, `${newTokensInfoString}\n`)
  }

  console.log('✨ Success ✨')
  console.log(
    `The following token ids failed to be added: ${fetchFailedTokenIds.join(
      ', ',
    )}`,
  )
}

function parseArgs() {
  return yargs
    .usage('Usage: $0\n\nAdd new tokens using Coingecko as a data source.')
    .option('category-id', {
      description:
        'e.g. ethereum-ecosystem. The category id of the chain can be found from https://api.coingecko.com/api/v3/coins/categories/list.',
      type: 'string',
      demandOption: true,
    })
    .option('platform-id', {
      description:
        'e.g. ethereum. The platform id of the chain can be found from https://api.coingecko.com/api/v3/asset_platforms',
      type: 'string',
      demandOption: true,
    })
    .option('viem-chain-id', {
      description:
        'e.g. mainnet. The viem chain id of the chain can be found from https://github.com/wevm/viem/blob/main/src/chains/index.ts',
      type: 'string',
      demandOption: true,
    })
    .option('number-of-results', {
      description: 'Number of tokens requested per page.',
      type: 'number',
      default: 20,
    })
    .option('page-number', {
      description: 'Page number of the tokens requested.',
      type: 'number',
      default: 2,
    })
    .option('tokens-info-file-path', {
      description:
        'e.g. src/data/mainnet/ethereum-tokens-info.json. Path of the tokens info file relative to the root folder.',
      type: 'string',
      demandOption: true,
    })
    .parseSync()
}

main(parseArgs())
  .then(() => process.exit(0))
  .catch((error) => {
    const message = (error as any)?.message
    console.log(`Error updating tokens: ${message}`)
    process.exit(1)
  })
