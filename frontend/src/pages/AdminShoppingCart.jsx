import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../css/ShoppingCart.css";

const BASE_API_URL = import.meta.env.VITE_APP_API_URL;

// A separate component for displaying a single cart,
function SingleCartDisplay({ cart}) {
    const currentCartId = cart.shoppingCartId;

    return (
        <div className="single-cart-container">
            <h3>Cart ID: {currentCartId}</h3>
            {cart.items && cart.items.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Product</th>
                            <th scope="col">Attribute</th>
                            <th scope="col">Price</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.items.map((item) => (
                            <tr>
                                <td>
                                    <div className="shopping-cart-product">
                                        <img
                                            className="shopping-cart-product-image"
                                            src={item.imageUrl}
                                            alt={item.name}
                                        />
                                        {item.name || item.title}
                                    </div>
                                </td>
                                <td>
                                    {item.selectedAttribute || "N/A"}
                                </td>
                                <td>${parseFloat(item.price || 0).toFixed(2)}</td>
                                <td>{item.quantity}</td>
                                <td>
                                    ${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>This cart is currently empty.</p>
            )}
            <p><strong>Total Quantity:</strong> {cart.totalQuantity}</p>
            <p><strong>Total Price:</strong> ${parseFloat(cart.totalPrice || 0).toFixed(2)}</p>
        </div>
    );
}


function AdminShoppingCart() {
    const dispatch = useDispatch();
    const [allCarts, setAllCarts] = useState([]);
    const [loadingCarts, setLoadingCarts] = useState(true);
    const [errorCarts, setErrorCarts] = useState(null);


    useEffect(() => {
        const fetchAllCarts = async () => {
            setLoadingCarts(true);
            setErrorCarts(null);
            try {
                const response = await axios.get(`${BASE_API_URL}/admin/carts`);
                setAllCarts(response.data.result);
            } catch (error) {
                console.error("Error fetching all carts:", error);
                setErrorCarts("Failed to fetch all shopping carts.");
            } finally {
                setLoadingCarts(false);
            }
        };

        fetchAllCarts();
    }, [dispatch]);

    if (loadingCarts) {
        return <main className="container"><h1>All Shopping Carts</h1><p>Loading all carts...</p></main>;
    }

    if (errorCarts) {
        return <main className="container"><h1>All Shopping Carts</h1><p style={{ color: 'red' }}>Error: {errorCarts}</p></main>;
    }

    if (!allCarts || allCarts.length === 0) {
        return (
            <main className="container">
                <h1>All Shopping Carts</h1>
                <p>No shopping carts found.</p>
                <Link to="/">Continue Shopping</Link>
            </main>
        );
    }

    return (
        <main className="container">
            <h1>All Shopping Carts</h1>
            {allCarts.map((cart) => (
                <SingleCartDisplay
                    key={cart.shoppingCartId}
                    cart={cart}
                />
            ))}
        </main>
    );
}

export default AdminShoppingCart;