import ItemCard from "./ItemCard";
import "../css/Home.css";

function ItemGrid({ items }) {
	return (
		<div className="item-grid">
			{items.map((item) => (
				<ItemCard item={item} key={item.id} />
			))}
		</div>
	);
}

export default ItemGrid;
