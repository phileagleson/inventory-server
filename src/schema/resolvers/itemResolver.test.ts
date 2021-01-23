import fs from 'fs'
import itemResolver from './itemResolver'
import { Item } from '../../models/Item'
import { List } from '../../models/List'
import config from '../../config.jenkins'
import IContext from '../../types/IContext'
import DBHelper from '../../DBHelper'
import IArgs from '../../types/IArgs'
import FileType from '../../types/fileType'

describe('itemResolver', () => {
  let context: IContext
  let dbHelper: DBHelper
  let args: IArgs

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

  beforeAll(async () => {
    context = {
      Item,
      List,
      storeUpload,
      uploadToCloud,
      config,
      deleteImage,
    }

    args = {
      id: '',
      itemId: '',
      name: '',
      itemInput: {
        name: 'Test1',
        image: image,
      },
      listInput: {
        name: '',
        listType: '',
      },
    }
    dbHelper = new DBHelper(config)
    await dbHelper.connectToDb()
  })

  describe('createItem', () => {
    it('should create an item', async () => {
      const item = await itemResolver.Mutation.createItem(null, args, context)
      expect(item).toBeTruthy()
      expect(item.name).toEqual('test1')
      expect(item.id).toBeDefined()
      args.id = item.id
    })

    it('should throw an error when creating an item with the same name', async () => {
      await expect(
        itemResolver.Mutation.createItem(null, args, context)
      ).rejects.toThrowError()
    })

    it('should throw an error if no name is provided', async () => {
      const badArgs = { ...args }
      badArgs.itemInput.name = ''
      await expect(
        itemResolver.Mutation.createItem(null, badArgs, context)
      ).rejects.toThrowError(
        'Error - No "name" provided. New items must have a name'
      )
    })
  })

  describe('item', () => {
    it('should return the newly created item', async () => {
      const item = await itemResolver.Query.item(null, args, context)
      expect(item).toBeTruthy()
      expect(item.name).toEqual('test1')
      expect(item.id).toEqual(args.id)
    })

    it('should throw an error if the id isnt valid', async () => {
      const badArgs = { ...args }
      badArgs.id = '12354653'
      await expect(
        itemResolver.Query.item(null, badArgs, context)
      ).rejects.toThrowError('Cannot find item with this Id')
    })
  })

  describe('items', () => {
    it('should return an array', async () => {
      const items = await itemResolver.Query.items(null, null, context)
      expect(items.length).toEqual(1)
      expect(items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'test1',
          }),
        ])
      )
    })
  })

  describe('updateItem', () => {
    it('should update an item in the database', async () => {
      args.itemInput.name = 'Test Updated'
      const updatedItem = await itemResolver.Mutation.updateItem(
        null,
        args,
        context
      )
      expect(updatedItem).toBeTruthy
      expect(updatedItem.name).toEqual('test updated')
    })

    it('should throw an error if an invalid id is provided', async () => {
      const badArgs = { ...args }
      badArgs.id = '12345651'
      await expect(
        itemResolver.Mutation.updateItem(null, badArgs, context)
      ).rejects.toThrowError('Item does not exist in database')
    })
  })

  describe('deleteItem', () => {
    it('should delete an item in the database', async () => {
      const deletedItem = await itemResolver.Mutation.deleteItem(
        null,
        args,
        context
      )
      expect(deletedItem).toBeTruthy()
      expect(deletedItem.name).toEqual('test updated')
    })

    it('should throw an error if the id doesnt exist', async () => {
      const badArgs = { ...args }
      badArgs.id = '13240239u4'
      await expect(
        itemResolver.Mutation.deleteItem(null, badArgs, context)
      ).rejects.toThrowError('Item not found')
    })
  })

  afterAll(async () => {
    await Item.collection.drop()
    await dbHelper.disconnectFromDb()
  })
})
