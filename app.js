const path = require('path')
  , setup = require('./src/server')
  , keys = require('./src/config/keys/keys')

const port = keys.port
setup()
  .then(app => {
    app.listen(port, () => {
      console.log(`Server started on port ${port}`)
    })
  }).catch(console.log)