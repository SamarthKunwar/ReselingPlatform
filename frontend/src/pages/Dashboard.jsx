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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
            {/* Header */}
            <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-light tracking-tight text-white">Vintage</h1>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400 hidden sm:block">{username}</span>

                            {/* Cart Button */}
                            <button
                                onClick={() => navigate('/cart')}
                                className="relative p-2.5 hover:bg-gray-800 rounded-full transition-colors group"
                                title="Cart"
                            >
                                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Admin Button */}
                            {localStorage.getItem('role') === 'ROLE_ADMIN' && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Admin
                                </button>
                            )}

                            {/* Add Item Button */}
                            <button
                                onClick={() => navigate('/post-item')}
                                className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                New Item
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('username');
                                    localStorage.removeItem('role');
                                    navigate('/login');
                                }}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
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
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Items Grid */}
                {items.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-gray-400 text-lg">No items yet</p>
                        <button
                            onClick={() => navigate('/post-item')}
                            className="mt-6 px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Post Your First Item
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700/50 hover:border-gray-600"
                            >
                                {/* Image - Clickable */}
                                <div
                                    onClick={() => navigate(`/items/${item.id}`)}
                                    className="relative aspect-square bg-gray-900 overflow-hidden cursor-pointer"
                                >
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%231F2937" width="100" height="100"/%3E%3Ctext fill="%236B7280" font-family="sans-serif" font-size="12" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
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
                                    <h3
                                        onClick={() => navigate(`/items/${item.id}`)}
                                        className="font-medium text-white mb-1 line-clamp-1 cursor-pointer hover:text-gray-300 transition-colors"
                                    >
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-semibold text-white">${item.price}</span>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(item.id);
                                            }}
                                            disabled={addingToCart === item.id}
                                            className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
