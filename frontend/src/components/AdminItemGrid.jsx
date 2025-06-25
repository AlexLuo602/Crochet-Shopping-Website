import AdminItemCard from "./AdminItemCard";
import "../css/Home.css";

function AdminItemGrid({ items }) {
	return (
		<div className="item-grid">
			{items.map((item) => (
				<AdminItemCard item={item} key={item.id} />
			))}
		</div>
	);
}

export default AdminItemGrid;
