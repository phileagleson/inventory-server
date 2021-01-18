import mongoose, { Mongoose } from 'mongoose'
import logger from './utils/logger'
import Config from './types/config'

class DBHelper {
  config: Config

  constructor(config: Config) {
    this.config = config
  }

  public async connectToDb(): Promise<Mongoose> {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      user: this.config.MONGO_USER,
      pass: this.config.MONGO_PASS,
    }

    try {
      const conn = await mongoose.connect(this.config.DB_URI, options)
      logger.info(`Connected to database on Worker Process ${process.pid}`)
      return conn
    } catch (err) {
      logger.error(
        `DB Connection error: ${err.stack} on Worker Process ${process.pid}`
      )
      process.exit(1)
    }
  }

  public async disconnectFromDb(): Promise<boolean> {
    try {
      await mongoose.connection.close(true)
      logger.info('Disconnected from database')
      return true
    } catch (err) {
      logger.error(
        `Error closing connection to database on Worker Process ${process.pid}`
      )
      return false
    }
  }
}
export default DBHelper
