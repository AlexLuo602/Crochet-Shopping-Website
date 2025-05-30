import { Link } from "react-router-dom";
import "../css/NavBar.css";

function Navbar() {
	return (
		<nav className="navbar">
			<ul>
				<li>
					<Link to="/">Home</Link>
				</li>
			</ul>
			<ul>
				<li>
					<Link to="/shopping_cart">Shopping Cart</Link>
				</li>
				<li>
					<Link to="/wishlist">Wishlist</Link>
				</li>
			</ul>
		</nav>
	);
}

export default Navbar;
