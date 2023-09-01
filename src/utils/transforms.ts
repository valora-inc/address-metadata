import { Chain, Network, TokenInfo, TokenInfoDTO } from '../types'

// Transforms the Celo tokens info data in this repo into the format used in the RTDB collection
export function transformCeloTokensForRTDB(
  celoTokensInfo: TokenInfo[],
): Record<string, Omit<TokenInfo, 'isNative'>> {
  return Object.fromEntries(
    celoTokensInfo.map((rawTokenInfo) => {
      const { address, isNative, ...rest } = rawTokenInfo
      return [address, { address, ...rest }]
    }),
  )
}

const ChainToNetwork: Record<'mainnet' | 'testnet', Record<Chain, Network>> = {
  mainnet: {
    [Chain.ethereum]: Network['ethereum-mainnet'],
    [Chain.celo]: Network['celo-mainnet'],
  },
  testnet: {
    [Chain.ethereum]: Network['ethereum-sepolia'],
    [Chain.celo]: Network['celo-alfajores'],
  },
}

export function getTokenInfoDTO(
  tokenInfo: TokenInfo,
  network: Network,
): TokenInfoDTO {
  return {
    ...tokenInfo,
    tokenId: `${network}_${tokenInfo.isNative ? 'native' : tokenInfo.address}`,
  }
}

export function getChainToTokensInfoDTO(
  chainToTokensInfo: Record<Chain, TokenInfo[]>,
  environment: 'mainnet' | 'testnet',
): Record<Chain, TokenInfoDTO[]> {
  const chainToNetwork = ChainToNetwork[environment]
  const output = {} as Record<Chain, TokenInfoDTO[]>
  for (const [chain, tokensInfo] of Object.entries(chainToTokensInfo) as [
    Chain,
    TokenInfo[],
  ][]) {
    output[chain] = tokensInfo.map((tokenInfo) =>
      getTokenInfoDTO(tokenInfo, chainToNetwork[chain]),
    )
  }
  return output
}
