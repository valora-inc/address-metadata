import yargs from 'yargs'
import * as dotenv from 'dotenv'
import { Config } from './types'

export function loadConfig(): Config {
  dotenv.config()

  const argv = yargs
    .env('')
    .option('project', {
      description: 'Project to update RTDB',
      example: 'alfajores',
      type: 'string',
      choices: ['mainnet', 'alfajores'],
      demandOption: true,
    })
    .option('database-url', {
      description: 'URL to database to update',
      type: 'string',
      demandOption: true,
    })
    .parseSync()

  return {
    project: argv.project,
    databaseUrl: argv['database-url'],
  }
}
