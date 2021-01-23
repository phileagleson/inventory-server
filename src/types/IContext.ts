import { Item } from '../models/Item'
import { List } from '../models/List'
import storeUpload from '../utils/storeUpload'
import uploadToCloud, { deleteImage } from '../utils/uploadToCloud'
import Config from './config'

interface IContext {
  Item: typeof Item
  List: typeof List
  storeUpload: typeof storeUpload
  uploadToCloud: typeof uploadToCloud
  config: Config
  deleteImage: typeof deleteImage
}

export default IContext
