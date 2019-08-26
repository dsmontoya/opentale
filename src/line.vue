<template>
  <input class="line" v-model="line.text" v-bind:class="[line.type, {focused: isFocused, blured: !isFocused}]"  v-on:keydown.enter.prevent="newLine" v-on:keydown.delete.passive="del" :tabindex="lineIndex" @focus="focus" @blur="blur" v-focus>
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
    del: function(e) {
      if (e.keyCode == 8) {
        this.$emit("backspace", this.emitLine())
      } else {
        this.$emit("delete", this.emitLine())
      }
    },
    newLine: function(e){
      this.$emit("newLine", this.emitLine())
    },
    emitLine: function() {
      console.log("emitLine");
      var el = this.$el
      var tabIndex = el.tabIndex
      return {
        index: tabIndex,
        text: this.line.text,
        selectionStart: el.selectionStart,
        selectionEnd : el.selectionEnd
      }
    }
 },
 watch: {
 },
 directives: {
   focus: {
     inserted: function(e){
       setTimeout(function(){

       },3000)
     }
   }
 }
}
</script>

<style lang="scss">
  .line {
    font-family: courier;
    width: 100%;
    padding: 10px;
    min-height: 20px;
    border: 1px solid blue;
  }
  .character {
    text-transform: uppercase;
  }
</style>
