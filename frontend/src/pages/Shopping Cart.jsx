import { useSelector, useDispatch } from "react-redux";
import { removeItemFromCart, clearCart } from "../redux/cartSlice";
import { Link } from "react-router-dom";
import "../css/ShoppingCart.css";

function ShoppingCart() {
	const dispatch = useDispatch();
	const cartItems = useSelector((state) => state.cart.items);
	const totalQuantity = useSelector((state) => state.cart.totalQuantity);
	const totalPrice = useSelector((state) => state.cart.totalPrice);

	const handleRemoveItem = (id) => {
		dispatch(removeItemFromCart(id));
	};

	const handleClearCart = () => {
		dispatch(clearCart());
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
								<th scope="col">Price</th>
								<th scope="col">Quantity</th>
								<th scope="col">Subtotal</th>
								<th scope="col">Actions</th>
							</tr>
						</thead>
						<tbody>
							{cartItems.map((item) => (
								<tr key={item.id}>
									<td>
										<div className="shopping-cart-product">
											<img
												className="shopping-cart-product-image"
												src={item.imageUrl}
											/>{" "}
											{item.name}
										</div>
									</td>
									<td>${parseFloat(item.price).toFixed(2)}</td>
									<td>{item.quantity}</td>
									<td>
										${(parseFloat(item.price) * item.quantity).toFixed(2)}
									</td>
									<td>
										<button onClick={() => handleRemoveItem(item.id)}>
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

					<div className="clear-cart">
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
