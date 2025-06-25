import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import ItemGrid from "../components/ItemGrid";
import { fetchItems } from "../redux/itemSlice";
import "../css/Home.css";
import { fetchBestSellingItems } from "../redux/bestSellerSlice";

function Home() {
	// for all items
	const dispatch = useDispatch();
	const items = useSelector((state) => state.items.items);
    const status = useSelector((state) => state.items.status);
    const error = useSelector((state) => state.items.error);

	const bestSellers = useSelector((state) => state.bestSellers.items);
    const bestSellerStatus = useSelector((state) => state.bestSellers.status);

	useEffect(() => {
		if (status === "idle") {
			dispatch(fetchItems());
		}
	}, [status, dispatch]);

	useEffect(() => {
		if (bestSellerStatus === "idle") {
			dispatch(fetchBestSellingItems());
		}
	}, [bestSellerStatus, dispatch]);

    if (status === "loading" || bestSellerStatus === "loading") {
        return (
            <div className="content">
                <h1 className="title">Ivy's Crochet World</h1>
                <p>Loading items...</p> 
            </div>
        );
    }

    if (status === "failed" || bestSellerStatus === "failed") {
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
			<h1 className="title">Best Sellers</h1>
			<ItemGrid items={bestSellers} />
			<h1 className="title">All Items</h1>
			<ItemGrid items={items} />
		</div>
	);
}

export default Home;
