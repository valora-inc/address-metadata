import * as admin from 'firebase-admin'
import { Config } from '../types'

export class FirebaseClient {
  config: Config
  firebaseApp: admin.app.App
  firebaseDb: admin.database.Database

  constructor(config: Config) {
    this.config = config
    this.firebaseApp = admin.initializeApp({
      databaseURL: config.databaseUrl,
    })
    this.firebaseDb = admin.database()
  }

  async readFromPath(path: string): Promise<any> {
    const data = await this.firebaseDb.ref(path).get()
    return data.val()
  }

  async writeToPath(path: string, data: any): Promise<void> {
    const ref = await this.firebaseDb.ref(path)
    await ref.set(data)
  }
}
