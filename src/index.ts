import DBHelper from './DBHelper'
import App from './App'
import config from './config.uat'
import typeDefs from './schema/typedefs'
import resolvers from './schema/resolvers'
import { Item } from './models/Item'
import storeUpload from './utils/storeUpload'
import uploadToCloud, { deleteImage } from './utils/uploadToCloud'

const dbHelper = new DBHelper(config)

const context = async () => {
  return { Item, storeUpload, uploadToCloud, config, deleteImage }
}

const app = new App(config, typeDefs, resolvers, context)

dbHelper.connectToDb()
app.startServer()
