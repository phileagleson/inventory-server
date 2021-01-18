import DBHelper from './DBHelper'
import App from './App'
import config from './config.uat'
import typeDefs from './schema/typedefs'
import resolvers from './schema/resolvers'

const app = new App(config, typeDefs, resolvers)
const dbHelper = new DBHelper(config)

app.startServer()
dbHelper.connectToDb()
