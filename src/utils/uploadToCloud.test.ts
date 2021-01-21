import uploadToCloud, { deleteImage } from './uploadToCloud'
import config from '../config.jenkins'
import path from 'path'
import FileType from '../types/fileType'

describe('uploadToCloud', () => {
  let image: FileType
  let imageURL: string

  beforeAll(() => {
    const imagePath = path.join(__dirname, './testFiles/testuploadimage.jpg')
    image = {
      id: '1',
      mimetype: 'image/jpeg',
      filename: '',
      path: imagePath,
    }
  })
  describe('uploadToCloud', () => {
    it('should upload an image to cloudinary', async () => {
      jest.setTimeout(15000)
      const res = await uploadToCloud(image, config)
      imageURL = res
      expect(res).toBeTruthy()
      expect(res.slice(0, 8)).toEqual('https://')
    })

    it('should throw error with invalid cloudinary credentials', async () => {
      const newConfig = { ...config }
      newConfig.GROCERY_CLOUD_API = ''
      await expect(uploadToCloud(image, newConfig)).rejects.toThrowError()
    })
  })

  describe('deleteImage', () => {
    it('should throw error on delete with invalid credentials', async () => {
      const invalidConfig = { ...config }
      invalidConfig.GROCERY_CLOUD_API = ''
      await expect(deleteImage(imageURL, invalidConfig)).rejects.toThrowError()
    })

    it('should delete an image from cloudinary', async () => {
      jest.setTimeout(15000)
      const res = await deleteImage(imageURL, config)
      expect(res).toBeTruthy()
      expect(res.result).toEqual('ok')
    })
  })
})
