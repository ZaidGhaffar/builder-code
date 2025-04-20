const winston = require("winston");

// 📝 Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// 🎯 Create Winston logger
const logger = winston.createLogger({
  level: "info", // Log levels: error, warn, info, http, verbose, debug, silly
  format: logFormat,
  transports: [
    new winston.transports.Console(), // Logs to console
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), // Errors logged to file
    new winston.transports.File({ filename: "logs/combined.log" }), // All logs saved
  ],
});

module.exports = logger;
