import { mount } from '@vue/test-utils'
import Editor from './editor.vue'

// Here are some Jasmine 2.0 tests, though you can
// use any test runner / assertion library combo you prefer
describe('Editor', () => {

  // Mount an instance and inspect the render output
  it('adds a new line', () => {
    const editor = mount(Editor)
    let lines = getLines(editor)
    expect(lines).toHaveLength(1)
    const line = lines.at(0)
    line.trigger("keydown.enter")
    lines = getLines(editor)
    expect(lines).toHaveLength(2)
  })
})

function getLines(e) {
  return e.findAll(".line")
}
