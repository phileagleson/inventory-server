import ItemType from './itemType'

export enum ListTypes {
  INVENTORY = 'inventory',
  SHOPPING = 'shopping',
}

type ListType = {
  id: string
  name: string
  listType: ListTypes
  image: {
    url: string
  }
  items: [
    {
      item: ItemType
      qty: number
      completed: boolean
    }
  ]
}

export default ListType
