import { mapNestedJsonIntoPlain } from './utils'

describe('Map Nested Json Into', () => {
  it('should map correctly when the json contains one level', () => {
    const inputJson = {
      key1: 'stringValue',
      key2: 3,
    }
    const expectedJson = inputJson

    const result = mapNestedJsonIntoPlain(inputJson)
    expect(result).toMatchObject(expectedJson)
  })

  it('should map correctly when the json contains a nested level', () => {
    const inputJson = {
      key1: {
        key3: 4,
        key4: 'stringValue',
      },
      key2: 3,
    }
    const expectedJson = {
      'key1/key3': 4,
      'key1/key4': 'stringValue',
      key2: 3,
    }

    const result = mapNestedJsonIntoPlain(inputJson)
    expect(result).toMatchObject(expectedJson)
  })

  it('should map correctly when the json contains multiple nested level', () => {
    const inputJson = {
      key1: {
        key3: 4,
        key4: 5,
        key5: {
          key6: 'stringValue',
          key7: {
            key8: 9,
          },
        },
      },
      key2: 3,
    }
    const expectedJson = {
      'key1/key3': 4,
      'key1/key4': 5,
      'key1/key5/key6': 'stringValue',
      'key1/key5/key7/key8': 9,
      key2: 3,
    }

    const result = mapNestedJsonIntoPlain(inputJson)
    expect(result).toMatchObject(expectedJson)
  })

  it('should map array to object with indexes as key', () => {
    const inputJson = {
      key1: ['this', 'is', 'a', 'test'],
      key2: 3,
    }

    const expectedJson = {
      'key1/0': 'this',
      'key1/1': 'is',
      'key1/2': 'a',
      'key1/3': 'test',
      key2: 3,
    }

    const result = mapNestedJsonIntoPlain(inputJson)
    expect(result).toMatchObject(expectedJson)
  })
})
