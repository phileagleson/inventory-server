import { gql } from 'apollo-server-express'
const rootTypedefs = gql`
  type Query {
    hello: String
  }
`
export default rootTypedefs
