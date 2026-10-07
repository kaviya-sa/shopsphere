document.addEventListener("DOMContentLoaded", async () => {
    initializeTheme();

    renderHeader();
    renderFooter();

    await initializeProducts();

    if (document.getElementById("cartContainer")) {
        renderCart();
    }

    if (document.getElementById("profileContainer")) {
        renderProfile();
    }

    if (document.getElementById("productForm")) {
        await initializeAdmin();
    }

    updateCartCount();
});