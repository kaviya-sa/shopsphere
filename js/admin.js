function renderAdminProducts() {
    const container = document.getElementById("adminProducts");

    if (!container) return;

    const user = getCurrentUser();

    if (!user || !user.isAdmin) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>Access Denied</h2>
                <p>Administrator access is required.</p>
            </div>
        `;

        document.getElementById("productForm").style.display = "none";
        return;
    }

    document.getElementById("adminProductCount").textContent =
        `${products.length} products`;

    container.innerHTML = products.map(product => `
        <div class="admin-product">
            <img src="${product.image}" alt="${product.name}">

            <div>
                <strong>${product.name}</strong>
                <p style="color:var(--muted)">
                    ${product.category} · ${formatPrice(product.price)}
                </p>
            </div>

            <div class="admin-actions">
                <button
                    class="btn btn-secondary"
                    onclick="editProduct(${product.id})"
                >
                    Edit
                </button>

                <button
                    class="btn btn-danger"
                    onclick="deleteProduct(${product.id})"
                >
                    Delete
                </button>
            </div>
        </div>
    `).join("");
}

function setupAdminForm() {
    const form = document.getElementById("productForm");

    if (!form) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        const id = document.getElementById("productId").value;

        const product = {
            id: id ? Number(id) : Date.now(),
            name: document.getElementById("productName").value.trim(),
            category: document.getElementById("productCategory").value,
            price: Number(document.getElementById("productPrice").value),
            rating: Number(document.getElementById("productRating").value),
            image: document.getElementById("productImage").value.trim(),
            description: document.getElementById("productDescription").value.trim()
        };

        if (id) {
            products = products.map(item =>
                item.id === Number(id) ? product : item
            );

            showToast("Product updated");
        } else {
            products.push(product);
            showToast("Product added");
        }

        Storage.set(KEYS.products, products);

        clearProductForm();
        renderAdminProducts();
    });

    document.getElementById("cancelEdit")?.addEventListener(
        "click",
        clearProductForm
    );
}

function editProduct(id) {
    const product = products.find(item => item.id === Number(id));

    if (!product) return;

    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productRating").value = product.rating;
    document.getElementById("productImage").value = product.image;
    document.getElementById("productDescription").value = product.description;

    document.getElementById("formTitle").textContent = "Edit Product";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function deleteProduct(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    products = products.filter(item => item.id !== Number(id));

    Storage.set(KEYS.products, products);

    renderAdminProducts();

    showToast("Product deleted");
}

function clearProductForm() {
    document.getElementById("productForm")?.reset();

    const id = document.getElementById("productId");

    if (id) {
        id.value = "";
    }

    const title = document.getElementById("formTitle");

    if (title) {
        title.textContent = "Add Product";
    }
}

async function initializeAdmin() {
    await loadProducts();

    setupAdminForm();
    renderAdminProducts();
}