import pino from "pino";

// create pino loggger
const logger = pino({
  level: process.env.LOG_LEVEL || "debug",
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
  },
});

export default logger;
