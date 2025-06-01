import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addItemToCart } from "../redux/cartSlice";
import {
	addItemToWishlist,
	removeItemFromWishlist,
} from "../redux/wishlistSlice";
import "../css/ItemDetails.css";

function ItemDetails() {
	const { id } = useParams();
	const dispatch = useDispatch();
	const items = useSelector((state) => state.items.items);
	const wishlistIDs = useSelector((state) => state.wishlist.itemIDs);
	const [inWishlist, setInWishlist] = useState(false);
	const [item, setItem] = useState();
	const [quantity, setQuantity] = useState("1");

	useEffect(() => {
		try {
			const foundItem = items.find((item) => item.id === parseInt(id));

			if (foundItem) {
				setItem(foundItem);
				setInWishlist(wishlistIDs.includes(foundItem.id));
			} else {
				console.error(`Item with ID "${id}" not found.`);
			}
		} catch (e) {
			console.error(`Unexpected error thrown! ${e}`);
		}
	}, [id, wishlistIDs]);

	const handleCartSubmit = async () => {
		dispatch(
			addItemToCart({
				id: item.id,
				name: item.title,
				price: item.price,
				quantity: parseInt(quantity),
				imageUrl: item.imageUrl,
			})
		);
	};

	const handleAddWishlist = async () => {
		dispatch(
			addItemToWishlist({
				id: item.id,
				name: item.title,
				imageUrl: item.imageUrl,
			})
		);
	};

	const handleRemoveWishlist = async () => {
		dispatch(removeItemFromWishlist(id));
	};

	if (!item) return <></>;

	return (
		<main className="item-details-content">
			<img className="image-details" src={item.imageUrl} alt={Image.title} />
			<div className="item-details"></div>
			<article className="shopping-cart">
				<h1>{item.title}</h1>
				<h4 className="item-price">${item.price}</h4>
				<div className="item-description">{item.description}</div>
				<div>
					<form class-name="drop-down">
						<div className="select-quantity">
							<select
								className="drop-down-button"
								name="select"
								aria-label="Select"
								required
								value={quantity}
								onChange={(e) => setQuantity(e.target.value)}
							>
								<option value="1">
									&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;1
								</option>
								<option value="2">
									&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;2
								</option>
								<option value="3">
									&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;3
								</option>
								<option value="4">
									&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;4
								</option>
								<option value="5">
									&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;5
								</option>
							</select>
							<div className="quantity-overlay">Quantity: </div>
						</div>
						<input
							className="add-to"
							type="button"
							onClick={handleCartSubmit}
							value="Add to Cart"
						/>
					</form>
					{!inWishlist ? (
						<input
							className="add-to"
							type="button"
							onClick={handleAddWishlist}
							value="Add to Wishlist"
						/>
					) : (
						<input
							className="add-to"
							type="button"
							onClick={handleRemoveWishlist}
							value="Remove From Wishlist"
						/>
					)}
				</div>
			</article>
		</main>
	);
}

export default ItemDetails;
