import fs from 'fs'
interface IArgs {
  id: string
  itemId: string
  name: string
  itemInput: {
    name: string
    image?: {
      filename: string
      mimetype: string
      encoding: string
      createReadStream: () => fs.ReadStream
    }
  }
  listInput: {
    name: string
    image?: {
      filename: string
      mimetype: string
      encoding: string
      createReadStream: () => fs.ReadStream
    }
    listType: string
  }
}

export default IArgs
