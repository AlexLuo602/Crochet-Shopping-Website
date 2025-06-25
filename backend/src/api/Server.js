import express from "express";
import cors from "cors";
import Log from "../util/Log.js";
import path from "path";
import { MongoClient } from 'mongodb';
import ItemsService from "./ItemsService.js";
import CartsService from "./CartsService.js";

export default class Server {
    constructor(port) {
        Log.info(`Server::<init>( ${port} )`);
        this.port = port;
        this.express = express();

        this.mongoClient = null;
        this.db = null;
        this.ItemsService = null;
        this.CartsService = null;

        this.registerMiddleware();
        this.registerStaticFiles();
    }

    async start() {
        Log.info("Server::start() - start");

        const mongoUri = process.env.MONGO_URI || 'mongodb://mongodb:27017/455Assignment';

        try {
            // Connect to MongoDB
            this.mongoClient = new MongoClient(mongoUri, {});
            await this.mongoClient.connect();
            this.db = this.mongoClient.db('455Assignment');
            Log.info("Server::start() - Connected to MongoDB successfully!");

            // Initialize Services
            this.ItemsService = new ItemsService(this.db, this.port);
            this.CartsService = new CartsService(this.db, this.port);

            // Register endpoints
            this.registerRoutes();

            // Start express server
            this.server = this.express
                .listen(this.port, () => {
                    Log.info(`Server::start() - Express server listening on port: ${this.port}`);
                })
                .on("error", (err) => {
                    Log.error(`Server::start() - Express server ERROR: ${err.message}`);
                    this.close();
                    reject(err);
                });
            return Promise.resolve();
        } catch (err) {
            Log.error(`Server::start() - MongoDB connection or Express server startup ERROR: ${err.message}`);
            return Promise.reject(err);
        }
    }

    // close MongoDB connection in case of error starting server
    async close() {
        if (this.mongoClient) {
            await this.mongoClient.close();
            Log.info("Server::close() - MongoDB connection closed.");
        }
        if (this.server) {
            await new Promise(resolve => this.server.close(resolve));
            Log.info("Server::close() - Express server closed.");
        }
    }

    registerMiddleware() {
        this.express.use(cors());
        this.express.use(express.json());
    }

    registerRoutes() {
        // Routes for Items
        this.express.get("/items", this.ItemsService.getItems);
        this.express.get("/items/best-sellers", this.ItemsService.getBestSellers);
        this.express.get("/items/categories/:category", this.ItemsService.getItemsByCategory);
        this.express.get("/items/search", this.ItemsService.getItemsBySearchQuery);
        this.express.get("/items/attributes/:itemID", this.ItemsService.getItemsByAttribute);

        // Routes for Carts
        this.express.post("/carts", this.CartsService.addShoppingCart);
        this.express.get("/carts/:cartId", this.CartsService.GetShoppingCartByID);
        this.express.post("/carts/:cartId/items", this.CartsService.addItemToCart);
        this.express.delete("/carts/:cartId/items/:productId", this.CartsService.removeItemFromCart);
        this.express.delete("/carts/:cartId/clear", this.CartsService.clearCart);
        this.express.post("/orders", this.CartsService.createOrder);

        // Admin stuff
        this.express.get("/admin/carts", this.CartsService.getAllCarts);
        this.express.get("/admin/orders", this.CartsService.getAllOrders);
        this.express.post("/admin/add-item", 
            this.ItemsService.uploadImageMiddleware,
            this.ItemsService.addItem);
        this.express.put("/admin/edit-item/:itemId", 
            this.ItemsService.uploadImageMiddleware,
            this.ItemsService.editItem);
    }

    registerStaticFiles() {
        const publicPath = path.resolve(process.cwd(), "public");
        this.express.use(express.static(publicPath));
        Log.info("Server::registerStaticFiles() - public path set")
    }
}