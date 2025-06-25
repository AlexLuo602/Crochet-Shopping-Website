import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchItems } from "../redux/itemSlice";

const BASE_API_URL = import.meta.env.VITE_APP_API_URL;

function EditItem() {
    const { id: itemId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const items = useSelector((state) => state.items.items);
    const status = useSelector((state) => state.items.status);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isInitialDataLoading, setIsInitialDataLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [itemFound, setItemFound] = useState(false);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchItems());
        }
    }, [status, dispatch]);

    useEffect(() => {
        if (status === 'succeeded' && items.length > 0) {
            try {
                const foundItem = items.find((item) => item.id === parseInt(itemId));

                if (foundItem) {
                    setFormData({
                        title: foundItem.title,
                        description: foundItem.description,
                        price: foundItem.price !== undefined ? String(foundItem.price) : '',
                    });
                    setExistingImageUrl(foundItem.imageUrl);
                    setImagePreviewUrl(foundItem.imageUrl);
                    setItemFound(true);
                    setIsInitialDataLoading(false);
                } else {
                    console.error(`Item with ID "${itemId}" not found in Redux store.`);
                    setMessage({ type: 'error', text: `Product with ID ${itemId} not found.` });
                    setItemFound(false);
                    setIsInitialDataLoading(false);
                }
            } catch (e) {
                console.error(`Unexpected error thrown while finding item: ${e}`);
                setMessage({ type: 'error', text: "An error occurred while preparing the form. Please try again." });
                setItemFound(false);
                setIsInitialDataLoading(false);
            }
        } else if (status === 'failed') {
            setMessage({ type: 'error', text: "Failed to load product list. Please try again later." });
            setIsInitialDataLoading(false);
            setItemFound(false);
        }
    }, [itemId, items, status]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        if (message) setMessage(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreviewUrl(existingImageUrl);
            setSelectedFile(null);
        }
        if (message) setMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setMessage(null);

		const priceValue = parseFloat(formData.price);

        const data = new FormData();
        data.append('itemId', itemId);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', priceValue);

        if (selectedFile) {
            data.append('productImage', selectedFile);
        }

        try {
            const response = await axios.put(`${BASE_API_URL}/admin/edit-item/${itemId}`, data);

            if (response.status === 200) {
                setMessage({ type: 'success', text: "Product updated successfully!" });
                dispatch(fetchItems());
				alert("Product updated successfuly!")
                setSelectedFile(null);
                setTimeout(() => {
                    navigate('/admin/edit-items');
                }, 500);
            } else {
                setMessage({ type: 'error', text: response.data.message || "Failed to update product." });
            }
        } catch (error) {
            console.error("Error updating product:", error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || "An unexpected error occurred. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isInitialDataLoading) {
        return (
            <main className="container">
                <article aria-busy="true">Loading product data...</article>
            </main>
        );
    }

    if (!itemFound) {
        return (
            <main className="container">
                <article className="error">
                    <h2>Product Not Found</h2>
                    <p>{message?.text || "The product you are trying to edit does not exist or could not be loaded."}</p>
                    <Link to="/admin/edit-items" role="button" className="secondary outline">Back to Manage Items</Link>
                </article>
            </main>
        );
    }

    return (
        <main className="container">
            <article>
                <hgroup>
                    <h1>Edit Product</h1>
                    <p>Modify the details of the item or update its image.</p>
                </hgroup>

                {message && (
                    <p className={message.type === 'error' ? 'text-danger' : 'text-success'}>
                        {message.text}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid">
                        <label htmlFor="title">
                            Product Title
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Cute Otter Amigurumi"
                                required
                                aria-invalid={message && message.type === 'error' && !formData.title ? "true" : "false"}
                                disabled={isLoading}
                            />
                        </label>
                    </div>

                    <label htmlFor="description">
                        Description
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="A brief description of the product."
                            rows="4"
                            required
                            aria-invalid={message && message.type === 'error' && !formData.description ? "true" : "false"}
                            disabled={isLoading}
                        ></textarea>
                    </label>

                    <div className="grid">
                        <label htmlFor="price">
                            Price ($)
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="e.g., 28.50"
                                required
                                step="0.01"
                                min="0.01"
                                aria-invalid={message && message.type === 'error' && (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) ? "true" : "false"}
                                disabled={isLoading}
                            />
                        </label>
                    </div>

                    <label htmlFor="productImage">
                        Product Image
                        <input
                            type="file"
                            id="productImage"
                            name="productImage"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />
                        <small>Leave blank to keep current image. Select a new file to change.</small>
                    </label>

                    {imagePreviewUrl && (
                        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                            <img
                                src={imagePreviewUrl}
                                alt="Image Preview"
                                style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                            <small style={{ display: 'block', marginTop: '0.5rem', color: '#555' }}>Current Image / New Image Preview</small>
                        </div>
                    )}

                    <button type="submit" aria-busy={isLoading} disabled={isLoading}>
                        {isLoading ? 'Updating Item...' : 'Update Product'}
                    </button>
                    <Link to="/admin/edit-items" role="button" className="secondary outline">
                        Back to Manage Items
                    </Link>
                </form>
            </article>
        </main>
    );
}

export default EditItem;