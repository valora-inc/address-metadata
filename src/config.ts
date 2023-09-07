import yargs from 'yargs'
import * as dotenv from 'dotenv'
import { TokensInfoCFConfig, UpdateRTDBConfig } from './types'

export function loadUpdateRTDBConfig(): UpdateRTDBConfig {
  dotenv.config()

  const argv = yargs
    .env('')
    .option('project', {
      description: 'Project to update RTDB',
      choices: ['mainnet', 'testnet'] as const,
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

export function loadCloudFunctionConfig(): TokensInfoCFConfig {
  return yargs
    .env('')
    .option('environment', {
      description: 'Blockchain environment to use',
      choices: ['mainnet', 'testnet'] as const,
      demandOption: true,
    })
    .option('gcloud-project', {
      description: 'Valora Google Cloud project to deploy to',
      choices: ['celo-mobile-mainnet', 'celo-mobile-alfajores'] as const,
      demandOption: true,
    })
    .parseSync()
}
