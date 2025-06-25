import StatusCodes from "http-status-codes";
import Log from "../util/Log.js";
import { v4 as uuidv4 } from 'uuid';

class CartsService {
    constructor(db, port) {
        this.db = db;
        this.port = port;
    }

    _calculateCartTotals(items) {
        let totalQuantity = 0;
        let totalPrice = 0;
        items.forEach(item => {
            totalQuantity += item.quantity;
            totalPrice += parseFloat(item.price) * item.quantity;
        });
        return { totalQuantity, totalPrice };
    }

    addShoppingCart = async (req, res) => {
        const { cartId } = req.body;
        const cartsCollection = this.db.collection('shopping_carts');

        if (!cartId) {
            Log.warn("Server::POST /carts - No cartId provided in request body.");
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Cart ID is required." });
        }

        try {
            // Check if a cart with this ID already exists
            const existingCart = await cartsCollection.findOne({ shoppingCartId: cartId });

            if (existingCart) {
                Log.info(`Server::POST /carts - Cart with ID ${cartId} already exists, not creating a new one.`);
                return res.status(StatusCodes.OK).json({ message: "Cart already exists.", cartId: cartId, result: existingCart });
            } else {
                const newCart = {
                    shoppingCartId: cartId,
                    items: [],
                    totalQuantity: 0,
                    totalPrice: 0,
                };
                await cartsCollection.insertOne(newCart);
                Log.info(`Server::POST /carts - Created new shopping cart with ID: ${cartId}`);
                return res.status(StatusCodes.CREATED).json({ message: "New cart created successfully.", cartId: cartId, result: newCart });
            }
        } catch (error) {
            Log.error("Error creating shopping cart:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to create shopping cart." });
        }
    }

    getAllCarts = async (req, res) => {
        const cartsCollection = this.db.collection('shopping_carts');

        Log.info("CartService::getAllCarts - Attempting to fetch all shopping carts.");

        try {
            const allCarts = await cartsCollection.find({}).toArray();

            Log.info(`CartService::getAllCarts - Sent ${allCarts.length} shopping carts.`);
            return res.status(StatusCodes.OK).json({ result: allCarts });

        } catch (error) {
            Log.error("CartService::getAllCarts - Error fetching all shopping carts from MongoDB:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch all shopping carts." });
        }
    }

    GetShoppingCartByID = async (req, res) => {
        const cartId = req.params.cartId;
        const cartsCollection = this.db.collection('shopping_carts');

        if (!cartId) {
            Log.warn("Server::GET /carts/:cartId - No cartId provided in URL parameters.");
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Cart ID is required." });
        }

        try {
            const cart = await cartsCollection.findOne({ shoppingCartId: cartId });

            if (cart) {
                Log.info(`Server::GET /carts/:cartId - Found cart with ID: ${cartId}`);
                return res.status(StatusCodes.OK).json({ message: "Cart fetched successfully.", result: cart });
            } else {
                Log.warn(`Server::GET /carts/:cartId - Cart with ID ${cartId} not found.`);
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Shopping cart not found." });
            }
        } catch (error) {
            Log.error("Error fetching shopping cart:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch shopping cart." });
        }
    }

    addItemToCart = async (req, res) => {
        const { cartId } = req.params;
        const { productId, quantity, selectedAttribute, selectedPrice } = req.body;
        const cartsCollection = this.db.collection('shopping_carts');
        const productsCollection = this.db.collection('products');

        if (!cartId || !productId || !quantity || quantity <= 0) {
            Log.warn("CartService::addItemToCart - Missing/Invalid fields: cartId, productId, quantity.");
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Cart ID, Product ID, and a positive Quantity are required." });
        }

        try {
            const productDetails = await productsCollection.findOne({ id: productId });
            if (!productDetails) {
                Log.warn(`CartService::addItemToCart - Product with ID ${productId} not found.`);
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found." });
            }

            let itemPrice = parseFloat(productDetails.price);
            if (selectedPrice !== -1) {
                itemPrice = parseFloat(selectedPrice);
            }

            const existingCart = await cartsCollection.findOne({ shoppingCartId: cartId });

            if (!existingCart) {
                Log.warn(`CartService::addItemToCart - Shopping cart with ID ${cartId} not found.`);
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Shopping cart not found." });
            }

            const currentItems = existingCart.items || [];
            let itemFoundIndex = -1;

            // Check if item with same productId AND selectedAttribute already exists
            for (let i = 0; i < currentItems.length; i++) {
                if (currentItems[i].productId === productId) {
                    // Deep compare selectedAttribute if it exists
                    const currentAttr = currentItems[i].selectedAttribute || "";
                    const newAttr = selectedAttribute || "";

                    if (JSON.stringify(currentAttr) === JSON.stringify(newAttr)) {
                        itemFoundIndex = i;
                        break;
                    }
                }
            }

            const updatedItems = [...currentItems];
            if (itemFoundIndex > -1) {
                // Item exists, update its quantity
                updatedItems[itemFoundIndex].quantity += quantity;
                updatedItems[itemFoundIndex].price = itemPrice;
            } else {
                // Item does not exist, add new item
                updatedItems.push({
                    productId: productId,
                    title: productDetails.title,
                    imageUrl: `http://localhost:3001//${productDetails.imageUrl}`,
                    price: itemPrice,
                    quantity: quantity,
                    selectedAttribute: selectedAttribute
                });
            }

            const { totalQuantity, totalPrice } = this._calculateCartTotals(updatedItems);

            const updateResult = await cartsCollection.updateOne(
                { shoppingCartId: cartId },
                {
                    $set: {
                        items: updatedItems,
                        totalQuantity: totalQuantity,
                        totalPrice: totalPrice,
                    }
                }
            );

            if (updateResult.modifiedCount === 0 && updateResult.matchedCount === 0) {
                Log.warn(`CartService::addItemToCart - Cart ${cartId} not found or no modification occurred.`);
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Shopping cart not found or no change applied." });
            }

            // Fetch the updated cart to return the latest state to the frontend
            const updatedCart = await cartsCollection.findOne({ shoppingCartId: cartId });
            Log.info(`CartService::addItemToCart - Item ${productId} added/updated in cart ${cartId}.`);
            return res.status(StatusCodes.OK).json({ message: "Item added to cart successfully.", result: updatedCart });

        } catch (error) {
            Log.error(`CartService::addItemToCart - Error adding item to cart ${cartId}:`, error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to add item to shopping cart." });
        }
    }

    // Remove an item from an existing cart
    removeItemFromCart = async (req, res) => {
        let { cartId, productId } = req.params;
        const cartsCollection = this.db.collection('shopping_carts');
        productId = Number(productId);

        if (!cartId || !productId) {
            Log.warn("CartService::removeItemFromCart - Missing cartId or productId in URL parameters.");
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Cart ID and Product ID are required." });
        }

        try {
            const existingCart = await cartsCollection.findOne({ shoppingCartId: cartId });

            if (!existingCart) {
                Log.warn(`CartService::removeItemFromCart - Shopping cart with ID ${cartId} not found.`);
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Shopping cart not found." });
            }

            let currentItems = existingCart.items || [];
            const initialLength = currentItems.length;

            // Filter out the item to remove by productId
            const updatedItems = currentItems.filter(item => item.productId !== productId);

            if (updatedItems.length === initialLength) {
                Log.warn(`CartService::removeItemFromCart - Item with productId ${productId} not found in cart ${cartId}.`);
                return res.status(StatusCodes.OK).json({ message: "Item not found in cart, no changes applied.", result: existingCart });
            }

            const { totalQuantity, totalPrice } = this._calculateCartTotals(updatedItems);

            const updateResult = await cartsCollection.updateOne(
                { shoppingCartId: cartId },
                {
                    $set: {
                        items: updatedItems,
                        totalQuantity: totalQuantity,
                        totalPrice: totalPrice,
                    }
                }
            );

            // Fetch the updated cart to return the latest state to the frontend
            const updatedCart = await cartsCollection.findOne({ shoppingCartId: cartId });
            Log.info(`CartService::removeItemFromCart - Item ${productId} removed from cart ${cartId}.`);
            return res.status(StatusCodes.OK).json({ message: "Item removed from cart successfully.", result: updatedCart });

        } catch (error) {
            Log.error(`CartService::removeItemFromCart - Error removing item ${productId} from cart ${cartId}:`, error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to remove item from shopping cart." });
        }
    }

    // Clear all items from a cart
    clearCart = async (req, res) => {
        const { cartId } = req.params;
        const cartsCollection = this.db.collection('shopping_carts');

        if (!cartId) {
            Log.warn("CartService::clearCart - No cartId provided in URL parameters.");
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Cart ID is required." });
        }

        try {
            const existingCart = await cartsCollection.findOne({ shoppingCartId: cartId });

            if (!existingCart) {
                Log.warn(`CartService::clearCart - Shopping cart with ID ${cartId} not found.`);
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Shopping cart not found." });
            }

            // Set items to empty array and totals to zero
            const updateResult = await cartsCollection.updateOne(
                { shoppingCartId: cartId },
                {
                    $set: {
                        items: [],
                        totalQuantity: 0,
                        totalPrice: 0,
                    }
                }
            );

            if (updateResult.modifiedCount === 0 && updateResult.matchedCount === 0) {
                Log.warn(`CartService::clearCart - Cart ${cartId} not found or already empty.`);
                return res.status(StatusCodes.OK).json({ message: "Shopping cart not found or already empty.", result: existingCart });
            }

            Log.info(`CartService::clearCart - Cart ${cartId} cleared successfully.`);
            const clearedCart = await cartsCollection.findOne({ shoppingCartId: cartId });
            return res.status(StatusCodes.OK).json({ message: "Shopping cart cleared successfully.", result: clearedCart });

        } catch (error) {
            Log.error(`CartService::clearCart - Error clearing cart ${cartId}:`, error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to clear shopping cart." });
        }
    }

    getAllOrders = async (req, res) => {
        const ordersCollection = this.db.collection('orders');

        Log.info("OrderService::getAllOrders - Attempting to fetch all orders.");

        try {
            const allOrders = await ordersCollection.find({}).toArray();

            Log.info(`OrderService::getAllOrders - Sent ${allOrders.length} orders.`);
            return res.status(StatusCodes.OK).json({ result: allOrders });

        } catch (error) {
            Log.error("OrderService::getAllOrders - Error fetching all orders from MongoDB:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch all orders." });
        }
    }

    createOrder = async (req, res) => {
        const { shopperName, cartId, items, totalQuantity, totalPrice } = req.body;

        // Basic validation
        if (!shopperName || !cartId || !items || items.length === 0 || totalQuantity === undefined || totalPrice === undefined) {
            Log.warn("OrdersService::createOrder - Missing required fields for order creation.");
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Missing required order details (shopperName, cartId, items, totalQuantity, totalPrice)." });
        }

        try {
            const ordersCollection = this.db.collection('orders');
            const cartsCollection = this.db.collection('shopping_carts');

            const existingCart = await cartsCollection.findOne({ shoppingCartId: cartId });

            if (!existingCart) {
                Log.warn(`OrdersService::createOrder - Cart with ID ${cartId} not found during checkout attempt.`);
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Shopping cart not found." });
            }
            if (existingCart.items.length === 0) {
                Log.warn(`OrdersService::createOrder - Attempted checkout on an empty cart for cart ID ${cartId}.`);
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Cannot checkout an empty cart." });
            }

            // Generate a unique order number
            const orderNumber = uuidv4();

            const newOrder = {
                orderNumber: orderNumber,
                shopperName: shopperName,
                items: items,
                totalQuantity: totalQuantity,
                totalPrice: totalPrice,
                status: 'pending',
            };

            // Save the new order to the orders collection
            const insertResult = await ordersCollection.insertOne(newOrder);

            if (insertResult.acknowledged) {
                Log.info(`OrdersService::createOrder - Order ${orderNumber} created successfully for cart ${cartId}.`);

                // Clear the corresponding shopping cart
                const clearCartResult = await cartsCollection.updateOne(
                    { shoppingCartId: cartId },
                    {
                        $set: {
                            items: [],
                            totalQuantity: 0,
                            totalPrice: 0,
                        }
                    }
                );

                if (clearCartResult.acknowledged) {
                    Log.info(`OrdersService::createOrder - Shopping cart ${cartId} cleared after checkout.`);
                    return res.status(StatusCodes.CREATED).json({
                        message: "Order placed and cart cleared successfully.",
                        result: newOrder
                    });
                } else {
                    // Edge case: order created, but cart not cleared.
                    Log.error(`OrdersService::createOrder - Failed to clear cart ${cartId} after order ${orderNumber} was placed.`);
                    return res.status(StatusCodes.CREATED).json({
                        message: "Order placed, but cart could not be cleared. Please contact support.",
                        result: newOrder
                    });
                }

            } else {
                Log.error(`OrdersService::createOrder - Failed to insert order for cart ${cartId}.`);
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to place order." });
            }

        } catch (error) {
            Log.error("OrdersService::createOrder - Error placing order:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred while placing the order." });
        }
    };
}

export default CartsService;