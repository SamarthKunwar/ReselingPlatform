import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8086', // Backend is running on 8086
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Cart API functions
// These functions provide a clean interface to interact with the cart backend
export const cartAPI = {
    // Get the current user's cart
    // Returns: { id, user, items: [{id, cart, item: {id, name, description, price, owner}}] }
    getCart: () => api.get('/cart'),

    // Add an item to the cart
    // Params: itemId (Long) - the ID of the item to add
    // Returns: { message: "Item added to cart" }
    addToCart: (itemId) => api.post('/cart/add', { itemId }),

    // Remove an item from the cart
    // Params: cartItemId (Long) - the ID of the cart item (not the item itself)
    // Returns: { message: "Item removed from cart" }
    removeFromCart: (cartItemId) => api.delete(`/cart/remove/${cartItemId}`),

    // Checkout - clears all items from cart
    // Returns: { message: "Checkout successful!" }
    checkout: () => api.post('/cart/checkout')
};

export const itemAPI = {
    // Post a new item
    // Params: itemData { title, description, price, imageUrl }
    createItem: (itemData) => api.post('/items', itemData),

    // Upload an image
    // Params: file (File object from input)
    // Returns: { url: "..." }
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/items/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

export default api;
