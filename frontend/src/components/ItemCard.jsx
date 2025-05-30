import { Link } from "react-router-dom";
import "../css/ItemCard.css";

function ItemCard({ item }) {
	return (
		<Link to={`/items/${item.id}`} key={item.id} className="item-card">
			<img src={item.imageUrl} alt={item.title} />
			<div className="item-text">
				<h3> {item.title} </h3>
				<p>${item.price}</p>
			</div>
		</Link>
	);
}

export default ItemCard;
