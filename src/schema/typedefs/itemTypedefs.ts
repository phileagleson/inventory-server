import { gql } from 'apollo-server-express'

const itemTypedefs = gql`
  type Image {
    url: String
  }

  type Item {
    id: ID!
    name: String!
    image: Image
  }

  input ItemInput {
    name: String
    image: Upload
  }

  extend type Query {
    items: [Item]
    item(id: ID!): Item
  }

  type Mutation {
    updateItem(id: ID!, itemInput: ItemInput): Item!
    deleteItem(id: ID!): Item!
    createItem(itemInput: ItemInput!): Item!
  }
`
export default itemTypedefs
