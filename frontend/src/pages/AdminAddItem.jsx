import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchItems } from '../redux/itemSlice';

const BASE_API_URL = import.meta.env.VITE_APP_API_URL;

function AddItem() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
    });

    // image selection states
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);

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
            setImagePreviewUrl(null);
        }
        if (message) setMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setMessage(null);

        if (!formData.title || !formData.description || !formData.price || !selectedFile) {
            setMessage({ type: 'error', text: "All fields and an image file are required." });
            setIsLoading(false);
            return;
        }

        const priceValue = parseFloat(formData.price);
        if (isNaN(priceValue) || priceValue <= 0) {
            setMessage({ type: 'error', text: "Price must be a positive number." });
            setIsLoading(false);
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', priceValue);
        data.append('productImage', selectedFile);

        try {
            const response = await axios.post(`${BASE_API_URL}/admin/add-item`, data);

            if (response.status === 201) {
                setMessage({ type: 'success', text: "Product added successfully!" });
                setFormData({
                    title: '',
                    description: '',
                    price: '',
                });
                setSelectedFile(null);
                setImagePreviewUrl(null);
                dispatch(fetchItems());
                alert("Product updated successfuly!")
                setTimeout(() => {
                    navigate('/admin/edit-items');
                }, 2000);
            } else {
                setMessage({ type: 'error', text: response.data.message || "Failed to add product." });
            }
        } catch (error) {
            console.error("Error adding product:", error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || "An unexpected error occurred. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="container">
            <article>
                <hgroup>
                    <h1>Add New Product</h1>
                    <p>Enter the details for a new item and upload its image.</p>
                </hgroup>

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
                            name="productImage" // This name must match the field in Multer on the backend (look back at this when doing backend)
                            accept="image/*" // Restrict to image files
                            onChange={handleFileChange}
                            required
                            aria-invalid={message && message.type === 'error' && !selectedFile ? "true" : "false"}
                            disabled={isLoading}
                        />
                    </label>

                    {imagePreviewUrl && (
                        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                            <img
                                src={imagePreviewUrl}
                                alt="Image Preview"
                                style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                            <small style={{ display: 'block', marginTop: '0.5rem', color: '#555' }}>Image Preview</small>
                        </div>
                    )}


                    {message && (
                        <p className={message.type === 'error' ? 'text-danger' : 'text-success'}>
                            {message.text}
                        </p>
                    )}

                    <button type="submit" aria-busy={isLoading} disabled={isLoading}>
                        {isLoading ? 'Adding Item...' : 'Add Product'}
                    </button>
                    <Link to="/" role="button" className="secondary outline">
                        Back to Home
                    </Link>
                </form>
            </article>
        </main>
    );
}

export default AddItem;