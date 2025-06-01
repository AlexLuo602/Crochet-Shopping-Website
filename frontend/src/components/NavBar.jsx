import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "../css/NavBar.css";

function Navbar() {
	const totalQuantity = useSelector((state) => state.cart.totalQuantity);

	return (
		<nav className="navbar">
			<ul>
				<li>
					<Link to="/">
						<div>Home</div>
					</Link>
				</li>
			</ul>
			<ul>
				<li>
					<Link to="/wishlist">
						<div>Wishlist</div>
					</Link>
				</li>
				<li>|</li>
				<li>
					<Link to="/shopping_cart">
						{totalQuantity == 0 ? (
							<img className="navbar-cart-icon" src="/cart.png" />
						) : (
							<div className="navbar-cart-icon-with-items">
								<img className="navbar-cart-icon" src="/cart.png" />
								<div className="navbar-shopping-cart-quantity">
									{totalQuantity}
								</div>
							</div>
						)}
					</Link>
				</li>
			</ul>
		</nav>
	);
}

export default Navbar;
