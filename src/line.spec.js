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
    newLine(line,0)
    lines = getLines(editor)
    expect(lines).toHaveLength(2)
  })

  it('focuses the new line', () => {
    const editor = mount(Editor, {
      data: () => {
        return {
          lines: [{text:""},{text:"abc"},{text:""}]
        }
      }
    })
    let lines = getLines(editor)
    let line = lines.at(1)
    newLine(line, line.text().length-1)

    return Vue.nextTick().then(() => {
      lines = getLines(editor)
      let nextLine = lines.at(2)
      expect(nextLine.classes()).toContain('focused')
      expect(line.vm.line.text).toBe('abc')
      expect(nextLine.vm.line.text).toBe('')
   })
  })

  it('splits the text', () => {
    const editor = mount(Editor, {
      data: () => {
        return {
          lines: [{text:""},{text:"abc"},{text:""}]
        }
      }
    })
    let lines = getLines(editor)
    let line = lines.at(1)
    newLine(line, 1)
    lines = getLines(editor)
    let nextLine = lines.at(2)

    expect(line.vm.line.text).toBe('a')
    expect(nextLine.vm.line.text).toBe('bc')
  })
})

function getLines(e) {
  return e.findAll(".line")
}

function newLine(line, selectionStart) {
  line.element.selectionStart = selectionStart
  line.trigger("keydown.enter")
}
