import { gql } from 'apollo-server-express'
const root = gql`
  type Query {
    hello: String
  }
`
export default root
