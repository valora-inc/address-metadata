export function mapNestedJsonIntoPlain(json: any): any {
  if (!isNonEmptyObject(json)) {
    return json
  }

  return Object.keys(json).reduce(
    (result, current) => ({
      ...result,
      ...prependKey(current, mapNestedJsonIntoPlain(json[current])),
    }),
    {},
  )
}

function prependKey(key: string, json: any) {
  if (!isNonEmptyObject(json)) {
    return { [key]: json }
  }

  return Object.keys(json).reduce(
    (result, current) => ({
      ...result,
      [`${key}/${current}`]: json[current],
    }),
    {},
  )
}

function isNonEmptyObject(json: any): boolean {
  return typeof json === 'object' && json !== null
}

export function deleteMissingKeysUpdateRequest(expected: any, current: any) {
  if (!isNonEmptyObject(current)) return {}
  const expectedKeys = new Set(Object.keys(expected))
  const currentKeys = Object.keys(current)

  return currentKeys
    .filter((key) => !expectedKeys.has(key))
    .reduce((result, key) => ({ ...result, [key]: null }), {})
}
