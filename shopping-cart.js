/* =====================================================
   CLICON SHOPPING CART
   Works with homes.html and cart.html
   Uses localStorage
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       STORAGE
    ================================================= */

    const STORAGE_KEY = "cliconCart";


    /* =================================================
       CART STORAGE
    ================================================= */

    function getCart() {
        try {
            const savedCart = localStorage.getItem(STORAGE_KEY);

            if (!savedCart) {
                return [];
            }

            const cart = JSON.parse(savedCart);

            return Array.isArray(cart) ? cart : [];

        } catch (error) {
            console.error("Could not read cart:", error);
            return [];
        }
    }


    function saveCart(cart) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(cart)
            );

        } catch (error) {
            console.error("Could not save cart:", error);
        }
    }


    /* =================================================
       FORMAT PRICE
    ================================================= */

    function formatPrice(price) {
        return `$${Number(price || 0).toFixed(2)}`;
    }


    /* =================================================
       CART COUNT
    ================================================= */

    function updateCartCount() {

        const cart = getCart();
        const countElement = document.getElementById("cartCount");

        if (!countElement) {
            return;
        }

        const totalQuantity = cart.reduce(
            (total, item) => {
                return total + (Number(item.quantity) || 0);
            },
            0
        );

        countElement.textContent = totalQuantity;
    }


    /* =================================================
       GET PRODUCT FROM PRODUCT CARD
    ================================================= */

    function getProductFromCard(card) {

        if (!card) {
            return null;
        }

        const productId = card.dataset.productId;
        const productName = card.dataset.productName;
        const productPrice = Number(card.dataset.productPrice);
        const productImage = card.dataset.productImage || "";
        const productOldPrice = Number(
            card.dataset.productOldPrice || 0
        );
        const productBrand = card.dataset.productBrand || "";
        const productCategory = card.dataset.productCategory || "";
        const productSku = card.dataset.productSku || "";

        if (
            !productId ||
            !productName ||
            Number.isNaN(productPrice)
        ) {
            console.error(
                "Product information is missing:",
                card
            );

            return null;
        }

        return {
            id: productId,
            name: productName,
            price: productPrice,
            oldPrice: productOldPrice,
            image: productImage,
            brand: productBrand,
            category: productCategory,
            sku: productSku,
            quantity: 1
        };
    }


    /* =================================================
       ADD PRODUCT TO CART
    ================================================= */

    function addToCart(product, quantity = 1) {

        if (!product) {
            return;
        }

        quantity = Number(quantity);

        if (Number.isNaN(quantity) || quantity < 1) {
            quantity = 1;
        }

        const cart = getCart();

        const existingProduct = cart.find(
            item => String(item.id) === String(product.id)
        );

        if (existingProduct) {

            existingProduct.quantity =
                Number(existingProduct.quantity || 0) +
                quantity;

        } else {

            product.quantity = quantity;
            cart.push(product);
        }

        saveCart(cart);
        updateCartCount();
        renderCart();

        showCartMessage(
            `${product.name} added to cart`
        );
    }


    /* =================================================
       REMOVE PRODUCT
    ================================================= */

    function removeFromCart(productId) {

        const cart = getCart().filter(
            item => String(item.id) !== String(productId)
        );

        saveCart(cart);

        renderCart();
        updateCartCount();
    }


    /* =================================================
       CHANGE QUANTITY
    ================================================= */

    function changeQuantity(productId, change) {

        const cart = getCart();

        const product = cart.find(
            item => String(item.id) === String(productId)
        );

        if (!product) {
            return;
        }

        product.quantity =
            Number(product.quantity || 0) +
            Number(change);

        if (product.quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        saveCart(cart);

        renderCart();
        updateCartCount();
    }


    /* =================================================
       CALCULATE SUBTOTAL
    ================================================= */

    function calculateSubtotal(cart) {

        return cart.reduce(
            (total, item) => {

                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 0;

                return total + (price * quantity);

            },
            0
        );
    }


    /* =================================================
       CALCULATE DISCOUNT
    ================================================= */

    function calculateDiscount(cart) {

        return cart.reduce(
            (total, item) => {

                const oldPrice = Number(item.oldPrice) || 0;
                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 0;

                if (oldPrice > price) {
                    return total +
                        ((oldPrice - price) * quantity);
                }

                return total;

            },
            0
        );
    }


    /* =================================================
       CALCULATE TAX
    ================================================= */

    function calculateTax(subtotal) {
        return subtotal * 0.05;
    }


    /* =================================================
       UPDATE TOTALS
    ================================================= */

    function updateTotals(cart) {

    // Normal/original price
    const subtotal = cart.reduce(
        (total, item) => {

            const oldPrice = Number(item.oldPrice) || 0;
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;

            // Use oldPrice if available, otherwise use price
            const normalPrice =
                oldPrice > price ? oldPrice : price;

            return total + (normalPrice * quantity);

        },
        0
    );


    // Discount amount
    const discount = calculateDiscount(cart);


    // Price after discount
    const discountedPrice =
        subtotal - discount;


    // Tax on discounted price
    const tax =
        calculateTax(discountedPrice);


    // Final amount
    const total =
        discountedPrice + tax;


    const subtotalElement =
        document.getElementById("cartSubtotal");

    const discountElement =
        document.getElementById("cartDiscount");

    const taxElement =
        document.getElementById("cartTax");

    const totalElement =
        document.getElementById("cartTotal");


    if (subtotalElement) {
        subtotalElement.textContent =
            formatPrice(subtotal);
    }

    if (discountElement) {
        discountElement.textContent =
            `-${formatPrice(discount)}`;
    }

    if (taxElement) {
        taxElement.textContent =
            `+${formatPrice(tax)}`;
    }

    if (totalElement) {
        totalElement.textContent =
            `${formatPrice(total)} USD`;
    }

}


    /* =================================================
       RENDER CART
    ================================================= */

    function renderCart() {

        const cartProducts =
            document.getElementById("cartProducts");

        const emptyCart =
            document.getElementById("emptyCart");

        /*
            homes.html also uses this JavaScript,
            so stop if the cart container doesn't exist.
        */

        if (!cartProducts) {
            return;
        }

        const cart = getCart();

        /* ---------------------------------------------
           EMPTY CART
        --------------------------------------------- */

        if (cart.length === 0) {

            cartProducts.innerHTML = "";

            if (emptyCart) {
                emptyCart.classList.add("show");
            }

            updateTotals([]);

            return;
        }


        /* ---------------------------------------------
           SHOW PRODUCTS
        --------------------------------------------- */

        if (emptyCart) {
            emptyCart.classList.remove("show");
        }


        cartProducts.innerHTML = cart
            .map(item => {

                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 1;
                const subtotal = price * quantity;
                const oldPrice = Number(item.oldPrice) || 0;

                return `
                    <div
                        class="cart-product-row"
                        data-product-id="${escapeHtml(item.id)}"
                    >

                        <button
                            type="button"
                            class="cart-remove"
                            data-remove="${escapeHtml(item.id)}"
                            aria-label="Remove ${escapeHtml(item.name)}"
                        >
                            <i class="fa-solid fa-xmark"></i>
                        </button>


                        <div class="cart-product-info">

                            <img
                                class="cart-product-image"
                                src="${escapeHtml(item.image)}"
                                alt="${escapeHtml(item.name)}"
                            >

                            <div class="cart-product-details">

                                <h3 class="cart-product-name">
                                    ${escapeHtml(item.name)}
                                </h3>

                                ${
                                    item.brand
                                        ? `
                                            <span class="cart-product-brand">
                                                ${escapeHtml(item.brand)}
                                            </span>
                                        `
                                        : ""
                                }

                            </div>

                        </div>


                        <div class="cart-product-price">

                            ${
                                oldPrice > price
                                    ? `
                                        <del>
                                            ${formatPrice(oldPrice)}
                                        </del>
                                    `
                                    : ""
                            }

                            <span>
                                ${formatPrice(price)}
                            </span>

                        </div>


                        <div class="cart-quantity-box">

                            <button
                                type="button"
                                class="quantity-minus"
                                data-minus="${escapeHtml(item.id)}"
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>

                            <input
                                type="text"
                                value="${quantity}"
                                class="cart-quantity-input"
                                data-quantity="${escapeHtml(item.id)}"
                                inputmode="numeric"
                                aria-label="Quantity"
                            >

                            <button
                                type="button"
                                class="quantity-plus"
                                data-plus="${escapeHtml(item.id)}"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>

                        </div>


                        <div class="cart-product-subtotal">
                            ${formatPrice(subtotal)}
                        </div>

                    </div>
                `;

            })
            .join("");

        updateTotals(cart);
    }


    /* =================================================
       UPDATE CART FROM QUANTITY INPUTS
    ================================================= */

    function updateCartFromInputs() {

        const inputs =
            document.querySelectorAll("[data-quantity]");

        const cart = getCart();

        inputs.forEach(input => {

            const productId =
                input.dataset.quantity;

            let quantity =
                parseInt(input.value, 10);

            if (Number.isNaN(quantity) || quantity < 1) {
                quantity = 1;
            }

            const product = cart.find(
                item => String(item.id) === String(productId)
            );

            if (product) {
                product.quantity = quantity;
            }
        });

        saveCart(cart);

        renderCart();
        updateCartCount();

        showCartMessage(
            "Cart updated successfully"
        );
    }


    /* =================================================
       CART EVENTS
    ================================================= */

    document.addEventListener("click", event => {

        /* ---------------------------------------------
           ADD TO CART
        --------------------------------------------- */

        const addButton =
            event.target.closest(
                '[data-action="add-cart"]'
            );

        if (addButton) {

            const card =
                addButton.closest(".product-card");

            const product =
                getProductFromCard(card);

            if (product) {
                addToCart(product);
            }

            return;
        }


        /* ---------------------------------------------
           REMOVE
        --------------------------------------------- */

        const removeButton =
            event.target.closest("[data-remove]");

        if (removeButton) {

            removeFromCart(
                removeButton.dataset.remove
            );

            return;
        }


        /* ---------------------------------------------
           MINUS
        --------------------------------------------- */

        const minusButton =
            event.target.closest("[data-minus]");

        if (minusButton) {

            changeQuantity(
                minusButton.dataset.minus,
                -1
            );

            return;
        }


        /* ---------------------------------------------
           PLUS
        --------------------------------------------- */

        const plusButton =
            event.target.closest("[data-plus]");

        if (plusButton) {

            changeQuantity(
                plusButton.dataset.plus,
                1
            );

            return;
        }


        /* ---------------------------------------------
           UPDATE CART
        --------------------------------------------- */

        const updateButton =
            event.target.closest("#updateCart");

        if (updateButton) {

            updateCartFromInputs();

            return;
        }


        /* ---------------------------------------------
           CHECKOUT
        --------------------------------------------- */

        const checkoutButton =
            event.target.closest("#checkoutButton");

        if (checkoutButton) {

            const cart = getCart();

            if (cart.length === 0) {

                alert("Your cart is empty.");

                return;
            }

            alert("Proceeding to checkout...");
        }
    });


    /* =================================================
       QUANTITY INPUT
    ================================================= */

    document.addEventListener("input", event => {

        if (
            !event.target.matches(
                ".cart-quantity-input"
            )
        ) {
            return;
        }

        event.target.value =
            event.target.value.replace(
                /[^0-9]/g,
                ""
            );
    });


    /* =================================================
       QUICK VIEW
    ================================================= */

    let quickViewProduct = null;
    let quickQuantity = 1;


    /* =================================================
       OPEN QUICK VIEW
    ================================================= */

    function openQuickView(product) {

        const modal =
            document.getElementById("quickViewModal");

        if (!modal) {
            return;
        }

        quickViewProduct = product;
        quickQuantity = 1;

        const image =
            document.getElementById("quickViewImage");

        const title =
            document.getElementById("quickViewTitle");

        const price =
            document.getElementById("quickViewPrice");

        const oldPrice =
            document.getElementById("quickViewOldPrice");

        const brand =
            document.getElementById("quickViewBrand");

        const category =
            document.getElementById("quickViewCategory");

        const sku =
            document.getElementById("quickViewSku");

        const quantity =
            document.getElementById("quickViewQuantity");


        if (image) {
            image.src = product.image;
            image.alt = product.name;
        }

        if (title) {
            title.textContent = product.name;
        }

        if (price) {
            price.textContent =
                formatPrice(product.price);
        }

        if (oldPrice) {

            if (
                product.oldPrice &&
                product.oldPrice > product.price
            ) {

                oldPrice.textContent =
                    formatPrice(product.oldPrice);

                oldPrice.style.display = "inline";

            } else {

                oldPrice.style.display = "none";
            }
        }

        if (brand) {
            brand.textContent =
                product.brand || "-";
        }

        if (category) {
            category.textContent =
                product.category || "-";
        }

        if (sku) {
            sku.textContent =
                product.sku || "-";
        }

        if (quantity) {
            quantity.textContent = "1";
        }

        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add("modal-open");
    }


    /* =================================================
       QUICK VIEW BUTTON
    ================================================= */

    document.addEventListener("click", event => {

        const quickViewButton =
            event.target.closest(
                '[data-action="quick-view"]'
            );

        if (!quickViewButton) {
            return;
        }

        const card =
            quickViewButton.closest(".product-card");

        if (!card) {
            return;
        }

        const product =
            getProductFromCard(card);

        if (product) {
            openQuickView(product);
        }
    });


    /* =================================================
       CLOSE QUICK VIEW
    ================================================= */

    function closeQuickView() {

        const modal =
            document.getElementById("quickViewModal");

        if (!modal) {
            return;
        }

        modal.classList.remove("active");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

        quickViewProduct = null;
        quickQuantity = 1;
    }


    /* =================================================
       QUICK VIEW CLOSE BUTTON
    ================================================= */

    const quickViewClose =
        document.getElementById("quickViewClose");

    if (quickViewClose) {

        quickViewClose.addEventListener(
            "click",
            closeQuickView
        );
    }


    /* =================================================
       QUICK VIEW BACKDROP
    ================================================= */

    const quickViewModal =
        document.getElementById("quickViewModal");

    if (quickViewModal) {

        quickViewModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    quickViewModal
                ) {
                    closeQuickView();
                }
            }
        );
    }


    /* =================================================
       ESCAPE KEY
    ================================================= */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeQuickView();
            }
        }
    );


    /* =================================================
       QUICK VIEW QUANTITY
    ================================================= */

    const quickViewMinus =
        document.getElementById("quickViewMinus");

    const quickViewPlus =
        document.getElementById("quickViewPlus");

    const quickViewQuantity =
        document.getElementById("quickViewQuantity");


    if (quickViewMinus) {

        quickViewMinus.addEventListener(
            "click",
            () => {

                if (quickQuantity > 1) {
                    quickQuantity--;
                }

                if (quickViewQuantity) {
                    quickViewQuantity.textContent =
                        quickQuantity;
                }
            }
        );
    }


    if (quickViewPlus) {

        quickViewPlus.addEventListener(
            "click",
            () => {

                quickQuantity++;

                if (quickViewQuantity) {
                    quickViewQuantity.textContent =
                        quickQuantity;
                }
            }
        );
    }


    /* =================================================
       QUICK VIEW ADD TO CART
    ================================================= */

    const quickViewAddCart =
        document.getElementById("quickViewAddCart");

    if (quickViewAddCart) {

        quickViewAddCart.addEventListener(
            "click",
            () => {

                if (!quickViewProduct) {
                    return;
                }

                addToCart(
                    quickViewProduct,
                    quickQuantity
                );

                closeQuickView();
            }
        );
    }


    /* =================================================
       CART NOTIFICATION
    ================================================= */

    function showCartMessage(message) {

        let notification =
            document.getElementById(
                "cartNotification"
            );

        if (!notification) {

            notification =
                document.createElement("div");

            notification.id =
                "cartNotification";

            notification.className =
                "cart-notification";

            document.body.appendChild(
                notification
            );
        }

        notification.textContent = message;

        notification.classList.add("show");

        clearTimeout(
            notification.hideTimer
        );

        notification.hideTimer =
            setTimeout(() => {

                notification.classList.remove(
                    "show"
                );

            }, 2000);
    }


    /* =================================================
       ESCAPE HTML
    ================================================= */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =================================================
       INITIALIZE
    ================================================= */

    updateCartCount();
    renderCart();

});