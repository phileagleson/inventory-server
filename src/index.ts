import express, { Application } from 'express'
import { ApolloServer } from 'apollo-server-express'
import mongoose from 'mongoose'
import config from './config'
import resolvers from './schema/resolvers'
import typeDefs from './schema/typedefs'
import logger from './utils/logger'

const startServer = async (): Promise<void> => {
  const app: Application = express()
  const server: ApolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  })

  server.applyMiddleware({ app })

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: config.MONGO_USER,
    pass: config.MONGO_PASS,
  }

  try {
    await mongoose.connect(config.DB_URI, options)
    logger.info(`Connected to database on Worker Process ${process.pid}`)

    app.listen({ port: config.PORT }, () => {
      logger.info(
        `Server ready at http://localhost:${config.PORT}${server.graphqlPath}`
      )
    })
  } catch (err) {
    logger.error(
      `DB Connection error: ${err.stack} on Worker Process ${process.pid}`
    )
  }
}

startServer()
