import { useLocation, Link } from 'react-router-dom';

function OrderConfirmation() {
    const location = useLocation();
    const { order } = location.state || {};

    if (!order) {
        return (
            <main className="container">
                <h1>Order Confirmation</h1>
                <p>No order details found. This page might have been accessed directly or due to a refresh.</p>
                <Link to="/">Continue Shopping</Link>
            </main>
        );
    }

    return (
        <main className="container">
            <h1>Order Placed Successfully!</h1>
            <p>Thank you for your purchase, {order.shopperName}!</p>
            <p>Your Order Number is: {order.orderNumber}</p>

            <p>You will receive an email confirmation shortly.</p>
            <Link to="/">Continue Shopping</Link>
        </main>
    );
}

export default OrderConfirmation;