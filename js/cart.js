function renderCart() {
    const container = document.getElementById("cartContainer");

    if (!container) return;

    const cart = getCart();

    if (!cart.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>Your cart is empty 🛒</h2>
                <p>Add some products to continue.</p>
                <a href="products.html" class="btn btn-primary">
                    Browse Products
                </a>
            </div>
        `;
        return;
    }

    let subtotal = 0;

    const itemsHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id);

        if (!product) return "";

        const total = product.price * item.quantity;
        subtotal += total;

        return `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.name}">

                <div>
                    <h3>${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                    <strong>${formatPrice(product.price)}</strong>
                </div>

                <div>
                    <div class="quantity-controls">
                        <button onclick="changeQuantity(${product.id}, -1)">−</button>
                        <strong>${item.quantity}</strong>
                        <button onclick="changeQuantity(${product.id}, 1)">+</button>
                    </div>

                    <button
                        class="btn btn-danger"
                        style="margin-top:10px;padding:7px 10px"
                        onclick="removeFromCart(${product.id})"
                    >
                        Remove
                    </button>
                </div>
            </div>
        `;
    }).join("");

    const shipping = subtotal >= 3000 ? 0 : 99;
    const total = subtotal + shipping;

    container.innerHTML = `
        <div class="cart-layout">
            <div>
                ${itemsHTML}
            </div>

            <aside class="summary">
                <h2>Order Summary</h2>

                <div class="summary-row">
                    <span>Subtotal</span>
                    <strong>${formatPrice(subtotal)}</strong>
                </div>

                <div class="summary-row">
                    <span>Shipping</span>
                    <strong>${shipping === 0 ? "FREE" : formatPrice(shipping)}</strong>
                </div>

                <div class="summary-row summary-total">
                    <span>Total</span>
                    <strong>${formatPrice(total)}</strong>
                </div>

                <button
                    class="btn btn-primary btn-full"
                    style="margin-top:20px"
                    onclick="checkout()"
                >
                    Place Order
                </button>
            </aside>
        </div>
    `;
}

function changeQuantity(id, amount) {
    const cart = getCart();
    const item = cart.find(item => item.id === Number(id));

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        removeFromCart(id);
        return;
    }

    Storage.set(KEYS.cart, cart);
    updateCartCount();
    renderCart();
}

function removeFromCart(id) {
    const cart = getCart().filter(item => item.id !== Number(id));

    Storage.set(KEYS.cart, cart);
    updateCartCount();
    renderCart();

    showToast("Product removed from cart");
}

function checkout() {
    const user = getCurrentUser();

    if (!user) {
        showToast("Please login before checkout");

        setTimeout(() => {
            location.href = "login.html";
        }, 700);

        return;
    }

    const cart = getCart();

    if (!cart.length) return;

    const orders = Storage.get(KEYS.orders, []);

    orders.push({
        id: Date.now(),
        userId: user.email,
        items: cart,
        date: new Date().toISOString(),
        status: "Confirmed"
    });

    Storage.set(KEYS.orders, orders);
    Storage.set(KEYS.cart, []);

    updateCartCount();
    renderCart();

    showToast("Order placed successfully 🎉");
}