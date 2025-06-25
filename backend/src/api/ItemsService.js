import StatusCodes from "http-status-codes";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Log from "../util/Log.js";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../..', 'public', 'images');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png, gif) are allowed!'));
    }
});
class ItemsService {
    constructor(db, port) {
        this.db = db;
        this.port = port;
        this.uploadImageMiddleware = upload.single('productImage');
    }

    __buildSearchPipeline(terms) {
        const pipeline = [];
    
        // Join products with category_products to get associated category IDs
        pipeline.push({
            $lookup: {
                from: 'category_products',
                localField: 'id',
                foreignField: 'productId',
                as: 'linkedCategories'
            }
        });
    
        // Join with categories to get the actual category names
        pipeline.push({
            $lookup: {
                from: 'categories',
                localField: 'linkedCategories.categoryId',
                foreignField: 'id',
                as: 'categoryDetails'
            }
        });
    
        // Join with product_attributes to get variant values
        pipeline.push({
            $lookup: {
                from: 'product_attributes',
                localField: 'id',
                foreignField: 'productId',
                as: 'productVariants'
            }
        });
    
        // Create a single 'searchableText' field for each product
        pipeline.push({
            $addFields: {
                searchableText: {
                    $concat: [
                        { $ifNull: ["$title", ""] }, " ",
                        { $ifNull: ["$description", ""] }, " ",
                        {
                            $reduce: {
                                input: "$categoryDetails.name",
                                initialValue: "",
                                in: { $concat: ["$$value", " ", "$$this"] }
                            }
                        }, " ",
                        {
                            $reduce: {
                                input: "$productVariants.attributeValue",
                                initialValue: "",
                                in: { $concat: ["$$value", " ", "$$this"] }
                            }
                        }, " "
                    ]
                }
            }
        });
    
        // Apply the "AND" search logic using the 'searchableText' field
        const andConditions = terms.map(term => {
            const regexTerm = new RegExp(term, 'i');
            return {
                searchableText: { $regex: regexTerm }
            };
        });
    
        pipeline.push({
            $match: {
                $and: andConditions
            }
        });
    
        // Project to return only the necessary fields for the frontend
        pipeline.push({
            $project: {
                _id: 0,
                id: 1,
                title: 1,
                category: 1,
                description: 1,
                price: 1,
                imageUrl: 1
            }
        });
    
        return pipeline;
    }
    
    // Create aggregation pipeline for attributes
    __buildAttributesPipeline(itemID) {
        const pipeline = [];
    
        // Filter product_attributes by the given itemID
        pipeline.push({
            $match: {
                productId: itemID
            }
        });
    
        // Join product_attributes with product_attribute_prices
        pipeline.push({
            $lookup: {
                from: 'product_attribute_prices',
                localField: 'attributeId',
                foreignField: 'attributeId',
                as: 'priceDetails'
            }
        });
    
        // Unwind the priceDetails array
        pipeline.push({
            $unwind: '$priceDetails'
        });
    
        // Project to return only the desired format
        pipeline.push({
            $project: {
                _id: 0,
                attributeValue: '$attributeValue',
                price: '$priceDetails.price'
            }
        });
    
        return pipeline;
    }

