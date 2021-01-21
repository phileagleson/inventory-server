import fs from 'fs'
import path from 'path'
import storeUpload from './storeUpload'

describe('storeUpload', () => {
  const filename = 'testimage.jpg'
  const mimetype = 'image/jpeg'
  const imageList: string[] = []
  let upload: {
    filename: string
    mimetype: string
    encoding: string
    createReadStream: () => fs.ReadStream
  }

  it('to save file succesfully', async () => {
    // get test file
    const testFilePath = path.join(__dirname, './testFiles/testimage.jpg')

    // create FileUpload object
    upload = {
      createReadStream: () => fs.createReadStream(testFilePath),
      filename,
      mimetype,
      encoding: '',
    }

    // attempt to storeUpload
    const res = await storeUpload(upload)

    // save image path to be deleted later
    imageList.push(res.path)
    expect(res).toBeTruthy()

    // We may still get a result if the file couldn't be saved, check to make sure the file exists
    fs.stat(res.path, (_, status) => {
      expect(status).toBeTruthy()
    })
  })

  it('should thow an error if file does not exist', async () => {
    // get test file that doesn't exist
    const testFilePath = path.join(__dirname, './testFiles/test.jpg')

    // create FileUpload object
    upload = {
      createReadStream: () => fs.createReadStream(testFilePath),
      filename,
      mimetype,
      encoding: '',
    }
    await expect(storeUpload(upload)).rejects.toThrowError()
  })

  afterAll(() => {
    // Delete all files uploaded for testing
    imageList.forEach((imagePath) => {
      fs.unlinkSync(imagePath)
    })
  })
})
