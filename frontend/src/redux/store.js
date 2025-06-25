import { configureStore } from "@reduxjs/toolkit";
import itemReducer from "./itemSlice.js";
import cartReducer from "./cartSlice.js";
import wishlistReducer from "./wishlistSlice.js";
import bestSellersReducer from "./bestSellerSlice.js"

export const store = configureStore({
	reducer: {
		items: itemReducer,
		cart: cartReducer,
		wishlist: wishlistReducer,
		bestSellers: bestSellersReducer,
	},
});
