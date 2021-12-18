import { diffString } from 'json-diff'
import { loadConfig } from '../src/config'
import { FirebaseClient } from '../src/clients/firebase-client'
import allMetadata from '../src/data/'

async function main() {
  const config = loadConfig()
  const firebaseClient = new FirebaseClient(config)

  const networkMetadata = allMetadata[config.environment]

  console.log(`Updating RTDB data for the ${config.environment} environment...`)
  for (const {data, schema, rtdbLocation} of networkMetadata) {
    const validationResult = schema.validate(data)
    if (validationResult.error) {
      console.log(`Error while validating schema for ${rtdbLocation}, skipping: ${validationResult.error}`)
    } else {
      const rtdbData = await firebaseClient.readFromPath(rtdbLocation)
      const diff = diffString(rtdbData, data)
      if (!diff) {
	console.log(`Diff is empty for data at ${rtdbLocation}, skipping...`)
      } else {
	await firebaseClient.writeToPath(rtdbLocation, data)
	console.log(`Updated data at ${rtdbLocation}.`)
      }
    }
  }
}

main().then(() => (process.exit(0)))
