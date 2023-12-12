// Coingecko Attribution required: https://www.coingecko.com/en/api/pricing
// Terms: https://www.coingecko.com/en/api_terms
// Category: https://www.coingecko.com/en/categories/ethereum-ecosystem
// API documentation: https://www.coingecko.com/api/documentation#operations-coins-get_coins_markets

import axios from 'axios'
import { promises as fs } from 'fs'
import * as path from 'path'

type CoingeckoCoinId = string
type TokenSymbol = string
type CoingeckoSymbol = Lowercase<string>
type ImageUrl =
  `https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/${TokenSymbol}.${string}`
type InfoUrl = `https://www.coingecko.com/en/coins/${CoingeckoCoinId}`
type Version = `${number}.${number}.${number}`

interface AddressMetadata {
  name: string
  symbol: TokenSymbol
  isNative?: boolean
  decimals: number
  address: string
  imageUrl: ImageUrl
  isStableCoin: boolean
  infoUrl: InfoUrl
  minimumAppVersionToSwap: Version
  showZeroBalance?: boolean
  isCashInEligible?: boolean
}

interface MarketCoin {
  id: CoingeckoCoinId
  name: string
  symbol: CoingeckoSymbol
  image: string
}

const stablecoinCategory = 'Stablecoins'

interface TokenDetails {
  detail_platforms: {
    ethereum?: {
      decimal_place: number
      contract_address: string
    }
  }
  categories: string[]
}
interface TokenDetailsParsed {
  decimals: number
  address: string
  isStableCoin: boolean
}

declare global {
  interface String {
    toUpperCase<T extends string>(this: T): Uppercase<T>
    toLowerCase<T extends string>(this: T): Lowercase<T>
  }
}

const MINIMUM_APP_VERSION_TO_SWAP =
  (process.env.MIN_APP_SWAP_VERSION as Version) || '1.72.0'

const METADATA_PATH =
  process.env.METADATA_PATH || './src/data/mainnet/ethereum-tokens-info.json'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response.status === 429) {
      // If the error has status code 429, retry the request
      return delay(2500).then(() => axios.request(error.config))
    }
    return Promise.reject(error)
  },
)

async function fetchMarketList({
  category = 'ethereum-ecosystem',
  page = 1,
  per_page = 100,
  order = 'market_cap_desc',
}) {
  const response = await axios.get<MarketCoin[]>(
    'https://api.coingecko.com/api/v3/coins/markets',
    {
      params: {
        vs_currency: 'usd',
        category,
        order,
        per_page,
        page,
        sparkline: false,
        locale: 'en',
      },
    },
  )
  return response.data
}

async function fetchTokenDetails(
  coinId: CoingeckoCoinId,
): Promise<TokenDetailsParsed | null> {
  const response = await axios.get<TokenDetails>(
    `https://api.coingecko.com/api/v3/coins/${coinId}`,
  )
  const data = response.data
  const ethereumPlatform = data.detail_platforms.ethereum
  if (!ethereumPlatform) {
    return null
  }

  return {
    decimals: ethereumPlatform.decimal_place,
    address: ethereumPlatform.contract_address,
    isStableCoin: response.data.categories.includes(stablecoinCategory),
  }
}

function mergeTokenDetails(
  token: MarketCoin,
  details: TokenDetailsParsed,
  symbol: string,
  decimals: number,
  imagePath: string,
): AddressMetadata {
  const baseUrl =
    'https://raw.githubusercontent.com/valora-inc/address-metadata/main'
  const imageUrl = path.join(baseUrl, imagePath) as ImageUrl
  return {
    name: token.name,
    symbol,
    decimals: decimals,
    address: details.address,
    imageUrl,
    isStableCoin: details.isStableCoin,
    infoUrl: `https://www.coingecko.com/en/coins/${token.id}`,
    minimumAppVersionToSwap: MINIMUM_APP_VERSION_TO_SWAP,
  }
}

interface RPCResponse {
  result: `0x${string}`
}

async function fetchTokenSymbol(
  address: string,
  fallbackSymbol: string,
): Promise<TokenSymbol> {
  // Coingecko symbol is lowercase but the contract should have correct case, e.g. stETH
  const response = await axios.post<RPCResponse>(
    `https://ethereum.publicnode.com`,
    {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: address,
          data: '0x95d89b41', // function signature for "symbol()"
        },
        'latest',
      ],
      id: 1,
    },
  )
  try {
    return response.data.result
      .substring(2 + 64 + 64)
      .match(/.{1,2}/g)!
      .map((byte) => parseInt(byte, 16))
      .filter((charCode) => charCode > 0)
      .map((charCode) => String.fromCharCode(charCode))
      .join('')
      .trim()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.debug(
      `Failed to parse symbol for address ${address}: ${response.data.result}`,
    )
    return fallbackSymbol
  }
}

async function fetchTokenDecimals(address: string): Promise<number> {
  const response = await axios.post<RPCResponse>(
    `https://ethereum.publicnode.com`,
    {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: address,
          data: '0x313ce567', // function signature for "decimals()"
        },
        'latest',
      ],
      id: 1,
    },
  )
  return parseInt(response.data.result, 16)
}

async function saveTokenIcon(imageUrl: string, symbol: TokenSymbol) {
  const response = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    responseEncoding: 'binary',
  })
  const contentType = response.headers['content-type']
  const extension = contentType.split('/')[1]
  const filePath = `./assets/tokens/${symbol}.${extension}`
  await fs.writeFile(filePath, response.data, 'binary')
  return filePath
}

async function getTopMetadata() {
  const marketCoins: MarketCoin[] = await fetchMarketList({})
  const metadataList = []

  for (const token of marketCoins) {
    await delay(2500) // Delay of 2+ seconds between each request
    const details = await fetchTokenDetails(token.id)
    if (!details) {
      continue
    }
    const [symbol, decimals] = await Promise.all([
      fetchTokenSymbol(details.address, token.symbol.toUpperCase()),
      fetchTokenDecimals(details.address),
    ])

    await delay(2500) // Delay of 2+ seconds between each request
    const imagePath = await saveTokenIcon(token.image, symbol)

    const metadata: AddressMetadata = mergeTokenDetails(
      token,
      details,
      symbol,
      decimals,
      imagePath,
    )
    metadataList.push(metadata)
  }

  const metadataFiltered = metadataList.filter(
    (metadata): metadata is NonNullable<AddressMetadata> => !!metadata,
  )
  return metadataFiltered
}

async function loadExistingMetadata() {
  const data = await fs.readFile(METADATA_PATH, 'utf8')
  const metadata = JSON.parse(data) as AddressMetadata[]
  return metadata
}

async function writeMetadata(metadata: AddressMetadata[]) {
  await fs.writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf8')
}

async function updateMetadata() {
  const existingMetadata = await loadExistingMetadata()
  const metadata = await getTopMetadata()
  const mergedMetadata = existingMetadata.concat(
    metadata.filter(
      (existing) =>
        !existingMetadata.find(
          (oldMetadata) => oldMetadata.address === existing.address,
        ),
    ),
  )
  await writeMetadata(mergedMetadata)
}

updateMetadata().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
})
