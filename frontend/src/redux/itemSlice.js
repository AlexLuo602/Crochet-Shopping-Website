import { createSlice } from "@reduxjs/toolkit";
import { MOCK_DATA_JSON_STRING } from "../assets/mock_data";

const parseItems = (() => {
	try {
		const parsedData = JSON.parse(MOCK_DATA_JSON_STRING);
		return parsedData.map((itemJson) => {
			return {
				id: itemJson.id,
				title: itemJson.title,
				category: itemJson.category,
				description: itemJson.description,
				price: parseFloat(itemJson.price).toFixed(2),
				imageUrl: itemJson.imageUrl,
			};
		});
	} catch (error) {
		console.error("Error parsing mock data from json string:", error);
		return [];
	}
})();

const initialState = {
	items: parseItems,
};

const itemSlice = createSlice({
	name: "items",
	initialState,
	reducers: {
		// no reducers needed since list of items is constant and no unnecessary logic for calling apis
	},
});

export default itemSlice.reducer;