    // Gets all items from database
    getItems = async (req, res) => {
        Log.info(`Server::Get /items - Attempting to send all items`);

        let itemsToSend;
        try {
            const productsCollection = this.db.collection('products');
            const rawItems = await productsCollection.find({}).toArray();

            const staticURL = `http://localhost:${this.port}/`;

            itemsToSend = rawItems.map((itemDoc) => {
                return {
                    id: itemDoc.id,
                    title: itemDoc.title,
                    category: itemDoc.category,
                    description: itemDoc.description,
                    price: parseFloat(itemDoc.price).toFixed(2),
                    imageUrl: `${staticURL}${itemDoc.imageUrl}`,
                };
            });

            Log.info(`Server::ItemsService(..) - Sent ${itemsToSend.length} items from MongoDB.`);
            res.status(StatusCodes.OK).json({ result: itemsToSend });
        } catch (error) {
            Log.error("Error fetching or processing items from MongoDB:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch items from database" });
        }
    }

    // Get all best seller items
    getBestSellers = async (req, res) => {
        const BEST_SELLERS = "Best Sellers";
        const NUM_ITEMS = 3;

        Log.info(`Server::GET /items/best-sellers - Attempting to send ${NUM_ITEMS} random best-selling items.`);

        try {
            const categoriesCollection = this.db.collection('categories');
            const categoryProductsCollection = this.db.collection('category_products');
            const productsCollection = this.db.collection('products');

            const bestSellersCategory = await categoriesCollection.findOne({ name: BEST_SELLERS });

            if (!bestSellersCategory) {
                Log.error(`Server::GET /items/best-sellers - '${BEST_SELLERS}' category not found in DB.`);
                return res.status(StatusCodes.NOT_FOUND).json({ error: `Category '${BEST_SELLERS}' not found.` });
            }

            // get best sellers category id
            const bestSellersCategoryId = bestSellersCategory.id;

            // get category product documents that match best seller id
            const productLinks = await categoryProductsCollection.find({ categoryId: bestSellersCategoryId }).toArray();

            if (productLinks.length === 0) {
                Log.info(`Server::GET /items/best-sellers - No products linked to '${BEST_SELLERS}' category.`);
                return res.status(StatusCodes.OK).json({ result: [] });
            }

            // get list of product ids that are in best sellers categories
            const productIds = productLinks.map(link => link.productId);

            const randomBestSellers = await productsCollection.aggregate([
                { $match: { id: { $in: productIds } } }, // Match products that are best sellers
                { $sample: { size: NUM_ITEMS } } // Randomly select 3 from the matched set
            ]).toArray();

            const staticURL = `http://localhost:${this.port}/`;

            const itemsToSend = randomBestSellers.map((itemDoc) => {
                return {
                    id: itemDoc.id,
                    title: itemDoc.title,
                    description: itemDoc.description,
                    price: parseFloat(itemDoc.price).toFixed(2),
                    imageUrl: `${staticURL}${itemDoc.imageUrl}`,
                };
            });

            Log.info(`Server::GET /items/best-sellers - Sent ${itemsToSend.length} random best-selling items.`);
            res.status(StatusCodes.OK).json({ result: itemsToSend });

        } catch (error) {
            Log.error(`Error fetching random best-selling items from MongoDB:`, error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch random best-selling items from database" });
        }
    }

    // Get all items matching given category
    getItemsByCategory = async (req, res) => {
        let categoryName = req.params.category;
        Log.info(`itemRoutes::GET /items/categories/${categoryName} - Attempting to send items by category from MongoDB`);

        try {
            const categoriesCollection = this.db.collection('categories');
            const categoryProductsCollection = this.db.collection('category_products');
            const productsCollection = this.db.collection('products');

            const category = await categoriesCollection.findOne({ name: categoryName });

            if (!category) {
                Log.warn(`itemRoutes::GET /items/categories/${categoryName} - Category '${categoryName}' not found.`);
                return res.status(StatusCodes.NOT_FOUND).json({ error: `Category '${categoryName}' not found.` });
            }

            const categoryId = category.id;

            const productLinks = await categoryProductsCollection.find({ categoryId: categoryId }).toArray();

            if (productLinks.length === 0) {
                Log.info(`itemRoutes::GET /items/categories/${categoryName} - No products found for category '${categoryName}'.`);
                return res.status(StatusCodes.OK).json({ result: [] }); // Return empty array if no products matching category
            }

            const productIds = productLinks.map(link => link.productId);

            // Find the products with list of product ids that match categories
            // Use $in operator to match any product whose 'id' field is in the productIds array
            const rawItems = await productsCollection.find({ id: { $in: productIds } }).toArray();

            const backendBaseUrl = `http://localhost:${process.env.PORT || 3001}/`;

            const itemsToSend = rawItems.map((itemDoc) => {
                return {
                    id: itemDoc.id,
                    title: itemDoc.title,
                    description: itemDoc.description,
                    price: parseFloat(itemDoc.price).toFixed(2),
                    imageUrl: `${backendBaseUrl}${itemDoc.imageUrl}`,
                };
            });

            Log.info(`itemRoutes::GET /items/categories/${categoryName} - Sent ${itemsToSend.length} items for category '${categoryName}'.`);
            res.status(StatusCodes.OK).json({ result: itemsToSend });

        } catch (error) {
            Log.error(`Error fetching or processing items for category '${categoryName}' from MongoDB:`, error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch items by category from database" });
        }
    }

    // Get all items matching search query
    getItemsBySearchQuery = async (req, res) => {
        const searchTerm = req.query.q; // Get the search query from ?q=... parameter
        const productsCollection = this.db.collection('products');
    
        if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === "") {
            Log.info(`Server::GET /items/search - Empty or invalid search term received.`);
            return res.status(StatusCodes.OK).json({ result: [] });
        }
    
        const terms = searchTerm.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    
        if (terms.length === 0) {
            Log.info(`Server::GET /items/search - No valid search terms after splitting "${searchTerm}".`);
            return res.status(StatusCodes.OK).json({ result: [] });
        }
    
        Log.info(`Server::GET /items/search - Attempting search for: "${searchTerm}" (individual terms: ${terms.join(', ')})`);
        
        // Use aggregation pipeline to filter products based on the search query.
        try {
            const pipeline = this.__buildSearchPipeline(terms);
            const foundItems = await productsCollection.aggregate(pipeline).toArray();
            const backendBaseUrl = `http://localhost:${process.env.PORT || 3001}/`;
    
            const itemsToSend = foundItems.map((itemDoc) => {
                return {
                    id: itemDoc.id,
                    title: itemDoc.title,
                    description: itemDoc.description,
                    price: parseFloat(itemDoc.price).toFixed(2),
                    imageUrl: `${backendBaseUrl}${itemDoc.imageUrl}`,
                };
            });
    
            Log.info(`Server::GET /items/search - Sent ${itemsToSend.length} items for search query: "${searchTerm}".`);
            res.status(StatusCodes.OK).json({ result: itemsToSend });
    
        } catch (error) {
            Log.error(`Error fetching search results for "${searchTerm}" from MongoDB:`, error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to perform search. Please try again later." });
        }
    }

    // Get all items by their attribute
    getItemsByAttribute = async (req, res) => {
        const itemID = parseInt(req.params.itemID);
        const productAttributesCollection = this.db.collection('product_attributes');

        if (isNaN(itemID)) {
            Log.warn(`ItemsService::getItemsByAttribute - Invalid itemID: Must be a number. Provided: ${req.params.itemID}`);
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid item ID provided." });
        }

        Log.info(`ItemsService::getItemsByAttribute - Attempting to fetch attributes and prices for item ID: ${itemID}`);

        try {
            const pipeline = this.__buildAttributesPipeline(itemID);
            const result = await productAttributesCollection.aggregate(pipeline).toArray();

            if (result.length === 0) {
                Log.info(`ItemsService::getItemsByAttribute - No attributes or prices found for item ID: ${itemID}.`);
                return res.status(StatusCodes.NOT_FOUND).json({ result: [] });
            }

            Log.info(`ItemsService::getItemsByAttribute - Sent ${result.length} attribute-price pairs for item ID: ${itemID}.`);
            res.status(StatusCodes.OK).json({ result: result });

        } catch (error) {
            Log.error(`ItemsService::getItemsByAttribute - Error fetching attributes for item ID ${itemID} from MongoDB:`, error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch item attributes." });
        }
    }

    addItem = async (req, res) => {
        const { title, description, price } = req.body;
        const uploadedFile = req.file;

        if (!title || !description || !price || !uploadedFile) {
            console.warn("ProductService::createProduct - Missing required fields or image for new product.");
            if (uploadedFile) {
                fs.unlink(uploadedFile.path, (err) => {
                    if (err) console.error("Error deleting partially uploaded file:", err);
                });
            }
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields (title, description, price) and an image are required." });
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            console.warn("ProductService::createProduct - Invalid price provided.");
            if (uploadedFile) {
                fs.unlink(uploadedFile.path, (err) => {
                    if (err) console.error("Error deleting invalid product image:", err);
                });
            }
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Price must be a positive number." });
        }

        try {
            const productsCollection = this.db.collection('products');

            const lastProduct = await productsCollection.find().sort({ id: -1 }).limit(1).toArray();
            const newId = lastProduct.length > 0 ? lastProduct[0].id + 1 : 1;

            const imageUrl = `/images/${uploadedFile.filename}`;

            const newProduct = {
                id: newId,
                title,
                description,
                price: parseFloat(parsedPrice.toFixed(2)),
                imageUrl,
            };

            const result = await productsCollection.insertOne(newProduct);

            if (result.acknowledged) {
                console.log(`ProductService::createProduct - Product '${title}' with ID ${newId} added successfully.`);
                return res.status(StatusCodes.CREATED).json({
                    message: "Product added successfully!",
                    product: newProduct
                });
            } else {
                console.error("ProductService::createProduct - Failed to insert product into DB.");
                fs.unlink(uploadedFile.path, (err) => {
                    if (err) console.error("Error deleting file after DB insert failure:", err);
                });
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to add product to database." });
            }

        } catch (error) {
            console.error("ProductService::createProduct - Error adding product:", error);
            if (uploadedFile) {
                fs.unlink(uploadedFile.path, (err) => {
                    if (err) console.error("Error deleting file due to unhandled error:", err);
                });
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred while adding the product." });
        }
    };

    editItem = async (req, res) => {
        const { itemId } = req.params;
        const { title, description, price } = req.body;
        const newUploadedFile = req.file;

        // Validate Input
        if (!title || !description || !price) {
            console.warn(`ProductService::editItem - Missing required fields for item ID ${itemId}.`);
            // If a new file was uploaded but validation fails, delete it
            if (newUploadedFile) {
                fs.unlink(newUploadedFile.path, (err) => {
                    if (err) console.error("Error deleting partially uploaded new file:", err);
                });
            }
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Title, description, and price are required." });
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            console.warn(`ProductService::editItem - Invalid price provided for item ID ${itemId}.`);
            if (newUploadedFile) {
                fs.unlink(newUploadedFile.path, (err) => {
                    if (err) console.error("Error deleting invalid product image (new file):", err);
                });
            }
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Price must be a positive number." });
        }

        try {
            const productsCollection = this.db.collection('products');
            const productId = parseInt(itemId);

            // Find existing item (hopefully it exists)
            const existingProduct = await productsCollection.findOne({ id: productId });

            if (!existingProduct) {
                console.warn(`ProductService::editItem - Item with ID ${itemId} not found.`);
                // If a new file was uploaded but the item doesn't exist, delete the new file
                if (newUploadedFile) {
                    fs.unlink(newUploadedFile.path, (err) => {
                        if (err) console.error("Error deleting new file for non-existent product:", err);
                    });
                }
                return res.status(StatusCodes.NOT_FOUND).json({ message: `Product with ID ${itemId} not found.` });
            }

            let updateFields = {
                title,
                description,
                price: parseFloat(parsedPrice.toFixed(2)),
            };
            let oldImageUrlToDelete = null;

            // Handle Image Update
            if (newUploadedFile) {
                // A new image was uploaded
                updateFields.imageUrl = `/images/${newUploadedFile.filename}`;

                // Check if there's an existing image to delete
                if (existingProduct.imageUrl && existingProduct.imageUrl !== updateFields.imageUrl) {
                    oldImageUrlToDelete = path.join(__dirname, '../public', existingProduct.imageUrl);
                }
                console.log(`ProductService::editItem - New image uploaded for item ID ${itemId}. Old image path: ${oldImageUrlToDelete}`);
            } else {
                // No new image uploaded, keep the existing one
                updateFields.imageUrl = existingProduct.imageUrl;
            }

            // Update the product in the database
            const result = await productsCollection.updateOne(
                { id: productId },
                { $set: updateFields }
            );

            if (result.matchedCount === 0) {
                // additional check to make sure everything is gucci
                console.error(`ProductService::editItem - Product with ID ${itemId} not found during update.`);
                if (newUploadedFile) {
                    fs.unlink(newUploadedFile.path, (err) => {
                        if (err) console.error("Error deleting new file after no matching update:", err);
                    });
                }
                return res.status(StatusCodes.NOT_FOUND).json({ message: `Product with ID ${itemId} not found for update.` });
            }

            if (result.modifiedCount === 0 && !newUploadedFile) {
                // If no changes made, then count this as a successful no operation
                console.log(`ProductService::editItem - No changes detected for item ID ${itemId}.`);
                return res.status(StatusCodes.OK).json({ message: "No changes detected, product not updated.", product: existingProduct });
            }

            // Delete old image (if new one is uploaded)
            if (oldImageUrlToDelete && fs.existsSync(oldImageUrlToDelete)) {
                fs.unlink(oldImageUrlToDelete, (err) => {
                    if (err) {
                        console.error(`ProductService::editItem - Error deleting old image file ${oldImageUrlToDelete}:`, err);
                    } else {
                        console.log(`ProductService::editItem - Successfully deleted old image: ${oldImageUrlToDelete}`);
                    }
                });
            }

            // Return updated product
            const updatedProduct = await productsCollection.findOne({ id: productId });
            console.log(`ProductService::editItem - Product '${updatedProduct.title}' with ID ${itemId} updated successfully.`);
            return res.status(StatusCodes.OK).json({
                message: "Product updated successfully!",
                product: updatedProduct
            });

        } catch (error) {
            console.error(`ProductService::editItem - Error updating product ID ${itemId}:`, error);
            // If an error occurs during DB operation, clean up new uploaded file
            if (newUploadedFile) {
                fs.unlink(newUploadedFile.path, (err) => {
                    if (err) console.error("Error deleting new file due to unhandled error during update:", err);
                });
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred while updating the product." });
        }
    };
}

export default ItemsService;