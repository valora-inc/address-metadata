import { diffString } from 'json-diff'
import { loadConfig } from '../src/config'
import { FirebaseClient } from '../src/clients/firebase-client'
import allMetadata from '../src/data/'

async function main() {
  const config = loadConfig()
  const firebaseClient = new FirebaseClient(config)

  const networkMetadata = allMetadata[config.environment]

  console.log(`Calculating diffs for the ${config.environment} environment...`)
  for (const {data, rtdbLocation} of networkMetadata) {
    const rtdbData = await firebaseClient.readFromPath(rtdbLocation)
    const diff = diffString(rtdbData, data)

    if (!diff) {
      console.log(`No changes for path: ${rtdbLocation}...`)
    } else {
      console.log(`Diff for path "${rtdbLocation}":`)
      console.log(diff)
    }
  }
}

main().then(() => (process.exit(0)))
