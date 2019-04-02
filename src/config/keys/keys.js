module.exports = process.env.NODE_ENV === 'production' ?
  require('./keysProd') : require('./keysDev')