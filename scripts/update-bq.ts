/* eslint-disable no-console */

import { BigQuery } from '@google-cloud/bigquery'
import jsonData from '../src/data/mainnet/tokens-info.json'

const bigquery = new BigQuery()

const projectId = 'celo-mobile-mainnet' // we don't index testnet data
const datasetId = 'address_metadata'
const tableId = 'tokens_info'
const fieldsToKeep = ['address', 'decimals', 'name', 'symbol'] as const

// Prepare the rows for insertion
const rows = jsonData.map((entry) => {
  const row: Record<string, string | number> = {}
  fieldsToKeep.forEach((field) => {
    const value = entry[field]
    if (value !== undefined) {
      row[field] = value
    }
  })
  return row
})

// Overwrite rows in BigQuery table
async function overwriteTable() {
  const dataset = bigquery.dataset(datasetId, { projectId })
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
  .catch(console.error)
