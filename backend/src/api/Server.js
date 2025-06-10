import express from "express";
import cors from "cors";
import Log from "../util/Log.js";

export default class Server {
  constructor(port) {
    Log.info(`Server::<init>( ${port} )`);
    this.port = port;
    this.express = express();

    this.registerMiddleware();
    this.registerRoutes();
  }

  async start() {
    return new Promise((resolve, reject) => {
      Log.info("Server::start() - start");
      this.server = this.express
        .listen(this.port, () => {
          Log.info(`Server::start() - server listening on port: ${this.port}`);
          resolve();
        })
        .on("error", (err) => {
          // catches errors in server start
          Log.error(`Server::start() - server ERROR: ${err.message}`);
          reject(err);
        });
    });
  }

  // Registers middleware to parse request before passing them to request handlers
  registerMiddleware() {
    // JSON parser must be place before raw parser because of wildcard matching done by raw parser below
    this.express.use(express.json());

    // enable cors in request headers to allow cross-origin HTTP requests
    this.express.use(cors());
  }

  registerRoutes() {
    this.express.get("/", (req, res) => {
      res.send("HI");
    });
  }
}
