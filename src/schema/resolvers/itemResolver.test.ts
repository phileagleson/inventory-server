import itemResolver from './itemResolver'
import { Item } from '../../models/Item'
import storeUpload from '../../utils/storeUpload'
import uploadToCloud, { deleteImage } from '../../utils/uploadToCloud'
import config from '../../config.jenkins'
import IContext from '../../types/IContext'
import DBHelper from '../../DBHelper'

describe('itemResolver', () => {
  let context: IContext
  let dbHelper: DBHelper
  let id = ''

  beforeAll(async () => {
    context = {
      Item,
      storeUpload,
      uploadToCloud,
      config,
      deleteImage,
    }
    dbHelper = new DBHelper(config)
    await dbHelper.connectToDb()
  })

  describe('createItem', () => {
    const args = {
      id: '',
      name: '',
      itemInput: {
        name: 'Test1',
      },
    }

    it('should create an item', async () => {
      const item = await itemResolver.Mutation.createItem(null, args, context)
      expect(item).toBeTruthy()
      expect(item.name).toEqual('test1')
      expect(item.id).toBeDefined()
      id = item.id
    })

    it('should throw an error when creating an item with the same name', async () => {
      await expect(
        itemResolver.Mutation.createItem(null, args, context)
      ).rejects.toThrowError()
    })
  })

  describe('item', () => {
    it('should return the newly created item', async () => {
      const args = {
        id: id,
        name: '',
        itemInput: {
          name: 'Test1',
        },
      }
      const item = await itemResolver.Query.item(null, args, context)
      expect(item).toBeTruthy()
      expect(item.name).toEqual('test1')
      expect(item.id).toEqual(id)
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
      const args = {
        id: id,
        name: '',
        itemInput: {
          name: 'Test Updated',
        },
      }
      const updatedItem = await itemResolver.Mutation.updateItem(
        null,
        args,
        context
      )
      expect(updatedItem).toBeTruthy
      expect(updatedItem.name).toEqual('test updated')
    })
  })

  describe('deleteItem', () => {
    it('should delete an item in the database', async () => {
      const args = {
        id: id,
        name: '',
        itemInput: {
          name: 'Test Updated',
        },
      }
      const deletedItem = await itemResolver.Mutation.deleteItem(
        null,
        args,
        context
      )
      expect(deletedItem).toBeTruthy()
      expect(deletedItem.name).toEqual('test updated')
    })

    it('should throw an error if the id doesnt exist', async () => {
      const args = {
        id: '1askldfjalsdkjfh',
        name: '',
        itemInput: {
          name: 'Test Updated',
        },
      }
      await expect(
        itemResolver.Mutation.deleteItem(null, args, context)
      ).rejects.toThrowError()
    })
  })

  afterAll(async () => {
    await Item.collection.drop()
    await dbHelper.disconnectFromDb()
  })
})
