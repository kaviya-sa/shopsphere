function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price);
}

function showToast(message) {
    let container = document.querySelector(".toast-container");

    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2500);
}

function getCart() {
    return Storage.get(KEYS.cart, []);
}

function getCartCount() {
    return getCart().reduce((total, item) => total + item.quantity, 0);
}

function updateCartCount() {
    const count = document.querySelector(".cart-count");
    if (count) {
        count.textContent = getCartCount();
    }
}

function getCurrentUser() {
    return Storage.get(KEYS.currentUser);
}

function renderHeader() {
    const header = document.getElementById("siteHeader");

    if (!header) return;

    const user = getCurrentUser();

    header.className = "site-header";

    header.innerHTML = `
        <nav class="navbar">
            <a href="index.html" class="logo">Shop<span>Sphere</span></a>

            <button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu">☰</button>

            <div class="nav-links" id="navLinks">
                <a href="index.html">Home</a>
                <a href="products.html">Products</a>
                ${user ? `<a href="profile.html">Profile</a>` : ""}
                ${user?.isAdmin ? `<a href="admin.html">Admin</a>` : ""}
            </div>

            <div class="nav-actions">
                <button class="icon-btn" id="themeBtn" aria-label="Toggle theme">◐</button>

                <a href="cart.html" class="icon-btn cart-link" aria-label="Shopping cart">
                    🛒
                    <span class="cart-count">${getCartCount()}</span>
                </a>

                ${
                    user
                    ? `<button class="btn btn-secondary" id="logoutBtn">Logout</button>`
                    : `<a href="login.html" class="btn btn-primary">Login</a>`
                }
            </div>
        </nav>
    `;

    document.getElementById("menuBtn")?.addEventListener("click", () => {
        document.getElementById("navLinks")?.classList.toggle("active");
    });

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        Storage.remove(KEYS.currentUser);
        showToast("Logged out successfully");
        setTimeout(() => location.href = "index.html", 500);
    });

    document.getElementById("themeBtn")?.addEventListener("click", toggleTheme);
}

function renderFooter() {
    const footer = document.getElementById("siteFooter");

    if (!footer) return;

    footer.className = "site-footer";

    footer.innerHTML = `
        <div class="footer-inner">
            <div>
                <a href="index.html" class="logo">Shop<span>Sphere</span></a>
                <p>Modern shopping made simple.</p>
            </div>

            <p>© ${new Date().getFullYear()} ShopSphere. Capstone Project.</p>
        </div>
    `;
}

function initializeTheme() {
    const theme = Storage.get(KEYS.theme, "light");
    document.documentElement.dataset.theme = theme;
}

function toggleTheme() {
    const current = document.documentElement.dataset.theme || "light";
    const next = current === "light" ? "dark" : "light";

    document.documentElement.dataset.theme = next;
    Storage.set(KEYS.theme, next);
}

function requireLogin() {
    if (!getCurrentUser()) {
        location.href = "login.html";
        return false;
    }

    return true;
}