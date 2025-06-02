import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "../css/Home.css";
import ItemGrid from "../components/ItemGrid";

function Home() {
	const allItems = useSelector((state) => state.items.items);
	const [items, setItems] = useState([]);
	const [status, setStatus] = useState("initial");

	useEffect(() => {
		if (status === "initial") {
			setItems(allItems);
			setStatus("loaded");
		}
	}, [status]);

	return (
		<div className="content">
			<h1 className="title">Ivy's Crochet World</h1>
			<div className="sub-links">
				<Link to="/categories">
					<h3>Categories</h3>
				</Link>
				<Link to="/search">
					<h3>Search</h3>
				</Link>
				<Link to="/shopping_cart">
					<h3>Shopping Cart</h3>
				</Link>
			</div>
			<ItemGrid items={items} />
		</div>
	);
}

export default Home;
