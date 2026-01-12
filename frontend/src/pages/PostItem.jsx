import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemAPI } from '../api/axios';

const PostItem = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        imageUrl: ''
    });
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const response = await itemAPI.uploadImage(file);
            const imageUrl = response.data.url;
            setFormData(prev => ({
                ...prev,
                imageUrl: imageUrl
            }));
        } catch (err) {
            console.error('Image upload failed:', err);
            setError('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (uploading) return;
        setLoading(true);
        setError('');

        try {
            await itemAPI.createItem({
                ...formData,
                price: parseFloat(formData.price)
            });
            // Redirect to dashboard on success
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to post item:', err);
            setError('Failed to post item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
            <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Post New Item</h2>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-1 text-sm">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Gaming Laptop"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1 text-sm">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="3"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Excellent condition, 16GB RAM..."
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1 text-sm">Price ($)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            step="0.01"
                            min="0"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="999.99"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1 text-sm">Item Image</label>
                        <div className="mt-1 flex flex-col items-center p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 transition-colors cursor-pointer relative">
                            {uploading ? (
                                <div className="text-blue-400">Uploading to Cloud...</div>
                            ) : formData.imageUrl ? (
                                <div className="w-full text-center">
                                    <img
                                        src={formData.imageUrl}
                                        alt="Preview"
                                        className="max-h-32 mx-auto rounded mb-2 shadow-lg"
                                    />
                                    <p className="text-xs text-green-400 truncate">{formData.imageUrl}</p>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                        className="text-xs text-red-400 mt-2 hover:underline"
                                    >
                                        Remove image
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-xs text-gray-400">Click to upload image</p>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={uploading}
                            />
                        </div>
                        <input type="hidden" name="imageUrl" value={formData.imageUrl} required />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Posting...' : 'Post Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostItem;
