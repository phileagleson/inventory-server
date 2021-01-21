import { ApolloServer, IResolvers } from 'apollo-server-express'
import { ContextFunction } from 'apollo-server-core'
import express, { Application } from 'express'
import { DocumentNode } from 'graphql'
import { Server } from 'http'
import Config from './types/config'
import logger from './utils/logger'

class App {
  app: Application
  server: ApolloServer
  config: Config
  typeDefs: DocumentNode[]
  resolvers: IResolvers[]
  context: ContextFunction

  constructor(
    config: Config,
    typeDefs: DocumentNode[],
    resolvers: IResolvers[],
    context: ContextFunction
  ) {
    this.config = config
    this.typeDefs = typeDefs
    this.resolvers = resolvers
    this.context = context

    this.app = express()
    this.server = new ApolloServer({
      typeDefs: this.typeDefs,
      resolvers: this.resolvers,
      context: this.context,
    })

    this.server.applyMiddleware({ app: this.app })
  }

  public async startServer(): Promise<Server> {
    return this.app.listen({ port: this.config.PORT }, () => {
      logger.info(
        `Server ready at http://localhost:${this.config.PORT}${this.server.graphqlPath}`
      )
    })
  }

  public async stopServer(): Promise<boolean> {
    try {
      await this.server.stop()
      return true
    } catch (err) {
      logger.error('Erro shutting down Apollo Server')
      return false
    }
  }
}

export default App
