import { createLogger, transports, format } from 'winston'

export const timezoned = (): string => {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
  })
}

const logger = createLogger({
  transports: [
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.timestamp({ format: timezoned }),
        format.prettyPrint()
      ),
    }),
    new transports.Console({
      level: 'error',
      format: format.combine(
        format.timestamp({ format: timezoned }),
        format.prettyPrint()
      ),
    }),
    /*
    new transports.File({
      filename: './logs/info.log',
      level: 'info',
      format: format.combine(
        format.timestamp({ format: timezoned }),
        format.prettyPrint()
      ),
    }),
    new transports.File({
      filename: './logs/error.log',
      level: 'error',
      format: format.combine(
        format.timestamp({ format: timezoned }),
        format.prettyPrint()
      ),
    }),
    */
  ],
})

export default logger
