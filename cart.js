/* =====================================================
   CLICON PRODUCT / CART / QUICK VIEW JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       CART STORAGE
    ================================================= */

    let cart = JSON.parse(
        localStorage.getItem("cliconCart")
    ) || [];


    /* =================================================
       ELEMENTS
    ================================================= */

    const cartCount =
        document.getElementById("cartCount");

    const modal =
        document.getElementById("quickViewModal");

    const modalImage =
        document.getElementById("quickViewImage");

    const modalTitle =
        document.getElementById("quickViewTitle");

    const modalSku =
        document.getElementById("quickViewSku");

    const modalBrand =
        document.getElementById("quickViewBrand");

    const modalCategory =
        document.getElementById("quickViewCategory");

    const modalPrice =
        document.getElementById("quickViewPrice");

    const modalOldPrice =
        document.getElementById("quickViewOldPrice");

    const modalQuantity =
        document.getElementById("quickViewQuantity");

    const modalMinus =
        document.getElementById("quickViewMinus");

    const modalPlus =
        document.getElementById("quickViewPlus");

    const modalAddCart =
        document.getElementById("quickViewAddCart");

    const modalBuy =
        document.getElementById("quickViewBuy");

    const modalClose =
        document.getElementById("quickViewClose");


    /* =================================================
       CART COUNT
    ================================================= */

    function updateCartCount() {

        if (!cartCount) {
            return;
        }

        const totalItems = cart.reduce(
            (total, item) => {
                return total +
                    Number(item.quantity || 0);
            },
            0
        );

        cartCount.textContent = totalItems;
    }


    /* =================================================
       SAVE CART
    ================================================= */

    function saveCart() {

        localStorage.setItem(
            "cliconCart",
            JSON.stringify(cart)
        );

        updateCartCount();
    }


    /* =================================================
       GET PRODUCT DATA
    ================================================= */

    function getProductData(product) {

        if (!product) {
            return null;
        }

        const id =
            product.dataset.productId ||
            "product";

        const name =
            product.dataset.productName ||
            product.querySelector("h3")?.textContent.trim() ||
            product.querySelector("p")?.textContent.trim() ||
            "Product";

        const price =
            parseFloat(
                product.dataset.productPrice
            ) || 0;

        const oldPriceValue =
            parseFloat(
                product.dataset.productOldPrice
            );

        const oldPrice =
            Number.isNaN(oldPriceValue)
                ? price * 1.2
                : oldPriceValue;

        const image =
            product.dataset.productImage ||
            product.querySelector("img")?.getAttribute("src") ||
            "";

        const brand =
            product.dataset.productBrand ||
            "Apple";

        const category =
            product.dataset.productCategory ||
            "Electronics Devices";

        const sku =
            product.dataset.productSku ||
            id
                .replace("product-", "")
                .toUpperCase();

        return {
            id,
            name,
            price,
            oldPrice,
            image,
            brand,
            category,
            sku
        };
    }


    /* =================================================
       CART SUCCESS POPUP
    ================================================= */

    function showCartMessage(productName) {

        /* Remove an existing popup */

        const oldMessage =
            document.getElementById(
                "cartNotification"
            );

        if (oldMessage) {
            oldMessage.remove();
        }


        /* Create popup */

        const message =
            document.createElement("div");

        message.id =
            "cartNotification";

        message.className =
            "cart-notification";


        message.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <span>
                ${productName} added to cart
            </span>
        `;


        /* Add popup to page */

        document.body.appendChild(message);


        /* Force browser to recognize initial state */

        requestAnimationFrame(() => {

            message.classList.add("show");

        });


        /* Remove popup after 2.2 seconds */

        setTimeout(() => {

            message.classList.remove("show");

            setTimeout(() => {

                if (message.parentNode) {
                    message.remove();
                }

            }, 300);

        }, 2200);
    }


    /* =================================================
       ADD TO CART
    ================================================= */

    function addToCart(
        product,
        quantity = 1
    ) {

        if (!product) {
            return;
        }


        const productData =
            getProductData(product);


        if (!productData) {
            return;
        }


        quantity =
            Number(quantity);


        if (
            Number.isNaN(quantity) ||
            quantity < 1
        ) {
            quantity = 1;
        }


        const existingProduct =
            cart.find(item =>
                String(item.id) ===
                String(productData.id)
            );


        /* ---------------------------------------------
           EXISTING PRODUCT
        --------------------------------------------- */

        if (existingProduct) {

            existingProduct.quantity =
                Number(
                    existingProduct.quantity || 0
                ) + quantity;

        }


        /* ---------------------------------------------
           NEW PRODUCT
        --------------------------------------------- */

        else {

            cart.push({

                id: productData.id,

                name: productData.name,

                price: productData.price,

                oldPrice: productData.oldPrice,

                image: productData.image,

                brand: productData.brand,

                category: productData.category,

                sku: productData.sku,

                quantity: quantity

            });

        }


        /* Save */

        saveCart();


        /* Show success popup */

        showCartMessage(
            productData.name
        );
    }


    /* =================================================
       ADD TO CART BUTTONS
    ================================================= */

    document
        .querySelectorAll(
            '[data-action="add-cart"]'
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();


                    const product =
                        button.closest(
                            ".product-card"
                        );


                    if (!product) {
                        return;
                    }


                    addToCart(product);

                }
            );

        });


    /* =================================================
       QUICK VIEW STATE
    ================================================= */

    let currentProduct = null;

    let currentQuantity = 1;


    /* =================================================
       OPEN QUICK VIEW
    ================================================= */

    function openQuickView(product) {

        if (!product || !modal) {
            return;
        }


        const data =
            getProductData(product);


        if (!data) {
            return;
        }


        currentProduct =
            product;

        currentQuantity =
            1;


        /* IMAGE */

        if (modalImage) {

            modalImage.src =
                data.image;

            modalImage.alt =
                data.name;
        }


        /* TITLE */

        if (modalTitle) {

            modalTitle.textContent =
                data.name;
        }


        /* SKU */

        if (modalSku) {

            modalSku.textContent =
                data.sku;
        }


        /* BRAND */

        if (modalBrand) {

            modalBrand.textContent =
                data.brand;
        }


        /* CATEGORY */

        if (modalCategory) {

            modalCategory.textContent =
                data.category;
        }


        /* PRICE */

        if (modalPrice) {

            modalPrice.textContent =
                `$${data.price.toFixed(2)}`;
        }


        /* OLD PRICE */

        if (modalOldPrice) {

            if (
                data.oldPrice > data.price
            ) {

                modalOldPrice.textContent =
                    `$${data.oldPrice.toFixed(2)}`;

                modalOldPrice.style.display =
                    "inline";

            } else {

                modalOldPrice.style.display =
                    "none";
            }
        }


        /* QUANTITY */

        if (modalQuantity) {

            modalQuantity.textContent =
                currentQuantity;
        }


        /* OPEN */

        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "quick-view-open"
        );
    }


    /* =================================================
       CLOSE QUICK VIEW
    ================================================= */

    function closeQuickView() {

        if (!modal) {
            return;
        }


        modal.classList.remove(
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "quick-view-open"
        );


        currentProduct =
            null;

        currentQuantity =
            1;
    }


    /* =================================================
       QUICK VIEW CLOSE
    ================================================= */

    if (modalClose) {

        modalClose.addEventListener(
            "click",
            event => {

                event.preventDefault();

                closeQuickView();

            }
        );
    }


    /* =================================================
       CLICK OUTSIDE QUICK VIEW
    ================================================= */

    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
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

            if (
                event.key === "Escape" &&
                modal?.classList.contains(
                    "active"
                )
            ) {

                closeQuickView();

            }

        }
    );


    /* =================================================
       QUICK VIEW QUANTITY MINUS
    ================================================= */

    if (modalMinus) {

        modalMinus.addEventListener(
            "click",
            event => {

                event.preventDefault();

                if (
                    currentQuantity <= 1
                ) {
                    return;
                }


                currentQuantity--;


                if (modalQuantity) {

                    modalQuantity.textContent =
                        currentQuantity;

                }

            }
        );
    }


    /* =================================================
       QUICK VIEW QUANTITY PLUS
    ================================================= */

    if (modalPlus) {

        modalPlus.addEventListener(
            "click",
            event => {

                event.preventDefault();


                currentQuantity++;


                if (modalQuantity) {

                    modalQuantity.textContent =
                        currentQuantity;

                }

            }
        );
    }


    /* =================================================
       QUICK VIEW ADD TO CART
    ================================================= */

    if (modalAddCart) {

        modalAddCart.addEventListener(
            "click",
            event => {

                event.preventDefault();


                if (!currentProduct) {
                    return;
                }


                addToCart(
                    currentProduct,
                    currentQuantity
                );


                closeQuickView();

            }
        );
    }


    /* =================================================
       QUICK VIEW BUY NOW
    ================================================= */

    if (modalBuy) {

        modalBuy.addEventListener(
            "click",
            event => {

                event.preventDefault();


                if (!currentProduct) {
                    return;
                }


                addToCart(
                    currentProduct,
                    currentQuantity
                );


                window.location.href =
                    "cart.html";

            }
        );
    }


    /* =================================================
       PRODUCT IMAGE → QUICK VIEW
    ================================================= */

    document
        .querySelectorAll(
            ".product-card img"
        )
        .forEach(image => {

            image.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();


                    const product =
                        image.closest(
                            ".product-card"
                        );


                    if (!product) {
                        return;
                    }


                    openQuickView(product);

                }
            );


            image.style.cursor =
                "pointer";

        });


    /* =================================================
       EYE / QUICK VIEW BUTTON
    ================================================= */

    document
        .querySelectorAll(
            '.product-card [data-action="quick-view"]'
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();


                    const product =
                        button.closest(
                            ".product-card"
                        );


                    if (!product) {
                        return;
                    }


                    openQuickView(product);

                }
            );

        });


    /* =================================================
       WISHLIST
    ================================================= */

    document
        .querySelectorAll(
            '.product-card [data-action="wishlist"]'
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();


                    button.classList.toggle(
                        "active"
                    );


                    const icon =
                        button.querySelector("i");


                    if (!icon) {
                        return;
                    }


                    const active =
                        button.classList.contains(
                            "active"
                        );


                    icon.classList.toggle(
                        "fa-solid",
                        active
                    );

                    icon.classList.toggle(
                        "fa-regular",
                        !active
                    );


                    button.setAttribute(
                        "aria-label",
                        active
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                    );

                }
            );

        });


    /* =================================================
       PRODUCT CARD CURSOR
    ================================================= */

    document
        .querySelectorAll(
            ".product-card"
        )
        .forEach(product => {

            product.style.cursor =
                "default";

        });


    /* =================================================
       SHOP WITH CATEGORY SLIDER
    ================================================= */

    const categoryTrack =
        document.getElementById(
            "categoryTrack"
        );

    const categoryPrev =
        document.getElementById(
            "categoryPrev"
        );

    const categoryNext =
        document.getElementById(
            "categoryNext"
        );

    const categoryDots =
        document.querySelectorAll(
            ".category-dot"
        );


    if (
        categoryTrack &&
        categoryPrev &&
        categoryNext
    ) {

        const categoryCards =
            categoryTrack.querySelectorAll(
                ".category-card"
            );


        let currentSlide = 0;


        /* =============================================
           VISIBLE CARDS
        ============================================= */

        function getVisibleCards() {

            const width =
                window.innerWidth;


            if (width <= 600) {
                return 1;
            }


            if (width <= 900) {
                return 2;
            }


            if (width <= 1100) {
                return 3;
            }


            return 4;
        }


        /* =============================================
           MAXIMUM SLIDE
        ============================================= */

        function getMaxSlide() {

            const visibleCards =
                getVisibleCards();


            return Math.max(
                0,
                categoryCards.length -
                visibleCards
            );
        }


        /* =============================================
           UPDATE CATEGORY SLIDER
        ============================================= */

        function updateCategorySlider() {

            if (
                !categoryCards.length
            ) {
                return;
            }


            const cardWidth =
                categoryCards[0]
                    .getBoundingClientRect()
                    .width;


            const trackStyle =
                window.getComputedStyle(
                    categoryTrack
                );


            const gap =
                parseFloat(
                    trackStyle.gap
                ) || 0;


            const maxSlide =
                getMaxSlide();


            /* Prevent invalid slide */

            if (
                currentSlide >
                maxSlide
            ) {

                currentSlide =
                    maxSlide;
            }


            if (
                currentSlide < 0
            ) {

                currentSlide =
                    0;
            }


            /* Move slider */

            const moveDistance =
                currentSlide *
                (cardWidth + gap);


            categoryTrack.style.transform =
                `translateX(-${moveDistance}px)`;


            /* =========================================
               INDICATORS
            ========================================= */

            categoryDots.forEach(
                (dot, index) => {

                    /*
                       Only show dots that represent
                       actual slider positions.
                    */

                    const valid =
                        index <= maxSlide;


                    dot.style.display =
                        valid
                            ? ""
                            : "none";


                    dot.classList.toggle(
                        "active",
                        index === currentSlide
                    );

                }
            );


            /* =========================================
               PREVIOUS ARROW
            ========================================= */

            categoryPrev.disabled =
                currentSlide === 0;


            /* =========================================
               NEXT ARROW
            ========================================= */

            categoryNext.disabled =
                currentSlide >= maxSlide;

        }


        /* =============================================
           NEXT ARROW
        ============================================= */

        categoryNext.addEventListener(
            "click",
            event => {

                event.preventDefault();


                const maxSlide =
                    getMaxSlide();


                if (
                    currentSlide <
                    maxSlide
                ) {

                    currentSlide++;

                    updateCategorySlider();

                }

            }
        );


        /* =============================================
           PREVIOUS ARROW
        ============================================= */

        categoryPrev.addEventListener(
            "click",
            event => {

                event.preventDefault();


                if (
                    currentSlide > 0
                ) {

                    currentSlide--;

                    updateCategorySlider();

                }

            }
        );


        /* =============================================
           INDICATORS
        ============================================= */

        categoryDots.forEach(
            dot => {

                dot.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();


                        const slide =
                            Number(
                                dot.dataset.slide
                            );


                        if (
                            Number.isNaN(slide)
                        ) {
                            return;
                        }


                        const maxSlide =
                            getMaxSlide();


                        currentSlide =
                            Math.max(
                                0,
                                Math.min(
                                    slide,
                                    maxSlide
                                )
                            );


                        updateCategorySlider();

                    }
                );

            }
        );


        /* =============================================
           WINDOW RESIZE
        ============================================= */

        window.addEventListener(
            "resize",
            () => {

                const maxSlide =
                    getMaxSlide();


                if (
                    currentSlide >
                    maxSlide
                ) {

                    currentSlide =
                        maxSlide;

                }


                updateCategorySlider();

            }
        );


        /* =============================================
           INITIALIZE SLIDER
        ============================================= */

        updateCategorySlider();

    }


    /* =================================================
       INITIAL CART COUNT
    ================================================= */

    updateCartCount();

});