import { Item } from '../models/Item'
import storeUpload from '../utils/storeUpload'
import uploadToCloud, { deleteImage } from '../utils/uploadToCloud'
import Config from './config'

interface IContext {
  Item: typeof Item
  storeUpload: typeof storeUpload
  uploadToCloud: typeof uploadToCloud
  config: Config
  deleteImage: typeof deleteImage
}

export default IContext
