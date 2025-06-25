import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../css/ShoppingCart.css";

const BASE_API_URL = import.meta.env.VITE_APP_API_URL;

// A separate component for displaying a single order
function SingleOrderDisplay({ order }) {
    const currentOrderNumber = order.orderNumber;

    return (
        <div className="single-cart-container">
            <h3>Order Number: {currentOrderNumber}</h3>
            <p><strong>Shopper Name:</strong> {order.shopperName || 'N/A'}</p>
            <p><strong>Total Quantity:</strong> {order.totalQuantity}</p>
            <p><strong>Total Price:</strong> ${parseFloat(order.totalPrice || 0).toFixed(2)}</p>

            {order.items && order.items.length > 0 ? (
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
                        {order.items.map((item, index) => (
                            <tr key={item.id || index}> 
                                <td>
                                    <div className="shopping-cart-product">
                                        <img
                                            className="shopping-cart-product-image"
                                            src={item.imageUrl || '/path/to/default-image.jpg'}
                                            alt={item.name || 'Product Image'}
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
                <p>This order contains no items.</p>
            )}
        </div>
    );
}


function AdminOrders() {
    const [allOrders, setAllOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [errorOrders, setErrorOrders] = useState(null);

    useEffect(() => {
        const fetchAllOrders = async () => {
            setLoadingOrders(true);
            setErrorOrders(null);
            try {
                const response = await axios.get(`${BASE_API_URL}/admin/orders`);
                setAllOrders(response.data.result);
            } catch (error) {
                console.error("Error fetching all orders:", error);
                setErrorOrders("Failed to fetch all orders.");
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchAllOrders();
    }, []);

    if (loadingOrders) {
        return <main className="container"><h1>All Orders</h1><p>Loading all orders...</p></main>;
    }

    if (errorOrders) {
        return <main className="container"><h1>All Orders</h1><p style={{ color: 'red' }}>Error: {errorOrders}</p></main>;
    }

    if (!allOrders || allOrders.length === 0) {
        return (
            <main className="container">
                <h1>All Orders</h1>
                <p>No orders found.</p>
                <Link to="/admin">Go to Admin Dashboard</Link>
            </main>
        );
    }

    return (
        <main className="container">
            <h1>All Orders</h1>
            {allOrders.map((order) => (
                <SingleOrderDisplay
                    key={order.orderNumber}
                    order={order}
                />
            ))}
        </main>
    );
}

export default AdminOrders;