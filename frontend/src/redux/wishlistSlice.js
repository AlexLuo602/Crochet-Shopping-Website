import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	items: [],
	itemIDs: [],
};

const wishlistSlice = createSlice({
	name: "wishlit",
	initialState,
	reducers: {
		addItemToWishlist: (state, action) => {
			const { id, name, imageUrl } = action.payload;

			const existingItem = state.items.find((item) => item.id === id);

			if (!existingItem) {
				state.items.push({ id, name, imageUrl });
				state.itemIDs.push(id);
			}
		},
		removeItemFromWishlist: (state, action) => {
			const idToRemove = parseInt(action.payload);
			const itemToRemove = state.items.find((item) => item.id === idToRemove);
			if (itemToRemove) {
				state.items = state.items.filter((item) => item.id !== idToRemove);
				state.itemIDs = state.itemIDs.filter((id) => id !== idToRemove);
			}
		},
		clearWishlist: () => {
			return initialState;
		},
	},
});

export const { addItemToWishlist, removeItemFromWishlist, clearWishlist } =
	wishlistSlice.actions;

export default wishlistSlice.reducer;
