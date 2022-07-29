let {MongoClient} = require('mongodb')
const dotenv = require('dotenv')
dotenv.config()

async function start(){
    let client = new MongoClient(process.env.CONNECTIONSTRING)
    await client.connect()
     module.exports = client
     const app = require('./app')
     app.listen(process.env.PORT)
  }
  
  start()