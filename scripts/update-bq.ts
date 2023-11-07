/* eslint-disable no-console */

import { BigQuery } from '@google-cloud/bigquery'
import { NetworkId } from '../src/types'
import { getTokensInfoByNetworkIds } from '../src/tokens-info'

const bigquery = new BigQuery()

const projectId = 'celo-mobile-mainnet' // we don't index testnet data
const datasetId = 'address_metadata'
const tableId = 'tokens_info'
const fieldsToKeep = [
  'address',
  'decimals',
  'name',
  'symbol',
  'tokenId',
  'networkId',
] as const

const tokensInfo = getTokensInfoByNetworkIds([
  NetworkId['celo-mainnet'],
  NetworkId['ethereum-mainnet'],
])

const rows = Object.entries(tokensInfo).map(([_, tokenInfo]) => {
  const row: Record<string, string | number | boolean | null> = {}
  fieldsToKeep.forEach((field) => (row[field] = tokenInfo[field] ?? null))
  return row
})

async function overwriteTable() {
  const dataset = bigquery.dataset(datasetId, { projectId, location: 'US' })
  const table = dataset.table(tableId)

  const writeStream = table.createWriteStream({
    sourceFormat: 'NEWLINE_DELIMITED_JSON',
    writeDisposition: 'WRITE_TRUNCATE',
  })

  try {
    writeStream.write(rows.map((row) => JSON.stringify(row)).join('\n'))
    writeStream.end()
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })
    console.log(
      `Overwrote ${rows.length} rows in ${projectId}.${datasetId}.${tableId}`,
    )
  } catch (error) {
    console.error('Error overwriting table:', error)
  }
}

overwriteTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
