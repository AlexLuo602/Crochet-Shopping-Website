import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { MOCK_DATA_JSON_STRING } from "../assets/mock_data";
import "../css/ItemDetails.css";

function ItemDetails() {
	const { id } = useParams();
	const [item, setItem] = useState();

	useEffect(() => {
		const findItem = () => {
			try {
				const parsedData = JSON.parse(MOCK_DATA_JSON_STRING);
				const itemInstances = parsedData.map((itemJson) => {
					return {
						id: itemJson.id,
						title: itemJson.title,
						category: itemJson.category,
						description: itemJson.description,
						price: itemJson.price,
						imageUrl: itemJson.imageUrl,
					};
				});

				const foundItem = itemInstances.find(
					(item) => item.id === parseInt(id)
				);

				if (foundItem) {
					setItem(foundItem);
				} else {
					console.error(`Item with ID "${id}" not found.`);
				}
			} catch (e) {
				console.error(`Unexpected error thrown! ${e}`);
			}
		};

		findItem();
	}, [id]);

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
							>
								<option>
									&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;1
								</option>
								<option>
									&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;2
								</option>
								<option>
									&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;3
								</option>
								<option>
									&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;4
								</option>
								<option>
									&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;5
								</option>
							</select>
							<div className="quantity-overlay">Quantity: </div>
						</div>
						<input className="add-to" type="submit" value="Add to Cart" />
						<input className="add-to" type="submit" value="Add to Wishlist" />
					</form>
				</div>
			</article>
		</main>
	);
}

export default ItemDetails;
