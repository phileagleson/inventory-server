import logger, { timezoned } from './logger'

describe('logger', () => {
  describe('timezoned', () => {
    it('should return a string with the current date', () => {
      const now = new Date()
      const month = now.getMonth() + 1
      const day = now.getDate()

      const dateString = timezoned()
      const firstSlashIndex = dateString.indexOf('/')
      const secondSlashIndex = dateString.indexOf('/', firstSlashIndex + 1)
      const dateMonth = +dateString.slice(0, firstSlashIndex)
      const dateDay = +dateString.slice(firstSlashIndex + 1, secondSlashIndex)

      expect(dateString).toBeTruthy()
      expect(month).toEqual(dateMonth)
      expect(day).toEqual(dateDay)
    })
  })

  describe('createLogger', () => {
    it('should create a logger function', () => {
      expect(logger).toBeTruthy()
    })
  })
})
