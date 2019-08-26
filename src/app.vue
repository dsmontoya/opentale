<template>
  <editor @update="test"></editor>
</template>

<script>
const Editor = requiere('./editor')
// import "vueify/lib/insert-css"
export default {
  el: "#app",
  name: 'test',
  data: function () {
    return {
       text: ''
    }
  },
  components: {
    Editor
  },
  methods: {
    test: function(e){
    console.log("test",e);
  }
}
}
</script>
