/* eslint-disable no-console */
import axios from 'axios'
import { Parser } from '@json2csv/plainjs'
import yargs from 'yargs'

function toCsv(path: string) {
  const json = require(path)
  const opts = {}
  const parser = new Parser(opts)
  return parser.parse(json)
}

const lookupTables: Record<string, string> = {
  'c1881b36-7300-421d-9934-73e11d3b39d8': toCsv(
    '../src/data/mainnet/celo-tokens-info.json',
  ),
}
const mixpanelProjectId = '2786968'

async function main(args: ReturnType<typeof parseArgs>) {
  const params = {
    project_id: mixpanelProjectId,
  }
  const headers = {
    'Content-Type': 'text/csv',
    Authorization: `Basic ${args.credentials}`,
  }

  for (const [lookupTableId, csv] of Object.entries(lookupTables)) {
    const lookupTableUrl = `https://api.mixpanel.com/lookup-tables/${lookupTableId}`
    console.log(`Updating ${lookupTableId} ...`)
    await axios.put(lookupTableUrl, csv, { params, headers })
  }
}

function parseArgs() {
  return yargs
    .env('MIXPANEL')
    .option('credentials', {
      description: 'Base64 encoded username:password',
      type: 'string',
      demandOption: true,
    })
    .parseSync()
}

main(parseArgs())
  .then(() => process.exit(0))
  .catch((error) => {
    const message = (error as any)?.message
    console.log(`Error updating mixpanel: ${message}`)
    process.exit(1)
  })
