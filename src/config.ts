import yargs from 'yargs'
import * as dotenv from 'dotenv'
import { NetworkId, TokensInfoCFConfig, UpdateRTDBConfig } from './types'

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
  const argv = yargs
    .env('')
    .option('network-ids', {
      description: 'Comma-separated list of network ids to use',
      type: 'string',
      example: 'celo-mainnet,ethereum-mainnet',
      demandOption: true,
      coerce: (value) => value?.split(',') as NetworkId[],
    })
    .option('gcloud-project', {
      description: 'Valora Google Cloud project to deploy to',
      choices: ['celo-mobile-mainnet', 'celo-mobile-alfajores'] as const,
      demandOption: true,
    })
    .check((argv) => {
      if (!argv['network-ids']?.every((id: string) => id in NetworkId)) {
        throw new Error(
          'network-ids invalid. Must be comma-separated list of NetworkIds.',
        )
      }
      return true
    })
    .parseSync()

  return {
    gcloudProject: argv['gcloud-project'],
    networkIds: argv['network-ids'],
  }
}
