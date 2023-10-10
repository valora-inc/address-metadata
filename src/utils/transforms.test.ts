import { transformCeloTokensForRTDB } from './transforms'

describe('transforms', () => {
  it('should add the bridge in the token name when it is present', () => {
    const address1 = '0x00400fcbf0816bebb94654259de7273f4a05c762'
    const address2 = '0x452ef5a4bd00796e62e5e5758548e0da6e8ccdf3'
    const mockTokensInfo = [
      {
        address: address1,
        name: 'Test Token 1',
        symbol: 'TT1',
        decimals: 18,
      },
      {
        address: address2,
        name: 'Test Token 2',
        symbol: 'TT2',
        decimals: 18,
        bridge: 'Test Bridge',
      },
    ]

    const transformData = transformCeloTokensForRTDB(mockTokensInfo)

    expect(transformData[address1].name).toBe('Test Token 1')
    expect(transformData[address2].name).toBe('Test Token 2 (Test Bridge)')
  })
})
