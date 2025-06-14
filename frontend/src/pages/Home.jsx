import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import ItemGrid from "../components/ItemGrid";
import { fetchItems } from "../redux/itemSlice";
import "../css/Home.css";

function Home() {
	const dispatch = useDispatch();
	const items = useSelector((state) => state.items.items);
    const status = useSelector((state) => state.items.status);
    const error = useSelector((state) => state.items.error);

	useEffect(() => {
		if (status === "idle") {
			dispatch(fetchItems());
		}
	}, [status, dispatch]);

    if (status === "loading") {
        return (
            <div className="content">
                <h1 className="title">Ivy's Crochet World</h1>
                <p>Loading items...</p> 
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="content">
                <h1 className="title">Ivy's Crochet World</h1>
                <p style={{ color: 'red' }}>Error loading items: {error}</p>
            </div>
        );
    }

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
