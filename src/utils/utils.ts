export function keepInternalKeys(
  expected: any,
  current: any,
  keptInternalKeys: string[],
) {
  const result: any = {}

  for (const key of Object.keys(expected)) {
    result[key] = expected[key]

    for (const internalKey of keptInternalKeys) {
      if (current[key] && current[key][internalKey]) {
        result[key][internalKey] = current[key][internalKey]
      }
    }
  }

  return result
}
