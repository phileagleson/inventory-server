import fs from 'fs'
import IArgs from '../../types/IArgs'
import IContext from '../../types/IContext'
import { Item } from '../../models/Item'
import { List } from '../../models/List'
import config from '../../config.jenkins'
import listResolver from './listResolver'
import DBHelper from '../../DBHelper'
import FileType from '../../types/fileType'
import ListType from '../../types/listType'
import * as _ from 'lodash'

describe('listResolver', () => {
  let context: IContext
  let args: IArgs
  let dbHelper: DBHelper

  const uploadToCloud = jest.fn(
    (): Promise<string> => {
      return new Promise((resolve) => {
        resolve('https://')
      })
    }
  )

  const deleteImage = jest.fn(() => {
    return new Promise((resolve) => {
      resolve({ result: 'ok' })
    })
  })

  const storeUpload = jest.fn(
    (): Promise<FileType> => {
      return new Promise((resolve) => {
        resolve({
          id: '',
          filename: '',
          mimetype: '',
          path: '',
        })
      })
    }
  )
  const image = {
    filename: '',
    mimetype: '',
    encoding: '',
    createReadStream: () => new fs.ReadStream(),
  }

  beforeAll(() => {
    context = {
      Item,
      List,
      storeUpload,
      uploadToCloud,
      deleteImage,
      config,
    }

    args = {
      id: '',
      itemId: '',
      name: '',
      listInput: {
        name: 'Test List',
        listType: 'inventory',
        image: image,
      },
      itemInput: {
        name: '',
      },
    }

    dbHelper = new DBHelper(config)
    dbHelper.connectToDb()
  })

  describe('createList', () => {
    it('should create a list', async () => {
      const list = await listResolver.Mutation.createList(null, args, context)
      args.id = list.id
      expect(list.name).toEqual('test list')
      expect(list.image.url).toEqual('https://')
    })

    it('should attempt to store the image', () => {
      expect(storeUpload).toHaveBeenCalledTimes(1)
      expect(storeUpload).toHaveBeenCalledWith(image)
    })

    it('should attempt to upload the image to the cloud', () => {
      expect(uploadToCloud).toHaveBeenCalledTimes(1)
    })

    it('should throw an error if the list name already exists', async () => {
      await expect(
        listResolver.Mutation.createList(null, args, context)
      ).rejects.toThrowError()
    })

    it('should throw an error if no "name" is provided', async () => {
      const badArgs = _.cloneDeep(args)
      badArgs.listInput = { ...args.listInput }
      badArgs.listInput.name = ''
      await expect(
        listResolver.Mutation.createList(null, badArgs, context)
      ).rejects.toThrowError()
    })

    it('should throw an error if the listType is invalid', async () => {
      const badArgs = _.cloneDeep(args)
      badArgs.listInput.listType = 'invalidListType'
      badArgs.listInput.name = 'Random Name'
      await expect(
        listResolver.Mutation.createList(null, badArgs, context)
      ).rejects.toThrowError('Error - Invalid List Type provided')
    })
  })

  describe('lists', () => {
    let testList: ListType
    it('should return an array of 1 list', async () => {
      const lists = await listResolver.Query.lists(null, null, context)
      testList = lists[0]
      expect(lists.length).toEqual(1)
    })

    it('should return the test list', () => {
      expect(testList.name).toEqual('test list')
    })
  })

  describe('list', () => {
    it('should return a list with the specified id', async () => {
      const list = await listResolver.Query.list(null, args, context)
      expect(list.id).toEqual(args.id)
      expect(list.name).toEqual('test list')
    })

    it('should throw an error if an invalid id is specified', async () => {
      const badArgs = _.cloneDeep(args)
      badArgs.id = '13546213'
      await expect(
        listResolver.Query.list(null, badArgs, context)
      ).rejects.toThrowError('Error - No list found for specified id')
    })
  })

  describe('updateList', () => {
    it('should throw an error if an invalid id is specified', async () => {
      const badArgs = _.cloneDeep(args)
      badArgs.id = '13546213'
      await expect(
        listResolver.Mutation.updateList(null, badArgs, context)
      ).rejects.toThrowError('Error - Invalid list id specified')
    })

    it('should throw an error if an invalid listType is specified', async () => {
      const badArgs = _.cloneDeep(args)
      badArgs.listInput = { ...args.listInput }
      badArgs.listInput.listType = 'invalidListType'
      await expect(
        listResolver.Mutation.updateList(null, badArgs, context)
      ).rejects.toThrowError('Error - Invalid list type specified')
    })

    it('should attempt to store the image', () => {
      expect(storeUpload).toHaveBeenCalledTimes(1)
    })

    it('should upload the image to cloudinary', () => {
      expect(uploadToCloud).toHaveBeenCalledTimes(1)
    })

    let list: ListType
    it('should update the name if "name" is specified', async () => {
      const updatedArgs = _.cloneDeep(args)
      updatedArgs.listInput = { ...args.listInput }
      updatedArgs.listInput.name = 'Test List Updated'
      updatedArgs.listInput.listType = 'shopping'
      list = await listResolver.Mutation.updateList(null, updatedArgs, context)
      expect(list.name).toEqual('test list updated')
    })

    it('should update the listType if a valid "listType" is specified', () => {
      expect(list.listType).toEqual('shopping')
    })
  })

  describe('addItemToList', () => {
    it('should throw an error if an invalid list id is provided and cant be converted to an objectId', async () => {
      const badArgs = _.cloneDeep(args)
      badArgs.id = '13246513 '
      await expect(
        listResolver.Mutation.addItemToList(null, badArgs, context)
      ).rejects.toThrowError('Error - No list found for specified id')
    })

    it('should throw an error if an invalid list id is provided', async () => {
      const badArgs = _.cloneDeep(args)
      badArgs.id = '600b1635bda0677962200071'
      await expect(
        listResolver.Mutation.addItemToList(null, badArgs, context)
      ).rejects.toThrowError('Error - No list found for specified id')
    })

    let list: any
    it('should create a new item and return it in the list if the item does not exist', async () => {
      const updatedArgs = _.cloneDeep(args)
      updatedArgs.itemInput.name = 'Test Item 1'
      // get list to add item to
      list = await listResolver.Query.lists(null, null, context)
      updatedArgs.id = list[0].id
      const updatedList = await listResolver.Mutation.addItemToList(
        null,
        updatedArgs,
        context
      )
      expect(updatedList.items.length).toEqual(1)
      expect(updatedList.items[0].item.name).toEqual('test item 1')
    })

    let updatedList: any
    it('should increase the qty if more than one of the same item is added', async () => {
      const updatedArgs = _.cloneDeep(args)
      updatedArgs.itemInput.name = 'Test Item 1'
      // get list to add item to
      updatedArgs.id = list[0].id
      updatedList = await listResolver.Mutation.addItemToList(
        null,
        updatedArgs,
        context
      )
      args.itemId = updatedList.items[0].item.id
      expect(updatedList.items[0].qty).toEqual(2)
    })

    it('should add the item by id if provided', async () => {
      const updatedArgs = _.cloneDeep(args)
      // get list to add item to
      updatedArgs.id = list[0].id
      updatedList = await listResolver.Mutation.addItemToList(
        null,
        updatedArgs,
        context
      )
      expect(updatedList.items[0].qty).toEqual(3)
    })
  })

  describe('toggleCompletedItemOnList', () => {
    it('should throw an error if an invalid list id is specified and cant be converted to an objectId', async () => {
      const updatedArgs = _.cloneDeep(args)
      // get list to add item to
      updatedArgs.id = '1234a'

      await expect(
        listResolver.Mutation.deleteItemFromList(null, updatedArgs, context)
      ).rejects.toThrowError('Error - No list found for specified id')
    })

    it('should throw an error if an invalid list id is specified', async () => {
      const updatedArgs = _.cloneDeep(args)
      // get list to add item to
      updatedArgs.id = '600b1635bda0677962200071'

      await expect(
        listResolver.Mutation.deleteItemFromList(null, updatedArgs, context)
      ).rejects.toThrowError('Error - No list found for specified id')
    })

    it('should throw an error if an invalid itemId is specified', async () => {
      const updatedArgs = _.cloneDeep(args)
      updatedArgs.itemId = '600b1635bda0677962200071'
      await expect(
        listResolver.Mutation.deleteItemFromList(null, updatedArgs, context)
      ).rejects.toThrowError('Error - Item not found in list')
    })

    it('should toggle the completed status of the specified item', async () => {
      let toggledList = await listResolver.Mutation.toggleCompletedItemOnList(
        null,
        args,
        context
      )
      expect(toggledList.items[0].completed).toBe(true)
    })
  })

  describe('deleteItemFromList', () => {
    it('should throw an error if an invalid list id is specified and cant be converted to an objectId', async () => {
      const updatedArgs = _.cloneDeep(args)
      // get list to add item to
      updatedArgs.id = '1234a'

      await expect(
        listResolver.Mutation.deleteItemFromList(null, updatedArgs, context)
      ).rejects.toThrowError('Error - No list found for specified id')
    })

    it('should throw an error if an invalid list id is specified', async () => {
      const updatedArgs = _.cloneDeep(args)
      // get list to add item to
      updatedArgs.id = '600b1635bda0677962200071'

      await expect(
        listResolver.Mutation.deleteItemFromList(null, updatedArgs, context)
      ).rejects.toThrowError('Error - No list found for specified id')
    })

    it('should throw an error if an invalid itemId is specified', async () => {
      const updatedArgs = _.cloneDeep(args)
      updatedArgs.itemId = '600b1635bda0677962200071'
      await expect(
        listResolver.Mutation.deleteItemFromList(null, updatedArgs, context)
      ).rejects.toThrowError('Error - Item not found in list')
    })

    it('should reduce the qty by 1 if qty is > 1', async () => {
      const reducedList = await listResolver.Mutation.deleteItemFromList(
        null,
        args,
        context
      )
      expect(reducedList.items[0].qty).toEqual(2)
    })

    it('should remove the item completely if the qty < 1', async () => {
      await listResolver.Mutation.deleteItemFromList(null, args, context) // now at 1
      const reducedList = await listResolver.Mutation.deleteItemFromList(
        null,
        args,
        context
      ) // should be 0
      expect(reducedList.items.length).toEqual(0)
    })
  })

  describe('deleteList', () => {
    it('should delete the specified list', async () => {
      const list = await listResolver.Mutation.deleteList(null, args, context)
      expect(list.id).toEqual(args.id)
    })

    it('should throw an error if an invalid list id is specified', async () => {
      const badArgs = _.cloneDeep(args)
      badArgs.id = '1354065465'
      badArgs.listInput.listType = 'invalidListType'
      await expect(
        listResolver.Mutation.deleteList(null, badArgs, context)
      ).rejects.toThrowError('Error - list with specified id not found')
    })
  })

  // TODO: drop list collection and disconnect from db
  afterAll(async () => {
    await List.collection.drop()
    await Item.collection.drop()
    await dbHelper.disconnectFromDb()
  })
})
