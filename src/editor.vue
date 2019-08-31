<template>
<div>
    <div class ="editor" contenteditable="true" v-on:keydown.arrow-down.prevent="arrowDown" v-on:keydown.arrow-up.prevent="arrowUp">
      <script-line v-for="(line,index) in lines" :line-index=index @backspace="backspace" @delete="del" @newLine="newLine" @tab="tab" :line=line></script-line>
    </div>
  <div v-html="compiledFountain"></div>
</div>
</template>

<script>
import ScriptLine from './line'
import LineType from './line-types'

const fountainConverter = require('fountain-converter');

export default {

  data: function(){
    const old_on = this.$on;
    this.$on = (...args) => {
      console.log(args);
      // custom logic here like pushing to a callback array or something
      old_on.apply(this, args);
      console.log("lol");
    };
    return {
      lines:[{text:'', type: LineType.SCENE_HEADING}]
    }
  },
  components: {
    ScriptLine
  },
  computed: {
    compiledFountain: function(){
      var fountain = fountainConverter.FountainToHTML(this.text);
      console.log("result",fountain)
      return fountain
    }
  },
  methods: {
    arrowDown: function(e){
      var next = e.target.nextSibling
      if (next) {
        next.focus()
      }
    },
    arrowUp: function(e){
      var previous = e.target.previousSibling
      if (previous) {
        previous.focus()
      }
    },
    backspace: function(line) {
      var lines = this.lines
      var i = line.index
      var previousLine = lines[i -1]
      if (line.selectionStart == 0 && lines.length > 1 && previousLine) {
        var newSelectionEnd = previousLine.text.length+1
        var text = line.text
        var child = this.$children[i-1]
        lines.splice(i, 1)
        previousLine.text += " "+text
        child.$el.focus()
        // TODO: test selection is the previous end of line
        this.$nextTick(function () {
          child.$el.selectionEnd = newSelectionEnd
          child.$el.selectionStart = newSelectionEnd
        })
        return
      }
    },
    del: function(line) {
      var lines = this.lines
      var i = line.index
      var nextLine = lines[i+1]
      if (line.selectionStart == line.text.length && lines.length > 1 && nextLine) {
        var newSelectionEnd = line.text.length
        var text = nextLine.text
        var child = this.$children[i]
        lines.splice(i+1, 1)
        lines[i].text += " " + text
        // TODO: test selection is the previous end of line
        this.$nextTick(function () {
          child.$el.selectionEnd = newSelectionEnd
          child.$el.selectionStart = newSelectionEnd
        })
        return
      }
    },
    preventTest: function(e){
      e.stopPropagation()
      console.log("prevented",e);
    },
   update:function (e) {
   console.log("fountain",e)
   this.$emit("update",e.target)
     //this.input = e.target.value
   },
   tab: function(t,i){
     var line = this.lines[i]
     line.type = LineType.tabNext(line.type)
   },
   newLine:function(line){
     console.log("line",line);
     var split
     var newChild
     split = this.splitText(line.text, line.selectionStart)
     this.lines[line.index].text = split[0]
     this.lines.splice(line.index+1,0,{text: split[1], type: LineType.next(line.type)})
     // this.lines[line.index+1].isFocused = true
     this.$nextTick(function() {
       newChild = this.$children[line.index+1]
       newChild.$el.selectionEnd = 0
       newChild.$el.focus()
     })
     // var target = e.target
     // var i = target.tabIndex
     // var lines = this.lines
     // var line = lines[i]
     // var selectionStart = target.selectionStart
     // var split = this.splitText(line.text, selectionStart)
     // line.text = split[0]
     // lines.splice(i+1,0,{text:split[1]})
     //
     // this.$nextTick(function() {
     //   var sibling = target.nextSibling
     //   sibling.focus()
     //   sibling.selectionEnd = 0
     // })
   },
   splitText: function(text, i){
     return [text.substring(0, i), text.substring(i)]
   }
 }
}
</script>
