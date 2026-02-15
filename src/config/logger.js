const winston = require('winston');
const config = require('./config');

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
    // winston.format.timestamp({
    //   format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    // }),
    winston.format.align(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
    // winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
    new winston.transports.File({
      filename: `${config.log.location}error.log`,
      level: 'error',
    }),
    new winston.transports.File({
      filename: `${config.log.location}combined.log`,
    }),
  ],
});

module.exports = logger;
