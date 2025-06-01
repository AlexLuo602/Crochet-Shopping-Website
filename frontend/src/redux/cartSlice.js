import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	items: [],
	totalQuantity: 0,
	totalPrice: 0,
};

const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		addItemToCart: (state, action) => {
			const { id, name, price, quantity, imageUrl } = action.payload;

			const existingItem = state.items.find((item) => item.id === id);

			if (existingItem) {
				existingItem.quantity += quantity;
			} else {
				state.items.push({ id, name, price, quantity, imageUrl });
			}
			state.totalQuantity += quantity;
			state.totalPrice += parseFloat(price * quantity);
		},
		removeItemFromCart: (state, action) => {
			const idToRemove = action.payload;
			const itemToRemove = state.items.find((item) => item.id === idToRemove);
			if (itemToRemove) {
				state.totalQuantity -= itemToRemove.quantity;
				state.totalPrice -= parseFloat(
					itemToRemove.price * itemToRemove.quantity
				);
				state.items = state.items.filter((item) => item.id !== idToRemove);
			}
		},
		clearCart: () => {
			return initialState;
		},
	},
});

export const { addItemToCart, removeItemFromCart, clearCart } =
	cartSlice.actions;

export default cartSlice.reducer;
