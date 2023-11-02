export function keepInternalKeys(
  expected: any,
  current: any,
  keptInternalKeys: string[],
) {
  return Object.keys(expected).reduce((expectedResult, key) => {
    const objectWithInternalKeys = keptInternalKeys.reduce(
      (result, internalKey) => {
        if (current[key] && current[key][internalKey]) {
          result[internalKey] = current[key][internalKey]
        }

        return result
      },
      expected[key],
    )

    return {
      ...expectedResult,
      [key]: objectWithInternalKeys,
    }
  }, expected)
}
