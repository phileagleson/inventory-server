import config from './config.jenkins'
import DBHelper from './DBHelper'

let dbHelper: DBHelper

describe('DBHelper', () => {
  beforeAll(() => {
    dbHelper = new DBHelper(config)
  })

  describe('DBHelper', () => {
    it('to have been created', () => {
      expect(dbHelper).toBeTruthy
    })

    describe('connectToDb', () => {
      it('should connect to the database', async () => {
        const conn = await dbHelper.connectToDb()
        expect(conn).toBeTruthy()
      })
    })

    describe('disconnectFromDb', () => {
      it('should disconnect from the database', async () => {
        const res = await dbHelper.disconnectFromDb()
        expect(res).toBeTruthy()
      })
    })
  })

  afterAll(async () => {
    await dbHelper.disconnectFromDb()
  })
})
