import { useSelector, useDispatch } from "react-redux";
import { removeItemFromWishlist, clearWishlist } from "../redux/wishlistSlice";
import { Link } from "react-router-dom";
import "../css/ShoppingCart.css";

function WishList() {
	const dispatch = useDispatch();
	const wishlistItems = useSelector((state) => state.wishlist.items);

	const handleRemoveItem = (id) => {
		dispatch(removeItemFromWishlist(id));
	};

	const handleClearWishlist = () => {
		dispatch(clearWishlist());
	};

	return (
		<main className="container">
			<h1>Your Wishlist</h1>
			{wishlistItems.length === 0 ? (
				<p>
					Your wishlist is empty. <Link to="/">Continue Shopping</Link>
				</p>
			) : (
				<>
					<table>
						<thead>
							<tr>
								<th scope="col">Product</th>
								<th scope="col">Actions</th>
							</tr>
						</thead>
						<tbody>
							{wishlistItems.map((item) => (
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
									<td>
										<button onClick={() => handleRemoveItem(item.id)}>
											Remove
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					<div className="clear-cart">
						<button onClick={handleClearWishlist} className="secondary">
							Clear Wishlist
						</button>
					</div>
				</>
			)}
		</main>
	);
}

export default WishList;
