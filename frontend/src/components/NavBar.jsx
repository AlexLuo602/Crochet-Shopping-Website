import { Link } from "react-router-dom";
import "../css/NavBar.css";

function Navbar() {
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
					<Link to="/shopping_cart">
						<div>Shopping Cart</div>
					</Link>
				</li>
				<li>
					<Link to="/wishlist">
						<div>Wishlist</div>
					</Link>
				</li>
			</ul>
		</nav>
	);
}

export default Navbar;
