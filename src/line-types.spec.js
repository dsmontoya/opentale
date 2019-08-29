import { lineTypes, nextType } from './line-types'

describe('Line types', () => {
  it('returns dialogue', () => {
    expect(nextType(lineTypes.CHARACTER)).toBe(lineTypes.DIALOGUE)
  })

  it('returns action', () => {
    expect(nextType(lineTypes.ACTION)).toBe(lineTypes.ACTION)
    expect(nextType(lineTypes.SHOT)).toBe(lineTypes.ACTION)
    expect(nextType(lineTypes.SCENE_HEADING)).toBe(lineTypes.ACTION)
  })
})
