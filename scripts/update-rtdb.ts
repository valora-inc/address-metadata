/* eslint-disable no-console */
import { diffString } from 'json-diff'
import { loadUpdateRTDBConfig } from '../src/config'
import { FirebaseClient } from '../src/clients/firebase-client'
import { keepInternalKeys } from '../src/utils/utils'
import { getCeloRTDBMetadata } from '../src'

async function main() {
  const config = loadUpdateRTDBConfig()
  const firebaseClient = new FirebaseClient(config)

  const projectMetadata = getCeloRTDBMetadata(config.project)

  console.log(`Updating RTDB data for the ${config.project} GCP project...`)
  for (const { data, schema, rtdbLocation, overrideType } of projectMetadata) {
    const validationResult = schema.validate(data)
    if (validationResult.error) {
      console.log(
        `Error while validating schema for ${rtdbLocation}, skipping: ${validationResult.error}`,
      )
    } else {
      const rtdbData = await firebaseClient.readFromPath(rtdbLocation)
      const diff = diffString(rtdbData, data)
      if (!diff) {
        console.log(`Diff is empty for data at ${rtdbLocation}, skipping...`)
      } else {
        if (overrideType.shouldOverride) {
          await firebaseClient.writeToPath(rtdbLocation, data)
          console.log(`Wrote data to ${rtdbLocation}.`)
        } else {
          const updateRequest = keepInternalKeys(
            data,
            rtdbData,
            overrideType.keptInternalKeys,
          )
          const updateDiff = diffString(rtdbData, updateRequest)
          if (!updateDiff) {
            console.log(
              `Diff is empty for data at ${rtdbLocation}, skipping...`,
            )
          } else {
            await firebaseClient.writeToPath(rtdbLocation, updateRequest)
            console.log(`Updated data at ${rtdbLocation}.`)
          }
        }
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(`Error while updating RTDB data: ${error}`)
    process.exit(1)
  })
