const Storage = {
    get(key, fallback = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch {
            return fallback;
        }
    },

    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    remove(key) {
        localStorage.removeItem(key);
    }
};

const KEYS = {
    products: "shopsphere_products",
    cart: "shopsphere_cart",
    wishlist: "shopsphere_wishlist",
    users: "shopsphere_users",
    currentUser: "shopsphere_current_user",
    theme: "shopsphere_theme",
    orders: "shopsphere_orders"
};