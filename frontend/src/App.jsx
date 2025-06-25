import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import "@picocss/pico/css/pico.min.css";
import Search from "./pages/Search";
import ShoppingCart from "./pages/Shopping Cart";
import Wishlist from "./pages/Wishlist";
import ItemDetails from "./pages/ItemDetails";
import Admin from "./pages/Admin";
import AdminOrders from "./pages/AdminOrders";
import AdminShoppingCarts from "./pages/AdminShoppingCart";
import Category from "./pages/Category";
import CheckoutPage from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initializeShoppingCart } from "./redux/cartSlice";
import "./css/App.css";

function App() {
    const dispatch = useDispatch();
    const cartStatus = useSelector((state) => state.cart.status);

    useEffect(() => {
        if (cartStatus === 'idle') {
            dispatch(initializeShoppingCart());
        }
    }, [dispatch, cartStatus]);

	return (
		<div className="main-container">
			<NavBar />
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/search" element={<Search />} />
					<Route path="/shopping_cart" element={<ShoppingCart />} />
					<Route path="/wishlist" element={<Wishlist />} />
					<Route path="/categories" element={<Category />} />
					<Route path="/categories/:category" element={<Category />} />
					<Route path="/items/:id" element={<ItemDetails />} />
					<Route path="/admin" element={<Admin />} />
					<Route path="/admin/shopping_carts_list" element={<AdminShoppingCarts />} />
					<Route path="/admin/orders_list" element={<AdminOrders />} />
					<Route path="/checkout" element={<CheckoutPage />} />
					<Route path="/order-confirmation" element={<OrderConfirmation />} />
				</Routes>
			</main>
		</div>
	);
}

export default App;
