import Joi from 'joi'

export class OverrideType {
  static readonly OverrideAll = new OverrideType(true, true)
  static readonly OnlyUpdates = new OverrideType(false, false)
  static readonly DeleteMissingKeysAndUpdate = new OverrideType(false, true)

  // private to disallow creating other instances of this type
  private constructor(
    public readonly shouldOverride: boolean,
    public readonly deleteMissingKeys: boolean,
  ) {}
}

export interface RTDBMetadata {
  data: any
  schema: Joi.Schema
  rtdbLocation: string
  overrideType: OverrideType
}

export interface Config {
  project: string
  databaseUrl: string
}
