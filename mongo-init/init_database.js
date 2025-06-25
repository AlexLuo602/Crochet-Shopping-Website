// See if running db script through local maching or through docker
// docker would have already defined db as a global variable
if (typeof db !== 'object' || db === null || typeof db.getName !== 'function') {
    print("[Init Script] Connecting db to 'mongodb://localhost:27017/455Assignment'.");
    try {
        db = connect('mongodb://localhost:27017/455Assignment');
        print("[Init Script] db connected successfully.");
    } catch (e) {
        print("[Init Script] Error during db connection: " + e);
        quit(1);
    }
} else {
    print("[Init Script] Using pre-existing 'db' object (connected to: " + db.getName() + ").");
}

// Insert data to specified collection only if it's actually empty.
function insertDataIfEmpty(collectionName, data) {
    const collection = db.getCollection(collectionName);
    const count = collection.countDocuments({});

    if (count === 0) {
        print(`[Init Script] Collection '${collectionName}' is empty. Inserting ${data.length} documents...`);
        try {
            const result = collection.insertMany(data);
            print(`[Init Script] Inserted ${result.insertedIds.length} documents into '${collectionName}'.`);
        } catch (e) {
            print(`[Init Script] Error inserting data into '${collectionName}': ${e}`);
        }
    } else {
        print(`[Init Script] Collection '${collectionName}' already contains ${count} documents. Skipping data insertion.`);
    }
}

// Data for products collection
const productsData = [
	{
		"id": 1,
		"title": "Cute Otter Amigurumi",
		"description": "An adorable handmade crochet otter plushie, perfect for gifting or collecting. Features a little blue heart.",
		"price": 28.50,
		"imageUrl": "/images/otter.png"
	},
	{
		"id": 2,
		"title": "Lily Cup Coaster Set",
		"description": "A beautiful set of crochet lily cup coasters in pastel shades, adding a touch of elegance to your home.",
		"price": 35.00,
		"imageUrl": "/images/lily_coasters.png"
	},
	{
		"id": 3,
		"title": "Crochet Puppy Keychain",
		"description": "A charming crochet puppy head keychain, meticulously crafted with expressive eyes. Great for dog lovers!",
		"price": 12.75,
		"imageUrl": "/images/puppy_keychain.png"
	},
	{
		"id": 4,
		"title": "Blue Whale Pouch",
		"description": "A cute crochet pouch shaped like a whale, with a drawstring closure and a little starfish detail. Ideal for small treasures.",
		"price": 22.00,
		"imageUrl": "/images/whale_pouch.png"
	},
	{
		"id": 5,
		"title": "Pink Lace Bow",
		"description": "A delicate handmade crochet bow in soft pink, perfect as a hair accessory or embellishment.",
		"price": 9.99,
		"imageUrl": "/images/pink_bow.png"
	},
	{
		"id": 6,
		"title": "Crochet Sylveon Plushie",
		"description": "A detailed crochet plushie of the beloved Sylveon character, featuring its signature ribbons.",
		"price": 45.00,
		"imageUrl": "/images/sylveon.png"
	},
	{
		"id": 7,
		"title": "Brown Bear Keychain",
		"description": "An adorable crochet bear head keychain with a sturdy metal ring, a perfect companion for your keys.",
		"price": 11.50,
		"imageUrl": "/images/bear_keychain.png"
	},
	{
		"id": 8,
		"title": "Potted Succulent Amigurumi",
		"description": "A charming crochet succulent in a small pot, a low-maintenance plant that adds greenery to any space.",
		"price": 18.00,
		"imageUrl": "/images/succulent.png"
	},
	{
		"id": 9,
		"title": "Squishy Pochacco Macaron",
		"description": "A delightful crochet macaron featuring the popular Sanrio character Pochacco, soft and squishy.",
		"price": 15.00,
		"imageUrl": "/images/pochacco_macaron.png"
	},
	{
		"id": 10,
		"title": "Cute Doggo Plushie",
		"description": "A small, lovable crochet dog plushie, perfect for cuddling or as a desk companion. Features floppy ears.",
		"price": 20.00,
		"imageUrl": "/images/doggo_plushie.png"
	}
];

print("[Init Script] Inserting products data...");
insertDataIfEmpty('products', productsData);

// Data for categories collection
const categoriesData = [
    { "id": 1, "name": "Amigurumi" },
    { "id": 2, "name": "Home Decor" },
    { "id": 3, "name": "Keychains" },
    { "id": 4, "name": "Bags & Pouches" },
    { "id": 5, "name": "Accessories" },
    { "id": 6, "name": "Best Sellers" }
];

print("[Init Script] Inserting categories data...");
insertDataIfEmpty('categories', categoriesData);

