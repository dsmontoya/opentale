const path = require("path")

module.exports = [
  // { loader: require.resolve('./debugger') },
   {
     test: /\.vue$/,
     include: [
       path.resolve(__dirname, "src")
     ],
     loader: 'vue-loader'
   },
   // example to apply loader to a custom block without lang="xxx"
   // this rule applies to <foo> blocks
   {
     resourceQuery: /blockType=foo/,
     loader: 'babel-loader'
   },
   // example configuring preprocessor for <template lang="pug">
   {
     test: /\.pug$/,
     include: [
       path.resolve(__dirname, "src")
     ],
     oneOf: [
       // this applies to <template lang="pug"> in Vue components
       {
         resourceQuery: /^\?vue/,
         use: ['pug-plain-loader']
       },
       // this applies to pug imports inside JavaScript
       {
         use: ['raw-loader', 'pug-plain-loader']
       }
     ]
   },
   // example configuring CSS Modules
   {
     test: /\.css$/,
     include: [
       path.resolve(__dirname, "src")
     ],
     oneOf: [
       // this applies to <style module>
       {
         resourceQuery: /module/,
         use: [
           'vue-style-loader',
           {
             loader: 'css-loader',
             options: {
               modules: true,
               localIdentName: '[local]_[hash:base64:8]'
             }
           }
         ]
       },
       // this applies to <style> or <style scoped>
       {
         use: [
           'vue-style-loader',
           'css-loader'
         ]
       }
     ]
   },
   // exmaple configration for <style lang="scss">
   {
     test: /\.scss$/,
     include: [
       path.resolve(__dirname, "src")
     ],
     use: [
       'vue-style-loader',
       'css-loader',
       {
         loader: 'sass-loader',
         // global data for all components
         // this can be read from a scss file
         options: {
           data: '$color: red;'
         }
       }
     ]
   }
];
