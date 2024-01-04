/* eslint-disable no-console */
import axios from 'axios'
import fs from 'fs'
import Jimp from 'jimp'
import { createPublicClient, erc20Abi, http } from 'viem'
import { mainnet } from 'viem/chains'
import yargs from 'yargs'

async function main(args: ReturnType<typeof parseArgs>) {
  const { categoryId, platformId, numberOfResults } = args

  const client = createPublicClient({
    chain: mainnet, // TODO this needs to be updated manually
    transport: http(),
  })

  const coingeckoResponse = await axios.get(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${categoryId}&order=market_cap_desc&per_page=${numberOfResults}&page=1&sparkline=false&locale=en`,
  )

  if (coingeckoResponse.status !== 200 || !coingeckoResponse.data) {
    throw new Error(`Encountered error fetching tokens list from Coingecko`)
  }

  const newTokensInfo = []
  for (const token of coingeckoResponse.data) {
    // avoid rate limit 10 requests / minute
    await new Promise((resolve) => setTimeout(resolve, 10000))

    const { id, image } = token
    if (!id || !image) {
      console.warn(`No id or image found for token ${token}`)
      continue
    }

    let tokenAddress = undefined
    try {
      // fetch the token contract address using the token id from coingecko coins/id
      const coinDetailResponse = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${id}?tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`,
      )
      tokenAddress =
        coinDetailResponse.data.detail_platforms[platformId]?.contract_address
      if (!tokenAddress) {
        throw new Error(`No token address found for token ${id}`)
      }
    } catch (error) {
      console.warn(
        `Encountered error fetching token address from Coingecko: ${error}`,
      )
      continue
    }

    const [symbol, decimals, name] = await Promise.all([
      client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'symbol',
      }),
      client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
      }),
      client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'name',
      }),
    ])

    try {
      const response = await axios.get(image, {
        responseType: 'arraybuffer',
        responseEncoding: 'binary',
      })
      const imageFile = await Jimp.read(response.data)
      const resizedImage = await imageFile
        .resize(256, 256)
        .quality(100)
        .getBufferAsync(Jimp.MIME_PNG)

      const filePath = `./assets/tokens/${symbol}.png`
      fs.writeFileSync(filePath, resizedImage, 'binary')
    } catch (error) {
      console.warn(`Encountered error fetching image: ${error}`)
      continue
    }

    newTokensInfo.push({
      name,
      symbol,
      decimals,
      imageUrl: `https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/${symbol}.png`,
      isNative: false,
      showZeroBalance: false,
      infoUrl: `https://www.coingecko.com/en/coins/${id}`,
      minimumAppVersionToSwap: '1.72.0',
      isCashInEligible: false,
    })
  }

  console.log('New tokens info: ', newTokensInfo)
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
      default: 2,
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
