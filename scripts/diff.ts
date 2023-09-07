/* eslint-disable no-console */
import { diffString } from 'json-diff'
import { loadUpdateRTDBConfig } from '../src/config'
import { FirebaseClient } from '../src/clients/firebase-client'
import { getCeloRTDBMetadata } from '../src'

async function main() {
  const config = loadUpdateRTDBConfig()
  const firebaseClient = new FirebaseClient(config)

  const projectMetadata = getCeloRTDBMetadata(config.project)

  console.log(`Calculating diffs for the ${config.project} GCP project...`)
  let hasDiff = false
  for (const { data, rtdbLocation } of projectMetadata) {
    const rtdbData = await firebaseClient.readFromPath(rtdbLocation)
    const diff = diffString(rtdbData, data)

    if (!diff) {
      console.log(`No changes for path: ${rtdbLocation}...`)
    } else {
      hasDiff = true
      console.log(`Diff for path "${rtdbLocation}":`)
      console.log(diff)
    }
  }
  return hasDiff
}

main()
  .then((hasDiff) => process.exit(hasDiff ? 1 : 0))
  .catch((error) => {
    console.log(`Error while calculating diff: ${error}`)
    process.exit(1)
  })
