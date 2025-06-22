import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"
const BASE_API_URL = import.meta.env.VITE_APP_API_URL

export const fetchItems = createAsyncThunk(
    'items/fetchItems',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_API_URL}/items`);

            const data = response.data;

            const itemsJson = data.result || [];

            return itemsJson.map((itemJson) => {
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
            console.error("Error fetching data with Axios:", error);
			
			// details in error.response for HTTP errors, error.request for network errors, error.message for other errors
            if (axios.isAxiosError(error) && error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                return rejectWithValue(error.response.data.error || `Request failed with status ${error.response.status}`);
            } else if (axios.isAxiosError(error) && error.request) {
                console.error("No response received:", error.request);
                return rejectWithValue('Network error: No response from server.');
            } else {
                console.error('Error message:', error.message);
                return rejectWithValue(error.message || 'An unknown error occurred.');
            }
        }
    }
);

const initialState = {
    items: [],
    status: 'idle',
    error: null,
};

const itemSlice = createSlice({
    name: "items",
    initialState,
    reducers: {
        // add synchronus reducers here
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchItems.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchItems.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchItems.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default itemSlice.reducer;
