require("dotenv").config();
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import logger from "./utils/logger";
import error from "./middlewares/error";
import { db } from "./db_init/dbConn";
import users from "./routes/users";
import files from "./routes/files";

const port = process.env.PORT || 5000;

declare module "express" {
  interface Request {
    user?: any;
    slowDown?: any;
  }
}

// create instance of express
const app = express();

app.set("trust-proxy", 1);

// block all unwanted header using helmet
app.use(helmet());

// disable x-powered-by header separately
app.disable("x-powered-by");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// disable caching
app.disable("etag");
morgan.token("remote-addr", (req: any) => {
  return req.header("X-Real-IP") || req.ip;
});
app.use(
  morgan("common", {
    stream: {
      write: (message) => logger.http(message),
    },
  })
);

// Routes
app.use("/api/user", users);
app.use("/api/files", files);

// error middleware to handle error response
app.use(error);

db.connect()
  .then((conn) => {
    logger.info("Connected to database");
    // on success, release the connection
    conn.done();

    // for test environment do not start the server
    if (process.env.NODE_ENV !== "test") {
      app
        .listen(parseInt(port.toString()), "0.0.0.0", () => {
          // log a message to confirm that the express server is running
          logger.info(`Server is listening on ${port}`);
        })
        .on("error", (err: any) => {
          // in case of error, log the error
          logger.error(JSON.stringify(err));
        });
    }
  })
  .catch((err) => {
    logger.error(JSON.stringify(err));
  });

export default app;
