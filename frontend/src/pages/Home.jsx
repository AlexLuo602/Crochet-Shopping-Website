import { useState, useEffect } from "react";
import ItemCard from "../components/ItemCard";
import { MOCK_DATA_JSON_STRING } from "../assets/mock_data";
import { Link } from "react-router-dom";
import "../css/Home.css";
import ItemGrid from "../components/ItemGrid";

function Home() {
	const [items, setItems] = useState([]);

	useEffect(() => {
		try {
			const parsedData = JSON.parse(MOCK_DATA_JSON_STRING);
			const itemInstances = parsedData.map((itemJson) => {
				return {
					id: itemJson.id,
					title: itemJson.title,
					category: itemJson.category,
					description: itemJson.description,
					price: parseInt(itemJson.price).toFixed(2),
					imageUrl: itemJson.imageUrl,
				};
			});
			setItems(itemInstances);
		} catch (error) {
			console.error("Failed to parse item data:", error);
		}
	}, []);

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
			</div>
			<ItemGrid items={items} />
		</div>
	);
}

export default Home;
