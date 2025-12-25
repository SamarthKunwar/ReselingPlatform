import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { cartAPI } from '../api/axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [addingToCart, setAddingToCart] = useState(null); // Track which item is being added
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchItems();
        fetchCartCount();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await api.get('/items');
            setItems(response.data);
        } catch (err) {
            console.error("Failed to fetch items", err);
            setError('Failed to fetch items. Check if backend is running and you are logged in.');
        }
    };

    // Fetch cart to get item count for the badge
    const fetchCartCount = async () => {
        try {
            const response = await cartAPI.getCart();
            setCartCount(response.data.items?.length || 0);
        } catch (err) {
            console.error("Failed to fetch cart count", err);
        }
    };

    // Add item to cart
    const handleAddToCart = async (itemId) => {
        try {
            setAddingToCart(itemId);
            setError('');
            setSuccessMessage('');

            await cartAPI.addToCart(itemId);

            // Update cart count
            await fetchCartCount();

            // Show success message
            setSuccessMessage('Item added to cart!');
            setTimeout(() => setSuccessMessage(''), 3000); // Clear after 3 seconds
        } catch (err) {
            console.error('Failed to add item to cart:', err);
            setError('Failed to add item to cart. Please try again.');
        } finally {
            setAddingToCart(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header with Cart Icon */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">Welcome, {username}</span>

                        {/* Cart Icon with Badge */}
                        <button
                            onClick={() => navigate('/cart')}
                            className="relative bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors border border-gray-700"
                            title="View Cart"
                        >
                            <span className="text-2xl">🛒</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-500/20 border border-green-500 text-green-100 p-4 rounded-lg mb-6">
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-gray-200">Available Items</h2>

                    {items.length === 0 ? (
                        <p className="text-gray-400">No items found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item) => (
                                <div key={item.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                                    <h3 className="font-bold text-lg text-white mb-2">{item.title}</h3>
                                    <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                                    <p className="text-blue-400 font-bold text-xl mb-4">${item.price}</p>

                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={() => handleAddToCart(item.id)}
                                        disabled={addingToCart === item.id}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {addingToCart === item.id ? 'Adding...' : 'Add to Cart'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
