import Joi from 'joi'

export interface RTDBMetadata {
  data: any
  schema: Joi.Schema
  rtdbLocation: string
  shouldOverride: boolean
}

export interface Config {
  project: string
  databaseUrl: string
}
