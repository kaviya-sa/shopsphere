let products = [];

async function loadProducts() {
    const stored = Storage.get(KEYS.products);

    if (stored && stored.length) {
        products = stored;
        return products;
    }

    try {
        const response = await fetch("data/products.json");

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        products = await response.json();
        Storage.set(KEYS.products, products);

        return products;
    } catch (error) {
        console.error(error);
        products = [];
        return products;
    }
}

function productCard(product) {
    return `
        <article class="product-card">
            <a href="product-details.html?id=${product.id}">
                <img
                    class="product-image"
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >
            </a>

            <div class="product-info">
                <span class="product-category">${product.category}</span>

                <h3 class="product-title">
                    ${product.name}
                </h3>

                <p class="product-description">
                    ${product.description}
                </p>

                <div class="product-bottom">
                    <span class="price">${formatPrice(product.price)}</span>
                    <span class="rating">★ ${product.rating}</span>
                </div>

                <div class="product-actions">
                    <button
                        class="btn btn-primary"
                        onclick="addToCart(${product.id})"
                    >
                        Add to Cart
                    </button>

                    <button
                        class="btn btn-secondary"
                        onclick="toggleWishlist(${product.id})"
                        aria-label="Add to wishlist"
                    >
                        ♡
                    </button>
                </div>
            </div>
        </article>
    `;
}

function renderProducts(list, elementId = "productGrid") {
    const container = document.getElementById(elementId);

    if (!container) return;

    if (!list.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No products found</h2>
                <p>Try changing your search or filters.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(productCard).join("");
}

function setupProductFilters() {
    const search = document.getElementById("searchInput");
    const category = document.getElementById("categoryFilter");
    const sort = document.getElementById("sortFilter");

    if (!search) return;

    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");

    if (categoryParam) {
        category.value = categoryParam;
    }

    function applyFilters() {
        let result = [...products];

        const searchValue = search.value.toLowerCase().trim();
        const categoryValue = category.value;
        const sortValue = sort.value;

        if (searchValue) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchValue) ||
                product.description.toLowerCase().includes(searchValue) ||
                product.category.toLowerCase().includes(searchValue)
            );
        }

        if (categoryValue !== "all") {
            result = result.filter(product =>
                product.category === categoryValue
            );
        }

        if (sortValue === "low") {
            result.sort((a, b) => a.price - b.price);
        }

        if (sortValue === "high") {
            result.sort((a, b) => b.price - a.price);
        }

        if (sortValue === "rating") {
            result.sort((a, b) => b.rating - a.rating);
        }

        if (sortValue === "name") {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }

        renderProducts(result);

        const count = document.getElementById("productCount");
        if (count) {
            count.textContent = `${result.length} product(s) found`;
        }
    }

    search.addEventListener("input", applyFilters);
    category.addEventListener("change", applyFilters);
    sort.addEventListener("change", applyFilters);

    applyFilters();
}

function addToCart(id) {
    const product = products.find(p => p.id === Number(id));

    if (!product) return;

    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            quantity: 1
        });
    }

    Storage.set(KEYS.cart, cart);
    updateCartCount();
    showToast(`${product.name} added to cart`);
}

function toggleWishlist(id) {
    const wishlist = Storage.get(KEYS.wishlist, []);
    const productId = Number(id);

    if (wishlist.includes(productId)) {
        Storage.set(
            KEYS.wishlist,
            wishlist.filter(item => item !== productId)
        );

        showToast("Removed from wishlist");
    } else {
        wishlist.push(productId);
        Storage.set(KEYS.wishlist, wishlist);
        showToast("Added to wishlist");
    }
}

function renderProductDetails() {
    const container = document.getElementById("productDetails");

    if (!container) return;

    const id = Number(new URLSearchParams(location.search).get("id"));
    const product = products.find(p => p.id === id);

    if (!product) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>Product not found</h2>
                <a class="btn btn-primary" href="products.html">Back to Products</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="details">
            <div>
                <img
                    class="details-image"
                    src="${product.image}"
                    alt="${product.name}"
                >
            </div>

            <div>
                <span class="product-category">${product.category}</span>

                <h1>${product.name}</h1>

                <span class="rating">★ ${product.rating} / 5</span>

                <p class="details-description">
                    ${product.description}
                </p>

                <div class="details-price">
                    ${formatPrice(product.price)}
                </div>

                <div class="product-actions">
                    <button
                        class="btn btn-primary"
                        onclick="addToCart(${product.id})"
                    >
                        Add to Cart
                    </button>

                    <a href="products.html" class="btn btn-secondary">
                        Continue Shopping
                    </a>
                </div>
            </div>
        </div>
    `;
}

async function initializeProducts() {
    await loadProducts();

    if (document.getElementById("featuredProducts")) {
        renderProducts(products.slice(0, 4), "featuredProducts");
    }

    if (document.getElementById("productGrid")) {
        setupProductFilters();
    }

    if (document.getElementById("productDetails")) {
        renderProductDetails();
    }
}