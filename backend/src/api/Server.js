import express from "express";
import cors from "cors";
import Log from "../util/Log.js";
import { MOCK_DATA_JSON_STRING } from "./mock_data.js";
import path from "path";
import StatusCodes from "http-status-codes"

export default class Server {
  constructor(port) {
    Log.info(`Server::<init>( ${port} )`);
    this.port = port;
    this.express = express();

    this.registerMiddleware();
    this.registerRoutes();
    this.registerStaticFiles();
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
    this.express.get("/items", (req, res) => {
      Log.info(`Server::ItemsService(..) - Send Items`);

      let itemsToSend;
      try {
          const parsedData = JSON.parse(MOCK_DATA_JSON_STRING);

          const backendBaseUrl = `http://localhost:${this.port}`;

          itemsToSend = parsedData.map((itemJson) => {
              return {
                  id: itemJson.id,
                  title: itemJson.title,
                  category: itemJson.category,
                  description: itemJson.description,
                  price: parseFloat(itemJson.price).toFixed(2),
                  imageUrl: `${backendBaseUrl}${itemJson.imageUrl}`,
              };
          });
      } catch (error) {
          console.error("Error parsing mock data or preparing items:", error);
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to process items" });
      }

      res.status(StatusCodes.OK).json({ result: itemsToSend });
    });
  }

  registerStaticFiles() {
    const publicPath = path.resolve(process.cwd(), "public");
    this.express.use(express.static(publicPath));
    Log.info("Server::registerStaticFiles() - public path set")
  }
}
