import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { cartAPI } from '../api/axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [addingToCart, setAddingToCart] = useState(null);
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
            setError('Failed to fetch items');
        }
    };

    const fetchCartCount = async () => {
        try {
            const response = await cartAPI.getCart();
            setCartCount(response.data.items?.length || 0);
        } catch (err) {
            console.error("Failed to fetch cart count", err);
        }
    };

    const handleAddToCart = async (itemId) => {
        try {
            setAddingToCart(itemId);
            setError('');
            setSuccessMessage('');

            await cartAPI.addToCart(itemId);
            await fetchCartCount();

            setSuccessMessage('Added to cart');
            setTimeout(() => setSuccessMessage(''), 2000);
        } catch (err) {
            console.error('Failed to add item to cart:', err);
            setError('Failed to add item');
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-light tracking-tight text-gray-900">Vintage</h1>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 hidden sm:block">{username}</span>

                            {/* Cart Button */}
                            <button
                                onClick={() => navigate('/cart')}
                                className="relative p-2.5 hover:bg-gray-100 rounded-full transition-colors group"
                                title="Cart"
                            >
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Add Item Button */}
                            <button
                                onClick={() => navigate('/post-item')}
                                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                New Item
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Items Grid */}
                {items.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-gray-500 text-lg">No items yet</p>
                        <button
                            onClick={() => navigate('/post-item')}
                            className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Post Your First Item
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                            >
                                {/* Image */}
                                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23F3F4F6" width="100" height="100"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="12" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-5xl opacity-20">📦</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-semibold text-gray-900">${item.price}</span>

                                        <button
                                            onClick={() => handleAddToCart(item.id)}
                                            disabled={addingToCart === item.id}
                                            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {addingToCart === item.id ? '...' : 'Add'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
