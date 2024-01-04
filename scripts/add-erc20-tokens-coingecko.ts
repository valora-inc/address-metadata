/* eslint-disable no-console */
import axios from 'axios'
import fs from 'fs'
import Jimp from 'jimp'
import { createPublicClient, erc20Abi, http } from 'viem'
import { mainnet } from 'viem/chains'
import yargs from 'yargs'

async function main(args: ReturnType<typeof parseArgs>) {
  const { categoryId, platformId, numberOfResults, tokensInfoFilePath } = args

  console.log('Reading existing tokens info from ', tokensInfoFilePath)
  const existingTokensInfo = require(`../${tokensInfoFilePath}`)
  const existingLowerCaseTokenSymbols = new Set(
    existingTokensInfo.map((token: any) => token.symbol.toLowerCase()),
  )

  const client = createPublicClient({
    chain: mainnet, // TODO this needs to be updated manually
    transport: http(),
  })

  console.log('Fetching tokens list by market cap from Coingecko')
  const coingeckoResponse = await axios.get(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${categoryId}&order=market_cap_desc&per_page=${numberOfResults}&page=1&sparkline=false&locale=en`,
  )
  if (coingeckoResponse.status !== 200 || !coingeckoResponse.data) {
    throw new Error(`Encountered error fetching tokens list from Coingecko`)
  }

  const newTokensInfo = [...existingTokensInfo]
  for (let i = 0; i < coingeckoResponse.data.length; i++) {
    const token = coingeckoResponse.data[i]

    console.log(
      `(${i + 1}/${coingeckoResponse.data.length}) Processing token ${
        token.symbol
      }...`,
    )

    if (existingLowerCaseTokenSymbols.has(token.symbol.toLowerCase())) {
      console.log(`Token ${token.symbol} already exists`)
      continue
    }

    // avoid rate limit 10 requests / minute
    await new Promise((resolve) => setTimeout(resolve, 10000))

    const { id, image } = token
    if (!id || !image) {
      console.warn(`⚠️ No id or image found for token ${token}`)
      continue
    }

    // get token address from coingecko /coins/{id} endpoint, annoyingly this is
    // not returned in the /coins/markets response
    let address = undefined
    let decimals = undefined
    try {
      console.log('Fetching token details from CoinGecko...')
      const coinDetailResponse = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${id}?tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`,
      )
      decimals =
        coinDetailResponse.data.detail_platforms[platformId]?.decimal_place
      address =
        coinDetailResponse.data.detail_platforms[platformId]?.contract_address
      if (!address) {
        throw new Error(`No token address found for token ${id}`)
      }
    } catch (error) {
      console.warn(
        `⚠️ Encountered error fetching token address from Coingecko: ${error}`,
      )
      continue
    }

    // get token metadata from token contract directly. Coingecko manually adds
    // some info to their token list and the token symbol in particular is
    // always (incorrectly) lowercased.
    console.log(`Fetching token details from the contract ${address}...`)
    const [symbol, name] = await Promise.all([
      client.readContract({
        address,
        abi: erc20Abi,
        functionName: 'symbol',
      }),
      client.readContract({
        address,
        abi: erc20Abi,
        functionName: 'name',
      }),
    ])

    // read the token image from coingecko and resize before saving. continue if
    // the image cannot be saved successfully, we don't want imageless tokens.
    try {
      console.log('Fetching token image from Coingecko...')
      const response = await axios.get(image, {
        responseType: 'arraybuffer',
        responseEncoding: 'binary',
      })

      console.log('Resizing image...')
      const imageFile = await Jimp.read(response.data)
      const resizedImage = await imageFile
        .resize(256, 256)
        .quality(100)
        .getBufferAsync(Jimp.MIME_PNG)

      console.log('Saving image...')
      const filePath = `./assets/tokens/${symbol}.png`
      fs.writeFileSync(filePath, resizedImage, 'binary')
    } catch (error) {
      console.warn(
        `⚠️ Encountered error fetching image, skipping ${id}. ${error}`,
      )
      continue
    }

    newTokensInfo.push({
      name,
      symbol,
      decimals,
      address,
      imageUrl: `https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/${symbol}.png`,
      isNative: false,
      showZeroBalance: false,
      infoUrl: `https://www.coingecko.com/en/coins/${id}`,
      minimumAppVersionToSwap: '1.72.0',
      isCashInEligible: false,
    })

    // update the file after every token is fetched because the coingecko rate
    // limit can be unpredictable and we don't want to lose progress
    console.log('Updating tokens info file with new token...')
    const newTokensInfoString = JSON.stringify(newTokensInfo, null, 2)
    fs.writeFileSync(tokensInfoFilePath, newTokensInfoString)
  }

  console.log('✨ Success ✨')
}

function parseArgs() {
  return yargs
    .option('category-id', {
      description:
        'The category id of the chain can be found from https://api.coingecko.com/api/v3/coins/categories/list',
      type: 'string',
      default: 'ethereum-ecosystem',
    })
    .option('platform-id', {
      description:
        'The platform id of the chain can be found from https://api.coingecko.com/api/v3/asset_platforms',
      type: 'string',
      default: 'ethereum',
    })
    .option('number-of-results', {
      description: 'Number of tokens requested',
      type: 'number',
      default: 20,
    })
    .option('tokens-info-file-path', {
      description: 'Path of the tokens info file relative to the root folder',
      type: 'string',
      default: 'src/data/mainnet/ethereum-tokens-info.json',
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
