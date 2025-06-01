import { useState, useEffect } from "react";
import ItemGrid from "../components/ItemGrid";
import { useSelector } from "react-redux";
import "../css/Home.css";

function Categories() {
	const allItems = useSelector((state) => state.items.items);
	const [items, setItems] = useState([]);
	const [status, setStatus] = useState("initial");
	const [category, setCategory] = useState();

	useEffect(() => {
		if (status === "initial") {
			setItems(allItems);
			setStatus("loaded");
		}
	}, [status]);

	const handleCategoryClick = async (category_name) => {
		const filtered_items = allItems.filter((item) => {
			return item.category === category_name;
		});

		setItems(filtered_items);
		setCategory(category_name);
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
