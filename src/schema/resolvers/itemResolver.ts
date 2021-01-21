import ItemType from '../../types/itemType'
import IArgs from '../../types/IArgs'
import IContext from '../../types/IContext'
import FileType from '../../types/fileType'

const itemResolver = {
  Query: {
    item: async (
      _: null,
      { id }: IArgs,
      { Item }: IContext
    ): Promise<ItemType> => {
      try {
        return await Item.findById(id)
      } catch {
        throw new Error('Cannot find item with this Id')
      }
    },
    items: async (
      _: null,
      args: null,
      { Item }: IContext
    ): Promise<ItemType[]> => {
      return await Item.find()
    },
  },
  Mutation: {
    createItem: async (
      _: null,
      { itemInput }: IArgs,
      { Item, storeUpload, uploadToCloud, config }: IContext
    ): Promise<ItemType> => {
      const { name, image } = itemInput
      if (!name) {
        throw new Error(
          'Error - No "name" provided. New items must have a name'
        )
      }
      // see if item already exist
      const foundItem = await Item.findOne({ name: name.toLowerCase() })
      if (foundItem) {
        throw new Error('Item already exists')
      }

      let results: FileType | null = null
      if (image) {
        try {
          results = await storeUpload(image)
        } catch (err) {
          throw new Error('Error saving image to file ' + err)
        }
      }

      let url = ''
      if (results) {
        try {
          url = await uploadToCloud(results, config)
        } catch (err) {
          throw new Error('Error uploading image to cloud')
        }
      }

      const newItem = new Item({ name: name.toLowerCase(), image: { url } })
      await newItem.save()
      return newItem.toObject() as ItemType
    },
    updateItem: async (
      _: null,
      { id, itemInput }: IArgs,
      { Item, storeUpload, uploadToCloud, config }: IContext
    ): Promise<ItemType> => {
      const { name, image } = itemInput
      // see if item already exist
      const foundItem = await Item.findById(id)
      if (!foundItem) {
        throw new Error('Item does not exist in database')
      }

      let results: FileType | null = null
      if (image) {
        try {
          results = await storeUpload(image)
        } catch (err) {
          throw new Error('Error saving image to file ' + err)
        }
      }

      let url = ''
      if (results) {
        try {
          url = await uploadToCloud(results, config)
        } catch (err) {
          throw new Error('Error uploading image to cloud')
        }
      }

      if (name) {
        foundItem.name = name.toLowerCase()
      }

      if (url) {
        foundItem.image.url = url
      }

      await foundItem.save()
      return foundItem.toObject() as ItemType
    },
    deleteItem: async (
      _: null,
      { id }: IArgs,
      { Item, config, deleteImage }: IContext
    ): Promise<ItemType> => {
      const deletedItem = await Item.findOneAndDelete({ _id: id })

      if (!deletedItem) {
        throw new Error('Item not found')
      }

      // if item had an image delete it from cloudinary
      if (deletedItem?.image?.url) {
        await deleteImage(deletedItem.image.url, config)
      }

      return deletedItem.toObject() as ItemType
    },
  },
}

export default itemResolver
