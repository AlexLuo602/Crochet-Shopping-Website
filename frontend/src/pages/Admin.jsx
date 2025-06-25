import { Link } from "react-router-dom";
import "../css/Admin.css";

function Admin() {
	return (
		<main className="container">
			<h1>Admin Page</h1>
            <div className="admin-links">
                <Link to="/admin/shopping_carts_list">Shopping Carts List</Link>
                <Link to="/admin/orders_list">Orders List</Link>
                <Link to="/admin/edit-items">Edit Items</Link>
            </div>
		</main>
	);
}

export default Admin;
