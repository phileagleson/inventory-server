import fs from 'fs'
interface IArgs {
  id: string
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
}

export default IArgs
