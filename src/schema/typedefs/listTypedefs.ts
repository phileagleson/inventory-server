import { gql } from 'apollo-server-express'

const listTypedefs = gql`
  type ListItem {
    item: Item
    qty: Int
    completed: Boolean
  }

  type List {
    id: ID!
    name: String!
    image: Image
    items: [ListItem]
    listType: String
  }

  input ListInput {
    name: String
    image: Upload
    listType: String
  }

  extend type Query {
    lists: [List]
    list(id: ID!): List
  }

  extend type Mutation {
    createList(listInput: ListInput!): List!
    updateList(id: ID!, listInput: ListInput): List!
    deleteList(id: ID!): List!
    addItemToList(id: ID!, itemId: ID, itemInput: ItemInput): List!
    deleteItemFromList(id: ID!, itemId: ID): List!
    toggleCompletedItemOnList(id: ID!, itemId: ID): List!
  }
`
export default listTypedefs
