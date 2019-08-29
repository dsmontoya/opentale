import LineType from './line-types'

describe('Line types', () => {
  it('returns dialogue', () => {
    expect(LineType.next(LineType.CHARACTER)).toBe(LineType.DIALOGUE)
  })

  it('returns action', () => {
    expect(LineType.next(LineType.ACTION)).toBe(LineType.ACTION)
    expect(LineType.next(LineType.SHOT)).toBe(LineType.ACTION)
    expect(LineType.next(LineType.SCENE_HEADING)).toBe(LineType.ACTION)
  })
})
