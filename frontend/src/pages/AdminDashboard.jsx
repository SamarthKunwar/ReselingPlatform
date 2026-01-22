import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [users, setUsers] = useState([]);
    const [view, setView] = useState('items'); // 'items' or 'users'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'ROLE_ADMIN') {
            navigate('/dashboard');
            return;
        }
        fetchData();
    }, [view]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (view === 'items') {
                const response = await api.get('/admin/items');
                setItems(response.data);
            } else {
                const response = await api.get('/admin/users');
                setUsers(response.data);
            }
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`/admin/items/${itemId}`);
            setItems(items.filter(item => item.id !== itemId));
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    const handleToggleAdmin = async (userId) => {
        try {
            const response = await api.post(`/admin/users/${userId}/toggle-admin`);
            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: response.data.role } : user
            ));
        } catch (err) {
            alert('Failed to toggle admin status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Admin Control Panel</h1>
                        <p className="text-gray-400">Manage platform resources</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </header>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-800">
                    <button
                        onClick={() => setView('items')}
                        className={`pb-4 px-2 transition-all ${view === 'items' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Manage Items
                    </button>
                    <button
                        onClick={() => setView('users')}
                        className={`pb-4 px-2 transition-all ${view === 'users' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Manage Users
                    </button>
                </div>

                {error && <div className="p-4 mb-4 bg-red-900/30 border border-red-500 text-red-400 rounded-lg">{error}</div>}

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading...</div>
                ) : (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                        {view === 'items' ? (
                            <table className="w-full text-left">
                                <thead className="bg-gray-800/50 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Item</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {items.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{item.title}</div>
                                                <div className="text-xs text-gray-500">ID: {item.id}</div>
                                            </td>
                                            <td className="px-6 py-4">${item.price}</td>
                                            <td className="px-6 py-4">
                                                {item.purchased ? (
                                                    <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded-full border border-red-500/20">Sold</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full border border-green-500/20">Available</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-800/50 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">{user.fullname}</td>
                                            <td className="px-6 py-4 text-gray-400">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full border ${user.role === 'ROLE_ADMIN' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleAdmin(user.id)}
                                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                                >
                                                    Toggle Admin
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {((view === 'items' && items.length === 0) || (view === 'users' && users.length === 0)) && (
                            <div className="text-center py-20 text-gray-500">No data found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
