import { mount } from '@vue/test-utils'
import Editor from './editor.vue'
import Vue from 'vue'

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

  it('focuses the new line', () => {
    const editor = mount(Editor, {
      data: () => {
        return {
          lines: [{},{text:"abc"},{}]
        }
      }
    })
    let lines = getLines(editor)
    let line = lines.at(1)
    line.element.selectionStart = line.text().length-1
    line.trigger("keydown.enter")

    return Vue.nextTick().then(() => {
      lines = getLines(editor)
      let nextLine = lines.at(2)
      expect(nextLine.classes()).toContain('focused')
      expect(line.vm.line.text).toBe('abc')
      expect(nextLine.vm.line.text).toBe('')
   })
  })
})

function getLines(e) {
  return e.findAll(".line")
}
