import winston from "winston";

const Log = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  defaultMeta: { service: "user-service" },
  transports: [new winston.transports.Console()],
  exceptionHandlers: [
    new winston.transports.Console({
      format: winston.format.errors({ stack: true }),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.Console({
      format: winston.format.errors({ stack: true }),
    }),
  ],
});

export default Log;
