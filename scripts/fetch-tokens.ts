// Coingecko Attribution required: https://www.coingecko.com/en/api/pricing
// Terms: https://www.coingecko.com/en/api_terms
// Category: https://www.coingecko.com/en/categories/ethereum-ecosystem
// API documentation: https://www.coingecko.com/api/documentation#operations-coins-get_coins_markets

import axios from 'axios'
import { promises as fs } from 'fs'

type CoingeckoCoinId = string
type TokenSymbol = string
type CoingeckoSymbol = Lowercase<string>
type ImageUrl =
  `https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/${TokenSymbol}.png`
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

const METADATA_PATH = process.env.METADATA_PATH || './src/data/mainnet/ethereum-tokens-info.json'

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
): AddressMetadata {
  return {
    name: token.name,
    symbol,
    decimals: decimals,
    address: details.address,
    imageUrl: `https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/${token.symbol.toUpperCase()}.png`,
    isStableCoin: details.isStableCoin,
    infoUrl: `https://www.coingecko.com/en/coins/${token.id}`,
    minimumAppVersionToSwap: MINIMUM_APP_VERSION_TO_SWAP,
  }
}

interface RPCResponse {
  result: `0x${string}`
}

async function fetchTokenSymbol(address: string): Promise<TokenSymbol> {
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
  return response.data.result
    .substring(2 + 64 + 64)
    .match(/.{1,2}/g)!
    .map((byte) => parseInt(byte, 16))
    .filter((charCode) => charCode > 0)
    .map((charCode) => String.fromCharCode(charCode))
    .join('')
    .trim()
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
  const filePath = `./assets/tokens/${symbol}.png`
  await fs.writeFile(filePath, response.data, 'binary')
}

async function getTopMetadata() {
  const fetchedCoins: MarketCoin[] = await fetchMarketList({})
  const tokens = [fetchedCoins[4], fetchedCoins[5]]
  const metadataList = await Promise.all(
    tokens.map(async (token) => {
      const details = await fetchTokenDetails(token.id)
      if (!details) {
        return
      }
      const [symbol, decimals] = await Promise.all([
        fetchTokenSymbol(details.address),
        fetchTokenDecimals(details.address),
      ])
      const metadata: AddressMetadata = mergeTokenDetails(
        token,
        details,
        symbol,
        decimals,
      )
      await saveTokenIcon(token.image, symbol)
      return metadata
    }),
  )

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
        !existingMetadata.find((oldMetadata) => oldMetadata.address === existing.address),
    ),
  )
  await writeMetadata(mergedMetadata)
}

updateMetadata().catch(() => undefined)
