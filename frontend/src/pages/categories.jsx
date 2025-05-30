import { useState, useEffect } from "react";
import ItemGrid from "../components/ItemGrid";
import { MOCK_DATA_JSON_STRING } from "../assets/mock_data";
import "../css/Home.css";

function Categories() {
	const [items, setItems] = useState([]);
	const [category, setCategory] = useState();

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

	const handleCategoryClick = async (category_name) => {
		setCategory(category_name);

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
		const filtered_items = itemInstances.filter((item) => {
			return item.category === category_name;
		});

		setItems(filtered_items);
	};

	return (
		<div className="content">
			{!category ? (
				<h1 className="title">Select a Category</h1>
			) : (
				<h1 className="title">Selected Category: {category}</h1>
			)}
			<div className="categories">
				<button
					className="outline contrast category"
					onClick={() => handleCategoryClick("Amigurumi")}
				>
					Amigurumi
				</button>
				<button
					className="outline contrast category"
					onClick={() => handleCategoryClick("Home Decor")}
				>
					Home Decor
				</button>
				<button
					className="outline contrast category"
					onClick={() => handleCategoryClick("Keychains")}
				>
					Keychains
				</button>
				<button
					className="outline contrast category"
					onClick={() => handleCategoryClick("Bags & Pouches")}
				>
					Bags & Pouches
				</button>
				<button
					className="outline contrast category"
					onClick={() => handleCategoryClick("Accessories")}
				>
					Accessories
				</button>
			</div>
			<ItemGrid items={items} />
		</div>
	);
}

export default Categories;
