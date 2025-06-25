import { useState } from "react";
const BASE_API_URL = import.meta.env.VITE_APP_API_URL
import ItemGrid from "../components/ItemGrid";
import "../css/Home.css";

function Search() {
	const [items, setItems] = useState([]);
	const [searchText, setSearchText] = useState("");
	const [searchResult, setSearchResult] = useState("");
	const [searchStatus, setSearchStatus] = useState("fulfilled");

	const handleSearch = async (e) => {
		e.preventDefault();

		if (searchText.trim() === "") {
			setItems([])
			setSearchStatus("failed");
			setSearchResult("");
			return;
		}

		try {
			const response = await fetch(`${BASE_API_URL}/items/search?q=${searchText}`);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			setItems(data.result);
		} catch(err) {
			console.error("Error fetching search items:", err);
			return []
		}

		setSearchResult(searchText);
		setSearchText("");
		setSearchStatus("fulfilled");
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
			{searchStatus === "failed" ? (
				<div>No products found</div>
			) : (
				<ItemGrid items={items} />
			)}
		</div>
	);
}

export default Search;
