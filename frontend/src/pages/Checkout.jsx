import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { emptyCart } from '../redux/cartSlice';
import "../css/ShoppingCart.css";

const BASE_API_URL = import.meta.env.VITE_APP_API_URL;

function CheckoutPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const cartItems = useSelector((state) => state.cart.items);
    const totalQuantity = useSelector((state) => state.cart.totalQuantity);
    const totalPrice = useSelector((state) => state.cart.totalPrice);
    const cartId = useSelector((state) => state.cart.shoppingCartId);

    const [shopperName, setShopperName] = useState("");
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);

    const handleConfirmOrder = async (e) => {
        e.preventDefault();

        if (isProcessingOrder) return;

        if (!shopperName.trim()) {
            alert("Please enter your name to confirm the order.");
            return;
        }

        if (!cartId) {
            alert("Shopping cart ID not found. Cannot complete order.");
            return;
        }

        setIsProcessingOrder(true);

        try {
            const orderData = {
                shopperName: shopperName.trim(),
                cartId: cartId,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl,
                    selectedAttribute: item.selectedAttribute
                })),
                totalQuantity: totalQuantity,
                totalPrice: totalPrice
            };

            const response = await axios.post(`${BASE_API_URL}/orders`, orderData);

            if (response.status === 201) {
                alert("Order placed successfully!");
                dispatch(emptyCart(cartId));
                setShopperName("");

                navigate('/order-confirmation', { state: { order: response.data.result } });
            } else {
                alert(`Order failed: ${response.data.message || "An unknown error occurred."}`);
            }
        } catch (error) {
            console.error("Order confirmation error:", error);
            const errorMessage = error.response?.data?.message || "An unexpected error occurred while placing the order.";
            alert(`Order failed: ${errorMessage}`);
        } finally {
            setIsProcessingOrder(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <main className="container">
                <h1>Checkout</h1>
                <p>Your cart is empty. <Link to="/">Continue Shopping</Link></p>
            </main>
        );
    }

    return (
        <main className="container">
            <h1>Checkout</h1>

            <h2>Order Details</h2>
            <table>
                <thead>
                    <tr>
                        <th scope="col">Product</th>
                        <th scope="col">Size</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map((item) => (
                        <tr key={item.productId}>
                            <td>
                                <div>
                                    <img
                                        className="shopping-cart-product-image"
                                        src={item.imageUrl}
                                        alt={item.name}
                                    />
                                    {item.name}
                                </div>
                            </td>
                            <td>{item.selectedAttribute || "N/A"}</td>
                            <td>${parseFloat(item.price).toFixed(2)}</td>
                            <td>{item.quantity}</td>
                            <td>
                                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <th scope="row" colSpan="3">Total Quantity:</th>
                        <td>{totalQuantity}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <th scope="row" colSpan="3">Total Price:</th>
                        <td>${totalPrice.toFixed(2)}</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>

            <hr />

            <h2>Confirm Your Order</h2>
            <form onSubmit={handleConfirmOrder}>
                <div>
                    <label htmlFor="shopperName">Your Name:</label>
                    <input
                        type="text"
                        id="shopperName"
                        value={shopperName}
                        onChange={(e) => setShopperName(e.target.value)}
                        placeholder="Enter your name"
                        required
                        disabled={isProcessingOrder}
                    />
                </div>
                <button type="submit" disabled={isProcessingOrder || cartItems.length === 0}>
                    {isProcessingOrder ? 'Processing Order...' : 'Confirm Order'}
                </button>
            </form>
            <br />
            <Link to="/cart">Back to Cart</Link>
        </main>
    );
}

export default CheckoutPage;