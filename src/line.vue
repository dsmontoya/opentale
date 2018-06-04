<template>
<div class="line" :tabindex="lineIndex" v-focus>
</div>
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
  },
  methods: {
   update:function (e) {
   console.log("fountain",e)
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
       e.focus()
       e.select()
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
