import ListType from '../../types/listType'
import IContext from '../../types/IContext'
import IArgs from '../../types/IArgs'
import FileType from '../../types/fileType'
import itemResolver from './itemResolver'

const listResolver = {
  Query: {
    list: async (
      _: null,
      { id }: IArgs,
      { List }: IContext
    ): Promise<ListType> => {
      try {
        return await List.findById(id)
      } catch {
        throw new Error('Error - No list found for specified id')
      }
    },
    lists: async (
      _: null,
      args: null,
      { List }: IContext
    ): Promise<ListType[]> => {
      return await List.find()
    },
  },
  Mutation: {
    createList: async (
      _: null,
      { listInput }: IArgs,
      { List, storeUpload, uploadToCloud, config }: IContext
    ): Promise<ListType> => {
      const { name, image, listType } = listInput

      if (!name) {
        throw new Error(
          'Error - No "name" provided. New Lists must have a name'
        )
      }

      const foundList = await List.findOne({ name: name.toLowerCase() })
      if (foundList) {
        throw new Error('Error - List already exists with this name')
      }

      if (listType && listType !== 'shopping' && listType !== 'inventory') {
        throw new Error('Error - Invalid List Type provided')
      }

      let results: FileType | null = null
      if (image) {
        results = await storeUpload(image)
      }

      let url = ''
      if (results) {
        url = await uploadToCloud(results, config)
      }

      const newList = new List({
        name: name.toLowerCase(),
        image: { url },
        listType: listType?.toLowerCase(),
      })

      await newList.save()
      return newList.toObject() as ListType
    },
    updateList: async (
      _: null,
      { id, listInput }: IArgs,
      { List, uploadToCloud, storeUpload, config }: IContext
    ): Promise<ListType> => {
      const { name, image, listType } = listInput

      let list
      try {
        list = await List.findById(id)
      } catch {
        throw new Error('Error - Invalid list id specified')
      }

      if (name) {
        list.name = name.toLowerCase()
      }

      if (
        listType &&
        listType.toLowerCase() !== 'shopping' &&
        listType.toLowerCase() !== 'inventory'
      ) {
        throw new Error('Error - Invalid list type specified')
      }

      if (listType) {
        list.listType = listType.toLowerCase()
      }

      let result
      if (image) {
        result = await storeUpload(image)
      }

      let url = ''
      if (result) {
        url = await uploadToCloud(result, config)
      }

      if (url) {
        list.image.url = url
      }

      await list.save()

      return list.toObject() as ListType
    },
    deleteList: async (
      _: null,
      { id }: IArgs,
      { List }: IContext
    ): Promise<ListType> => {
      try {
        const deletedList = await List.findOneAndDelete({ _id: id })
        return deletedList
      } catch {
        throw new Error('Error - list with specified id not found')
      }
    },
    addItemToList: async (
      _: null,
      { id, itemId, itemInput }: IArgs,
      { List, Item, config, uploadToCloud, deleteImage, storeUpload }: IContext
    ): Promise<ListType> => {
      const { name } = itemInput

      // find the list
      let list
      try {
        list = await List.findById(id).populate('items.item')
      } catch {
        throw new Error('Error - No list found for specified id')
      }

      if (!list) {
        throw new Error('Error - No list found for specified id')
      }

      // see if the item already exists
      // first search by id
      let item: any
      if (itemId) {
        item = await Item.findById(itemId)
      }

      // if item isn't found check by name

      if (!item && name) {
        item = await Item.findOne({ name: name.toLowerCase() })
      }

      // if still no item we need to create one
      if (!item) {
        const context = {
          Item,
          List,
          storeUpload,
          uploadToCloud,
          config,
          deleteImage,
        }
        const args: IArgs = {
          id: '',
          itemId,
          name: '',
          itemInput,
          listInput: {
            name: '',
            listType: '',
          },
        }

        item = await itemResolver.Mutation.createItem(null, args, context)
      }

      // if we get here we should have a list and an item
      let found = false
      list.items.forEach((entry: any) => {
        if (entry.item.id === item.id) {
          entry.qty += 1
          found = true
        }
      })

      if (!found) {
        list.items.push({ item })
      }

      await list.save()
      return list.toObject() as ListType
    },

    deleteItemFromList: async (
      _: null,
      { id, itemId }: IArgs,
      { List }: IContext
    ): Promise<ListType> => {
      // find the list
      let list
      try {
        list = await List.findById(id).populate('items.item')
      } catch {
        throw new Error('Error - No list found for specified id')
      }

      if (!list) {
        throw new Error('Error - No list found for specified id')
      }

      const index = list.items.findIndex((entry: any) => {
        if (entry.item.id === itemId) {
          return true
        }
        return false
      })

      if (index < 0) {
        throw new Error('Error - Item not found in list')
      }

      if (list.items[index].qty > 1) {
        list.items[index].qty -= 1
      } else {
        list.items.splice(index)
      }

      await list.save()
      return list.toObject() as ListType
    },
    toggleCompletedItemOnList: async (
      _: null,
      { id, itemId }: IArgs,
      { List }: IContext
    ): Promise<ListType> => {
      // find the list
      let list
      try {
        list = await List.findById(id).populate('items.item')
      } catch {
        throw new Error('Error - No list found for specified id')
      }

      if (!list) {
        throw new Error('Error - No list found for specified id')
      }

      const index = list.items.findIndex((entry: any) => {
        if (entry.item.id === itemId) {
          return true
        }
        return false
      })

      if (index < 0) {
        throw new Error('Error - Item not found in list')
      }

      list.items[index].completed = !list.items[index].completed

      list.save()
      return list.toObject() as ListType
    },
  },
}

export default listResolver
