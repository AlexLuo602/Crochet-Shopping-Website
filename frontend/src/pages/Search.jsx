import { useState, useEffect } from "react";
import "../css/Home.css";
import { useSelector } from "react-redux";
import ItemGrid from "../components/ItemGrid";

function Search() {
	const allItems = useSelector((state) => state.items.items);
	const [items, setItems] = useState([]);
	const [searchText, setSearchText] = useState("");
	const [searchResult, setSearchResult] = useState("");
	const [status, setStatus] = useState("initial");

	useEffect(() => {
		if (status === "initial") {
			setItems(allItems);
			setStatus("loaded");
		}
	}, [status]);

	const handleSearch = async (e) => {
		e.preventDefault();

		const filtered_items = allItems.filter((item) => {
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
