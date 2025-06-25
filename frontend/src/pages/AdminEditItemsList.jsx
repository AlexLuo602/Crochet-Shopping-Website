import { useEffect } from "react";
import AdminItemGrid from "../components/AdminItemGrid";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchItems } from "../redux/itemSlice";
import "../css/Home.css";

function EditItemsList() {
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
                <h1 className="title">Edit Items</h1>
                <p>Loading items...</p> 
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="content">
                <h1 className="title">Edit Items</h1>
                <p style={{ color: 'red' }}>Error loading items: {error}</p>
            </div>
        );
    }

	return (
		<div className="content">
			<h1 className="title">Edit Items</h1>
			<div className="sub-links">
				<Link to="/admin/add-item">
					<h3>Add Item</h3>
				</Link>
			</div>
			<AdminItemGrid items={items} />
		</div>
	);
}

export default EditItemsList;