// Data for category_products collection
// Links products to categories.
const categoryProductsData = [
    // Product 6 (Sylveon) - Amigurumi, Best Sellers
    { "productId": 6, "categoryId": 1 },
    { "productId": 6, "categoryId": 6 },

    // Product 2 (Coaster) - Home Decor, Best Sellers
    { "productId": 2, "categoryId": 2 },
    { "productId": 2, "categoryId": 6 },

    // Product 3 (Puppy Keychain) - Keychains, Best Sellers
    { "productId": 3, "categoryId": 3 },
    { "productId": 3, "categoryId": 6 },

    // Product 4 (Whale Pouch) - Bags & Pouches, Best Sellers
    { "productId": 4, "categoryId": 4 },
    { "productId": 4, "categoryId": 6 },

    // Product 5 (Pink Bow) - Accessories, Best Sellers
    { "productId": 5, "categoryId": 5 },
    { "productId": 5, "categoryId": 6 },

    // Product 1 (Otter) - Amigurumi
    { "productId": 1, "categoryId": 1 },

    // Product 7 (Brown Bear Keychain) - Keychains
    { "productId": 7, "categoryId": 3 },

    // Product 8 (Potted Succulent Amigurumi) - Home Decor
    { "productId": 8, "categoryId": 2 },

    // Product 9 (Squishy Pochacco Macaron) - Amigurumi
    { "productId": 9, "categoryId": 1 },

    // Product 10 (Doggo) - Amigurumi, Best Sellers
    { "productId": 10, "categoryId": 1 },
    { "productId": 10, "categoryId": 6 },
];

print("[Init Script] Inserting category_products data...");
insertDataIfEmpty('category_products', categoryProductsData);

// Data for product_attributes collection
// Contains products that have different attributes, and their attribute values
const productAttributesData = [
    // Product ID 1 (Cute Otter Amigurumi) variants
    {
        "attributeId": 1,
        "productId": 1,
        "attributeName": "Size",
        "attributeValue": "Small"
    },
    {
        "attributeId": 2,
        "productId": 1,
        "attributeName": "Size",
        "attributeValue": "Medium"
    },
    {
        "attributeId": 3,
        "productId": 1,
        "attributeName": "Size",
        "attributeValue": "Large"
    },
    // Product ID 6 (Crochet Sylveon Plushie) variants
    {
        "attributeId": 4,
        "productId": 6,
        "attributeName": "Size",
        "attributeValue": "Small"
    },
    {
        "attributeId": 5,
        "productId": 6,
        "attributeName": "Size",
        "attributeValue": "Medium"
    },
    {
        "attributeId": 6,
        "productId": 6,
        "attributeName": "Size",
        "attributeValue": "Large"
    }
];

print("[Init Script] Inserting product_attributes data...");
insertDataIfEmpty('product_attributes', productAttributesData);

// Data for product_attribute_prices collection
const productAttributePricesData = [
    // Prices for Product ID 1 (Cute Otter Amigurumi) sizes
    {
        "attributeId": 1,
        "price": 28.50 // Same as base price
    },
    {
        "attributeId": 2,
        "price": 32.50 // Medium size, slightly higher price
    },
    {
        "attributeId": 3,
        "price": 36.50 // Large size, higher price
    },

    // Prices for Product ID 6 (Crochet Sylveon Plushie) sizes
    {
        "attributeId": 4,
        "price": 45.00 // Same as base price
    },
    {
        "attributeId": 5,
        "price": 50.00 // Medium size, slightly higher price
    },
    {
        "attributeId": 6,
        "price": 55.00 // Large size, higher price
    }
];

print("[Init Script] Inserting product_attribute_prices data...");
insertDataIfEmpty('product_attribute_prices', productAttributePricesData);

// Data for shopping_carts collection
// Contains one sample shopping cart
const shoppingCartsData = [
    {
        shoppingCartId: "1902938",
        items: [
            {
                "id": 1,
                "name": "Cute Otter Amigurumi",
                "price": 28.50,
                "quantity": 1,
                "imageUrl": "http://localhost:3001//images/otter.png",
                "selectedAttribute": "Small",
            },
            {
                "id": 4,
                "name": "Blue Whale Pouch",
                "price": 22.00,
                "quantity": 2,
                "imageUrl": "http://localhost:3001//images/whale_pouch.png",
                "selectedAttribute": ""
            }
        ],
        totalQuantity: 3,
        totalPrice: 72.5,
    }
];

print("[Init Script] Inserting shopping_carts data...");
insertDataIfEmpty('shopping_carts', shoppingCartsData);

// Data for orders collection
// Contains one sample order
const ordersData = [
    {
        orderNumber: "1899023",
        shopperName: "Joe",
        items: [
            {
                "id": 1,
                "name": "Cute Otter Amigurumi",
                "price": 28.50,
                "quantity": 1,
                "imageUrl": "http://localhost:3001//images/otter.png",
                "selectedAttribute": "Small",
            },
            {
                "id": 4,
                "name": "Blue Whale Pouch",
                "price": 22.00,
                "quantity": 2,
                "imageUrl": "http://localhost:3001//images/whale_pouch.png",
                "selectedAttribute": null
            }
        ],
        totalQuantity: 3,
        totalPrice: 72.5,
    }
];

print("[Init Script] Inserting orders data...");
insertDataIfEmpty('orders', ordersData);