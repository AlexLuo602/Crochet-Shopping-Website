import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, emptyCart } from "../redux/cartSlice";
import { fetchItems } from "../redux/itemSlice";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../css/ShoppingCart.css";

function ShoppingCart() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const cartItems = useSelector((state) => state.cart.items);
    const status = useSelector((state) => state.items.status);
	const totalQuantity = useSelector((state) => state.cart.totalQuantity);
	const totalPrice = useSelector((state) => state.cart.totalPrice);
	const cartId = useSelector(state => state.cart.shoppingCartId);

	const handleRemoveItem = (productId) => {
		dispatch(removeFromCart({
			"cartId": cartId, 
			"productId": productId}));
	};

	useEffect(() => {
		if (status === "idle") {
			dispatch(fetchItems());
		}
	}, [status, dispatch]);

	const handleClearCart = () => {
		dispatch(emptyCart(cartId));
	};

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty. Please add items before checking out.");
            return;
        }
        navigate('/checkout');
    };

	return (
		<main className="container">
			<h1>Your Shopping Cart</h1>
			{cartItems.length === 0 ? (
				<p>
					Your cart is empty. <Link to="/">Continue Shopping</Link>
				</p>
			) : (
				<>
					<table>
						<thead>
							<tr>
								<th scope="col">Product</th>
								<th scope="col">Size</th>
								<th scope="col">Price</th>
								<th scope="col">Quantity</th>
								<th scope="col">Subtotal</th>
								<th scope="col">Actions</th>
							</tr>
						</thead>
						<tbody>
							{cartItems.map((item) => (
								<tr key={item.productId}>
									<td>
										<div className="shopping-cart-product">
											<img
												className="shopping-cart-product-image"
												src={item.imageUrl}
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
									<td>
										<button onClick={() => handleRemoveItem(item.productId)}>
											Remove
										</button>
									</td>
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr>
								<th scope="row" colSpan="3">
									Total Quantity:
								</th>
								<td>{totalQuantity}</td>
								<td></td>
							</tr>
							<tr>
								<th scope="row" colSpan="3">
									Total Price:
								</th>
								<td>${totalPrice.toFixed(2)}</td>
								<td></td>
							</tr>
						</tfoot>
					</table>
					
					<div className="shopping-cart-buttons">
							<button onClick={handleCheckout}>
								Check Out
							</button>
							<button onClick={handleClearCart} className="secondary">
								Clear Cart
							</button>
					</div>
				</>
			)}
		</main>
	);
}

export default ShoppingCart;
