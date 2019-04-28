const Sequelize = require('')

const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'mssql'
})