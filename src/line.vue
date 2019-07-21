<template>
  <input class="line" v-model="line.text" v-bind:class="{focused: isFocused, blured: !isFocused}" :tabindex="lineIndex" @focus="focus" @blur="blur" v-focus>
</template>

<script>
import Vue from 'vue';

export default {
  data: function(){
    return {
      isFocused: false,
    }
  },
  computed: {
  },
  props: {
    lineIndex: Number,
    line: {}
  },
  methods: {
    blur: function(e) {
      console.log("blur", e.target.tabIndex);
      this.isFocused = false
    },
    focus: function(e) {
      console.log("focused", e.target.tabIndex);
      if (e.relatedTarget) {
      }
      this.isFocused = true
    },
    update:function (e) {
     console.log("line",this.line);
    // console.log("fountain",e)
     //this.input = e.target.value
    },
    newLine: function(e){
     this.data.push({})
    }
 },
 directives: {
   focus: {
     inserted: function(e){
       setTimeout(function(){

       },3000)
       console.log("inserted", e.tabIndex);
     }
   }
 }
}
</script>

<style lang="scss">
  .line {
    width: 100%;
    padding: 10px;
    min-height: 20px;
    border: 1px solid blue;
  }
  .character {
    text-transform: uppercase;
  }
</style>
