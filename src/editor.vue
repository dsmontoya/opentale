<template>
<div>
    <div class ="editor" contenteditable="true" @input="update" v-on:input.stop="preventTest($event)" v-on:keydown.enter.prevent="newLine">
      <script-line v-for="(line,index) in lines" :line-index=index></script-line>
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
      input:'hey',
      text: 'hey',
      lines:[{}]
    }
  },
  components: {
    ScriptLine
  },
  computed: {
    compiledFountain: function(){
      console.log("text",this.text)
      var fountain = fountainConverter.FountainToHTML(this.text);
      console.log("result",fountain)
      return fountain
    }
  },
  methods: {
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
   newLine:function(e){
     console.log("newline",e);
     this.lines.push({})
     console.log(this.lines);
   }
 }
}
</script>
