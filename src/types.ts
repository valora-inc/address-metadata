import Joi from 'joi'

export interface RTDBMetadata {
  data: any
  schema: Joi.Schema
  rtdbLocation: string
}

export interface Config {
  environment: string
  databaseUrl: string
}
