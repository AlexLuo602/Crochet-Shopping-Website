import { useState, useEffect } from "react";
import "../css/Home.css";
import ItemCard from "../components/ItemCard";
import { MOCK_DATA_JSON_STRING } from "../assets/mock_data";
import ItemGrid from "../components/ItemGrid";

function Search() {
	const [items, setItems] = useState([]);
	const [searchText, setSearchText] = useState();
	const [searchResult, setSearchResult] = useState();

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

	const handleSearch = async (e) => {
		e.preventDefault();

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
			const title_lower = item.title.toLowerCase();
			const search_lower = searchText.toLowerCase();
			return title_lower.includes(search_lower);
		});

		setItems(filtered_items);
		setSearchResult(searchText);
		setSearchText("");
	};

	return (
		<div className="content">
			{!searchResult ? (
				<h1 className="title">Search for a Crochet!</h1>
			) : (
				<h1 className="title">
					{items.length} Search results for: {searchResult}
				</h1>
			)}
			<form onSubmit={handleSearch} className="search">
				<fieldset>
					<label>
						<input
							name="search"
							placeholder="search"
							autoComplete="given-crochet"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
						/>
					</label>
				</fieldset>
				<input type="submit" value="Search" />
			</form>
			<ItemGrid items={items} />
		</div>
	);
}

export default Search;
