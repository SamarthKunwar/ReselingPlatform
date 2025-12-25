import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../api/axios';

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [checkingOut, setCheckingOut] = useState(false);

    // Fetch cart when component mounts
    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await cartAPI.getCart();
            setCart(response.data);
        } catch (err) {
            console.error('Failed to fetch cart:', err);
            setError('Failed to load cart. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Remove item from cart
    const handleRemoveItem = async (cartItemId) => {
        try {
            await cartAPI.removeFromCart(cartItemId);
            // Refetch cart to update UI
            fetchCart();
        } catch (err) {
            console.error('Failed to remove item:', err);
            setError('Failed to remove item. Please try again.');
        }
    };

    // Checkout - clear all items from cart
    const handleCheckout = async () => {
        try {
            setCheckingOut(true);
            setError('');
            await cartAPI.checkout();
            // Show success message and redirect to dashboard
            alert('Checkout successful! Your order has been placed.');
            navigate('/dashboard');
        } catch (err) {
            console.error('Checkout failed:', err);
            setError(err.response?.data || 'Checkout failed. Please try again.');
        } finally {
            setCheckingOut(false);
        }
    };

    // Calculate total price
    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, cartItem) => {
            return total + (cartItem.item?.price || 0);
        }, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your cart...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Shopping Cart</h1>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Empty Cart State */}
                {(!cart || !cart.items || cart.items.length === 0) ? (
                    <div className="bg-gray-800 p-12 rounded-xl border border-gray-700 text-center">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-semibold mb-2 text-gray-200">Your cart is empty</h2>
                        <p className="text-gray-400 mb-6">Add some items to get started!</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg transition-colors font-medium"
                        >
                            Browse Items
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-200">
                                Items ({cart.items.length})
                            </h2>

                            <div className="space-y-4">
                                {cart.items.map((cartItem) => (
                                    <div
                                        key={cartItem.id}
                                        className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 flex justify-between items-center hover:border-gray-500 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-white mb-1">
                                                {cartItem.item?.title || 'Unknown Item'}
                                            </h3>
                                            <p className="text-gray-300 text-sm mb-2">
                                                {cartItem.item?.description || 'No description'}
                                            </p>
                                            <p className="text-blue-400 font-bold text-lg">
                                                ${cartItem.item?.price?.toFixed(2) || '0.00'}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveItem(cartItem.id)}
                                            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg transition-colors ml-4 font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cart Summary */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4 text-gray-200">Order Summary</h2>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal ({cart.items.length} items)</span>
                                    <span>${calculateTotal().toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-600 pt-2 mt-2">
                                    <div className="flex justify-between text-xl font-bold text-white">
                                        <span>Total</span>
                                        <span className="text-blue-400">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={checkingOut}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart;
