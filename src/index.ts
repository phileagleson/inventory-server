import DBHelper from './DBHelper'
import App from './App'
import config from './config.uat'
import typeDefs from './schema/typedefs'
import resolvers from './schema/resolvers'
import { Item } from './models/Item'
import { List } from './models/List'
import storeUpload from './utils/storeUpload'
import uploadToCloud, { deleteImage } from './utils/uploadToCloud'

const dbHelper = new DBHelper(config)

const context = async () => {
  return { Item, List, storeUpload, uploadToCloud, config, deleteImage }
}

const app = new App(config, typeDefs, resolvers, context)

dbHelper.connectToDb()
app.startServer()
