<template>
<div>
    <div class ="editor" contenteditable="true" @input="update" v-on:input.stop="preventTest($event)" v-on:keydown.backspace.passive="backspace" v-on:keydown.arrow-down.prevent="arrowDown" v-on:keydown.arrow-up.prevent="arrowUp">
      <script-line v-for="(line,index) in lines" :line-index=index @newLine="newLine" :line=line></script-line>
    </div>
  <div v-html="compiledFountain"></div>
</div>
</template>

<script>
import ScriptLine from './line'
const fountainConverter = require('fountain-converter');
export default {
  data: function(){
    return {
      lines:[{text:''}]
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
    backspace: function(e) {
      var target = e.target
      var i = target.tabIndex
      var lines = this.lines
      var line = lines[i]
      var selectionStart = target.selectionStart
      if (selectionStart == 0 && lines.length > 1) {
        var previousSibling = e.target.previousSibling
        var text = line.text
        lines.splice(i, 1)
        lines[i-1].text += text
        // TODO: test selection is the previous end of line
        var newSelectionEnd = previousSibling.value.length
        setTimeout(function () {
          previousSibling.focus()
          previousSibling.selectionEnd = newSelectionEnd
        }, 100);
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
   test: function(e){
     console.log("testing...");
   },
   newLine:function(line){
     var split
     console.log("newline editor",line);
     split = this.splitText(line.text, line.selectionStart)
     this.lines[line.index].text = split[0]
     this.lines.splice(line.index+1,0,{text: split[1]})
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
