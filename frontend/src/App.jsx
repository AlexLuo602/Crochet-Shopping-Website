import { useState } from "react";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import "@picocss/pico/css/pico.min.css";
import Search from "./pages/Search";
import ShoppingCart from "./pages/Shopping Cart";
import Wishlist from "./pages/Wishlist";
import Categories from "./pages/categories";
import ItemDetail from "./pages/ItemDetail";

function App() {
	return (
		<>
			<NavBar />
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/search" element={<Search />} />
					<Route path="/shopping_cart" element={<ShoppingCart />} />
					<Route path="/wishlist" element={<Wishlist />} />
					<Route path="/categories" element={<Categories />} />
					<Route path="/items/:id" element={<ItemDetail />} />
				</Routes>
			</main>
		</>
	);
}

export default App;
