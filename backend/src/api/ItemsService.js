import StatusCodes from "http-status-codes";
import Log from "../util/Log.js";

class ItemsService {
    constructor(db, port) {
        this.db = db;
        this.port = port;
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
}

export default ItemsService;