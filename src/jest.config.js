module.exports = {
  moduleNameMapper: {
    "^vue$": "vue/dist/vue.common.js"
  },
  moduleFileExtensions: [
    "js",
    "vue"
  ],
  transform: {
    "^.+\\.js$": "babel-jest",
    ".*\\.(vue)$": "vue-jest"
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/']
};
