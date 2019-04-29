<template>
  <input v-model="line.text" :tabindex="lineIndex" v-focus>
</template>

<script>
import Vue from 'vue';

export default {
  data: function(){
    return {
      text: 'hey'
    }
  },
  computed: {
  },
  props: {
    lineIndex: Number,
    line: {}
  },
  methods: {
   update:function (e) {
     console.log("line",this.line);
   // console.log("fountain",e)
     //this.input = e.target.value
   },
   newLine: function(e){
     console.log("newLine line");
     this.data.push({})
   }
 },
 directives: {
   focus: {
     inserted: function(e){
       setTimeout(function(){

       },3000)
       e.focus()
       console.log("inserted",Date.now());
     }
   }
 }
}
</script>

<style lang="scss">
  .line {
    padding: 10px;
    min-height: 20px;
    border: 1px solid blue;
  }
  .character {
    text-transform: uppercase;
  }
</style>
