import { useState, useEffect } from "react";
import ItemGrid from "../components/ItemGrid";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
const BASE_API_URL = import.meta.env.VITE_APP_API_URL
import "../css/Home.css";

function Category() {
    const navigate = useNavigate();
	const [items, setItems] = useState([]);
	const { category } = useParams();

    useEffect(() => {
		const fetchCategoryItems = async(category_name) => {
			try {
				const response = await fetch(`${BASE_API_URL}/items/categories/${category_name}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

				const data = await response.json();
                setItems(data.result);
			} catch(err) {
				console.error("Error fetching category items:", err);
				return []
			}
		}

        if (!category) return;
        let category_name = category;
        category_name = category_name.replaceAll('-', ' ')
		fetchCategoryItems(category_name);
	}, [category]);

	const handleCategoryClick = async (category_name) => {
        category_name = category_name.replaceAll(' ', '-');
		navigate(`/categories/${category_name}`);
	};

	return (
		<div className="content">
			{!category ? (
				<h1 className="title">Select a Category</h1>
			) : (
				<h1 className="title">{category.replaceAll('-', ' ')}</h1>
			)}
			<div className="categories">
				<button
					className="outline contrast category"
					onClick={() => handleCategoryClick("Best Sellers")}
				>
					Best Sellers
				</button>
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

export default Category;
