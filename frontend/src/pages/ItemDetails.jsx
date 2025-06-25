import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from '../redux/cartSlice';
import {
	addItemToWishlist,
	removeItemFromWishlist,
} from "../redux/wishlistSlice";
import { fetchItems } from "../redux/itemSlice";
const BASE_API_URL = import.meta.env.VITE_APP_API_URL
import "../css/ItemDetails.css";

function ItemDetails() {
	const { id } = useParams();
	const dispatch = useDispatch();
	const items = useSelector((state) => state.items.items);
	const status = useSelector((state) => state.items.status);
	const wishlistIDs = useSelector((state) => state.wishlist.itemIDs);
	const [inWishlist, setInWishlist] = useState(false);
	const [item, setItem] = useState();
	const [quantity, setQuantity] = useState("1");
	const [attributes, setAttributes] = useState([]);
	const [attributesLoading, setAttributesLoading] = useState(true)
	const [selectedAttribute, setSelectedAttribute] = useState("");
	const [selectedPrice, setSelectedPrice] = useState(-1);
	const cartId = useSelector(state => state.cart.shoppingCartId);

	useEffect(() => {
		if (status === "idle") {
			dispatch(fetchItems());
		}
	}, [status, dispatch]);

	useEffect(() => {
		const fetchAttributes = async() => {
			try {
				const response = await fetch(`${BASE_API_URL}/items/attributes/${id}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

				const data = await response.json();
                setAttributes(data.result);
				setSelectedAttribute(data.result[0].attributeValue)
				setSelectedPrice(data.result[0].price.toFixed(2))
			} catch(err) {
				console.error("Error fetching attribute items:", err);
				return;
			}
		}

        if (!attributesLoading) return;
		fetchAttributes();
		setAttributesLoading(false);
	}, [attributesLoading, attributes]);

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
	}, [id, wishlistIDs, status]);

	const handleCartSubmit = async () => {
        dispatch(addToCart({
            cartId: cartId,
            productId: item.id,
            quantity: parseInt(quantity),
            selectedAttribute: selectedAttribute,
			selectedPrice: selectedPrice
        }));
		alert(`${quantity} ${item.title} added to cart!`)
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
				{selectedPrice === -1 ? (
					<h4 className="item-price">${item.price}</h4>
				) : (
					<h4 className="item-price">${selectedPrice}</h4>
				)}
				<div className="item-description">{item.description}</div>
				<div>
					<form class-name="drop-down">
						{attributes.length !== 0 && 
						<div className="select-quantity">
							<select
								className="drop-down-button"
								name="select"
								aria-label="Select"
								required
								value={selectedAttribute}
								onChange={(e) => {
									const newAttributeValue = e.target.value;
									setSelectedAttribute(newAttributeValue);
					
									const foundAttribute = attributes.find(
										(attr) => attr.attributeValue === newAttributeValue
									);
					
									setSelectedPrice(foundAttribute.price.toFixed(2));
								}}
							>
								{attributes.map((attribute) => (
									<option value={attribute.attributeValue}>
										&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;{attribute.attributeValue}
									</option>
								))}
							</select>
							<div className="quantity-overlay">Size: </div>
						</div>}
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
