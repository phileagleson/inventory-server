type ListType = {
  id: string
  name: string
  image?: {
    url: string
  }
  items: [
    {
      id: string
      name: string
      image?: {
        url: string
      }
      qty: number
    }
  ]
}

export default ListType
