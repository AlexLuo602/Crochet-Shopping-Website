import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { MOCK_DATA_JSON_STRING } from "../assets/mock_data";

function ItemDetail() {
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

	return item && <div>Item Detail: {item.title}</div>;
}

export default ItemDetail;
