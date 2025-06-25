import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_APP_API_URL;

const handleThunkError = (error, rejectWithValue) => {
    console.error("Thunk error:", error);
    if (axios.isAxiosError(error) && error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        return rejectWithValue(error.response.data.error || error.response.data.message || `Request failed with status ${error.response.status}`);
    } else if (axios.isAxiosError(error) && error.request) {
        console.error("No response received:", error.request);
        return rejectWithValue('Network error: No response from server.');
    } else {
        console.error('Error message:', error.message);
        return rejectWithValue(error.message || 'An unknown error occurred.');
    }
};

export const initializeShoppingCart = createAsyncThunk(
    'cart/initializeShoppingCart',
    async (_, { rejectWithValue }) => {
        let cartId = localStorage.getItem('shoppingCartId');
        let cartData = { items: [] };

        try {
            if (!cartId) {
                cartId = uuidv4();
                localStorage.setItem('shoppingCartId', cartId);

                const createResponse = await axios.post(`${BASE_API_URL}/carts`, { cartId });

                if (createResponse.status !== 200 && createResponse.status !== 201) {
                    throw new Error(createResponse.data.message || `HTTP error! status: ${createResponse.status}`);
                }
                console.log('Backend confirmed new cart creation:', createResponse.data);
            } else {
                try {
                    const fetchResponse = await axios.get(`${BASE_API_URL}/carts/${cartId}`);
                    cartData = fetchResponse.data.result;
                    console.log('Fetched existing cart from backend:', cartData);
                } catch (fetchError) {
                    if (axios.isAxiosError(fetchError) && fetchError.response && fetchError.response.status === 404) {
                        console.warn(`Cart ID ${cartId} not found on backend. Generating new ID and creating new cart.`);

                        localStorage.removeItem('shoppingCartId');
                        cartId = uuidv4();
                        localStorage.setItem('shoppingCartId', cartId);

                        const createResponse = await axios.post(`${BASE_API_URL}/carts`, { cartId });
                        if (createResponse.status !== 200 && createResponse.status !== 201) {
                            throw new Error(createResponse.data.message || `HTTP error! status: ${createResponse.status}`);
                        }
                        console.log('Backend confirmed new cart creation after old ID not found:', createResponse.data);
                        cartData = { items: [] };

                    } else {
                        throw fetchError;
                    }
                }
            }

            return { cartId, cartData };

        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    },
    {
        condition: (_, { getState }) => {
            const { cart } = getState();
            if (cart.status === 'loading' || cart.status === 'succeeded') {
                return false;
            }
            return true;
        },
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ cartId, productId, quantity, selectedAttribute, selectedPrice }, { rejectWithValue }) => {
        try {
            let jsonBody = {
                productId: productId,
                quantity: quantity, 
                selectedAttribute: selectedAttribute,
                selectedPrice: selectedPrice
            }
            const response = await axios.post(`${BASE_API_URL}/carts/${cartId}/items`, jsonBody);
            return response.data.result;
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async ({ cartId, productId }, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${BASE_API_URL}/carts/${cartId}/items/${productId}`);
            return response.data.result;
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);

export const emptyCart = createAsyncThunk(
    'cart/emptyCart',
    async (cartId, { rejectWithValue }) => {
        try {
            await axios.delete(`${BASE_API_URL}/carts/${cartId}/clear`);
            return null;
        } catch (error) {
            return handleThunkError(error, rejectWithValue);
        }
    }
);


const initialState = {
	items: [],
	totalQuantity: 0,
	totalPrice: 0,
	shoppingCartId: null,
	status: 'idle',
	error: null,
};

const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
	},
    extraReducers: (builder) => {
        builder
            .addCase(initializeShoppingCart.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(initializeShoppingCart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.shoppingCartId = action.payload.cartId;
                state.items = action.payload.cartData.items || [];
                state.totalQuantity = action.payload.cartData.totalQuantity || 0;
                state.totalPrice = action.payload.cartData.totalPrice || 0;
                state.error = null;
            })
            .addCase(initializeShoppingCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
                state.shoppingCartId = null;
                state.items = [];
                state.totalQuantity = 0;
                state.totalPrice = 0;
            })
            // add to cart cases
            .addCase(addToCart.pending, (state) => {
                state.status = 'addingItem';
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updatedCart = action.payload;
                state.items = updatedCart.items;
                state.totalQuantity = updatedCart.totalQuantity;
                state.totalPrice = updatedCart.totalPrice;
                state.error = null;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // remove from cart cases
            .addCase(removeFromCart.pending, (state) => {
                state.status = 'removingItem';
                state.error = null;
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updatedCart = action.payload;
                state.items = updatedCart.items;
                state.totalQuantity = updatedCart.totalQuantity
                state.totalPrice = updatedCart.totalPrice;
                state.error = null;
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // clear cart cases
            .addCase(emptyCart.pending, (state) => {
                state.status = 'clearingCart';
                state.error = null;
            })
            .addCase(emptyCart.fulfilled, (state) => {
                state.status = 'succeeded';
                state.items = [];
                state.totalQuantity = 0;
                state.totalPrice = 0;
                state.error = null;
            })
            .addCase(emptyCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});

export const { addItemToCart, removeItemFromCart, clearCart } =
	cartSlice.actions;

export default cartSlice.reducer;
