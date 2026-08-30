
/* =========================================================
   ASAD CAMERA TECHNOLOGY
   COMPLETE CORRECTED JAVASCRIPT
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const toast = document.getElementById("toast");

    const cartButton = document.getElementById("cartButton");
    const cartModal = document.getElementById("cartModal");
    const closeCart = document.getElementById("closeCart");
    const cartText = document.getElementById("cartText");
    const cartCounter = document.getElementById("cartCount");
    const checkoutButton = document.getElementById("checkoutButton");

    const checkoutModal = document.getElementById("checkoutModal");
    const checkoutForm = document.getElementById("checkoutForm");
    const closeCheckout = document.getElementById("closeCheckout");
    const checkoutSummary = document.getElementById("checkoutSummary");

    const mobileButton = document.getElementById("mobileButton");
    const mobileNavigation = document.getElementById("mobileNavigation");

    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const searchForm = document.getElementById("searchForm");

    const newsletterForm = document.getElementById("newsletterForm");

    const accountButton = document.getElementById("accountButton");


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        if (!toast) return;

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(showToast.timer);

        showToast.timer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }


    /* =====================================================
       SHOPPING CART
    ===================================================== */

    let cart = [];

    /*
       Load cart from localStorage.
       This means products stay in the cart after refresh.
    */

    try {

        const savedCart =
            localStorage.getItem("asadCameraCart");

        if (savedCart) {

            const parsedCart =
                JSON.parse(savedCart);

            if (Array.isArray(parsedCart)) {
                cart = parsedCart;
            }
        }

    } catch (error) {

        console.warn(
            "Could not load saved cart.",
            error
        );

        cart = [];
    }


    /* =====================================================
       SAVE CART
    ===================================================== */

    function saveCart() {

        try {

            localStorage.setItem(
                "asadCameraCart",
                JSON.stringify(cart)
            );

        } catch (error) {

            console.warn(
                "Could not save cart.",
                error
            );

        }

    }


    /* =====================================================
       UPDATE CART COUNTER
    ===================================================== */

    function updateCartDisplay() {

        const totalItems =
            cart.reduce(
                (total, item) =>
                    total + Number(item.quantity || 0),
                0
            );


        if (cartCounter) {

            cartCounter.textContent =
                totalItems;

        }

    }


    /* =====================================================
       CART TOTAL
    ===================================================== */

    function getCartTotal() {

        return cart.reduce(
            (total, item) => {

                const price =
                    Number(item.price) || 0;

                const quantity =
                    Number(item.quantity) || 0;

                return total + (price * quantity);

            },
            0
        );

    }


    /* =====================================================
       ADD PRODUCT TO CART
    ===================================================== */

    document
        .querySelectorAll(".add-cart")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const card =
                        this.closest(
                            ".product-card, .laptop-card"
                        );

                    if (!card) return;


                    const nameElement =
                        card.querySelector("h3");


                    const priceElement =
                        card.querySelector(
                            ".product-bottom strong, .laptop-info strong"
                        );


                    const name =
                        nameElement
                            ? nameElement.textContent.trim()
                            : "Product";


                    const priceText =
                        priceElement
                            ? priceElement.textContent.trim()
                            : "Rs. 0";


                    const price =
                        parseInt(
                            priceText.replace(/[^\d]/g, ""),
                            10
                        ) || 0;


                    if (price <= 0) {

                        showToast(
                            "Product price is not available."
                        );

                        return;

                    }


                    /* Check if product already exists */

                    const existingProduct =
                        cart.find(
                            item =>
                                item.name === name
                        );


                    if (existingProduct) {

                        existingProduct.quantity =
                            Number(
                                existingProduct.quantity
                            ) + 1;

                    } else {

                        cart.push({

                            name: name,

                            price: price,

                            quantity: 1

                        });

                    }


                    saveCart();

                    updateCartDisplay();


                    showToast(
                        `${name} added to cart`
                    );


                    /* Button animation */

                    const originalText =
                        this.dataset.originalText ||
                        this.textContent.trim();


                    this.dataset.originalText =
                        originalText;


                    this.textContent =
                        "✓ ADDED";


                    this.classList.add("added");

                    this.disabled = true;


                    setTimeout(() => {

                        this.textContent =
                            originalText;

                        this.classList.remove(
                            "added"
                        );

                        this.disabled = false;

                    }, 1000);

                }
            );

        });


    /* =====================================================
       UPDATE CART MESSAGE
    ===================================================== */

    function updateCartMessage() {

        if (!cartText) return;


        if (cart.length === 0) {

            cartText.textContent =
                "Your cart is currently empty.";

            if (checkoutButton) {
                checkoutButton.disabled = true;
            }

            return;

        }


        if (checkoutButton) {
            checkoutButton.disabled = false;
        }


        const totalItems =
            cart.reduce(
                (total, item) =>
                    total + Number(item.quantity || 0),
                0
            );


        cartText.innerHTML = `

            <strong>
                ${totalItems}
                product${totalItems !== 1 ? "s" : ""}
            </strong>

            <div style="
                margin-top:15px;
                text-align:left;
                max-height:220px;
                overflow-y:auto;
            ">

                ${cart.map(item => `

                    <div style="
                        padding:10px 0;
                        border-bottom:1px solid #ddd;
                    ">

                        <strong>
                            ${escapeHTML(item.name)}
                        </strong>

                        <br>

                        <small>
                            ${item.quantity} × Rs.
                            ${Number(item.price).toLocaleString()}
                        </small>

                    </div>

                `).join("")}

            </div>

            <div style="
                margin-top:15px;
                font-size:20px;
                font-weight:800;
            ">

                Total:
                Rs. ${getCartTotal().toLocaleString()}

            </div>

        `;

    }


    /* =====================================================
       HTML ESCAPE
       Prevents product names from inserting HTML.
    ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       OPEN CART
    ===================================================== */

    if (cartButton && cartModal) {

        cartButton.addEventListener(
            "click",
            () => {

                updateCartMessage();

                cartModal.classList.add("active");

                cartModal.setAttribute(
                    "aria-hidden",
                    "false"
                );

                document.body.classList.add(
                    "modal-open"
                );

            }
        );

    }


    /* =====================================================
       CLOSE CART
    ===================================================== */

    function closeCartModal() {

        if (!cartModal) return;

        cartModal.classList.remove(
            "active"
        );

        cartModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


    if (closeCart) {

        closeCart.addEventListener(
            "click",
            closeCartModal
        );

    }


    /* Close cart by clicking outside */

    if (cartModal) {

        cartModal.addEventListener(
            "click",
            event => {

                if (
                    event.target === cartModal
                ) {

                    closeCartModal();

                }

            }
        );

    }


    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    if (
        mobileButton &&
        mobileNavigation
    ) {

        mobileButton.addEventListener(
            "click",
            () => {

                const isActive =
                    mobileNavigation.classList.toggle(
                        "active"
                    );


                mobileButton.setAttribute(
                    "aria-expanded",
                    isActive
                        ? "true"
                        : "false"
                );


                mobileButton.textContent =
                    isActive
                        ? "✕"
                        : "☰";

            }
        );

    }


    /* =====================================================
       MOBILE DROPDOWNS
    ===================================================== */

    document
        .querySelectorAll(
            ".mobile-category-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const submenu =
                        button.nextElementSibling;


                    if (!submenu) return;


                    submenu.classList.toggle(
                        "active"
                    );


                    const icon =
                        button.querySelector(
                            "span"
                        );


                    if (icon) {

                        icon.textContent =
                            submenu.classList.contains(
                                "active"
                            )
                                ? "−"
                                : "+";

                    }

                }
            );

        });


    /* =====================================================
       CLOSE MOBILE NAV WHEN LINK IS CLICKED
    ===================================================== */

    document
        .querySelectorAll(
            ".mobile-navigation a"
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    if (!mobileNavigation) {
                        return;
                    }


                    mobileNavigation.classList.remove(
                        "active"
                    );


                    if (mobileButton) {

                        mobileButton.textContent =
                            "☰";


                        mobileButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }

                }
            );

        });


    /* =====================================================
       SEARCH
    ===================================================== */

    const searchableCards =
        Array.from(
            document.querySelectorAll(
                [
                    ".product-card",
                    ".laptop-card",
                    ".network-card",
                    ".gaming-card",
                    ".category-box",
                    ".accessory-box",
                    ".brand-card"
                ].join(",")
            )
        );


    /* =====================================================
       NO RESULTS ELEMENT
    ===================================================== */

    let noResults =
        document.getElementById(
            "noSearchResults"
        );


    if (!noResults) {

        noResults =
            document.createElement(
                "div"
            );


        noResults.id =
            "noSearchResults";


        noResults.innerHTML = `

            <div class="no-results-inner">

                <span>🔎</span>

                <strong>
                    NO PRODUCTS FOUND
                </strong>

                <p>
                    Try searching for CCTV,
                    SSD, HDD, mouse, keyboard,
                    laptop, gaming, networking
                    or another product.
                </p>

            </div>

        `;


        noResults.style.display =
            "none";


        document.body.appendChild(
            noResults
        );

    }


    /* =====================================================
       SEARCH FUNCTION
    ===================================================== */

    function searchProducts(
        scrollToResult = false
    ) {

        if (!searchInput) return;


        const searchValue =
            searchInput.value
                .toLowerCase()
                .trim();


        let foundProducts = 0;


        /* Empty search */

        if (searchValue === "") {

            searchableCards.forEach(
                card => {

                    card.classList.remove(
                        "search-hidden"
                    );

                }
            );


            noResults.style.display =
                "none";


            return;

        }


        /* Search cards */

        searchableCards.forEach(
            card => {

                const cardText =
                    card.textContent
                        .toLowerCase();


                if (
                    cardText.includes(
                        searchValue
                    )
                ) {

                    card.classList.remove(
                        "search-hidden"
                    );

                    foundProducts++;

                } else {

                    card.classList.add(
                        "search-hidden"
                    );

                }

            }
        );


        /* No results */

        noResults.style.display =
            foundProducts === 0
                ? "block"
                : "none";


        /* Scroll to first result */

        if (
            scrollToResult &&
            foundProducts > 0
        ) {

            const firstVisible =
                searchableCards.find(
                    card =>
                        !card.classList.contains(
                            "search-hidden"
                        )
                );


            if (firstVisible) {

                firstVisible.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

        }

    }


    /* =====================================================
       SEARCH FORM
    ===================================================== */

    if (searchForm) {

        searchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                searchProducts(true);

            }
        );

    }


    /* =====================================================
       SEARCH BUTTON
    ===================================================== */

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                searchProducts(true);

            }
        );

    }


    /* =====================================================
       LIVE SEARCH
    ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                searchProducts(false);

            }
        );


        searchInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {

                    searchInput.value = "";

                    searchProducts(false);

                    searchInput.blur();

                }

            }
        );

    }


    /* =====================================================
       NEWSLETTER
    ===================================================== */

    if (newsletterForm) {

        newsletterForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const emailInput =
                    newsletterForm.querySelector(
                        'input[type="email"]'
                    );


                if (
                    !emailInput ||
                    !emailInput.value.trim()
                ) {

                    showToast(
                        "Please enter your email."
                    );

                    return;

                }


                showToast(
                    "Thanks for subscribing!"
                );


                newsletterForm.reset();

            }
        );

    }


    /* =====================================================
       ACCOUNT BUTTON
    ===================================================== */

    if (accountButton) {

        accountButton.addEventListener(
            "click",
            () => {

                showToast(
                    "Account section coming soon."
                );

            }
        );

    }


    /* =====================================================
       CHECKOUT SUMMARY
    ===================================================== */

    function updateCheckoutSummary() {

        if (!checkoutSummary) return;


        if (cart.length === 0) {

            checkoutSummary.innerHTML = `

                <div class="checkout-empty">
                    Your cart is empty.
                </div>

            `;

            return;

        }


        checkoutSummary.innerHTML = `

            <h3>
                ORDER SUMMARY
            </h3>

            ${cart.map(item => `

                <div class="checkout-item">

                    <span>
                        ${escapeHTML(item.name)}
                        × ${item.quantity}
                    </span>

                    <strong>
                        Rs.
                        ${(Number(item.price) *
                          Number(item.quantity))
                            .toLocaleString()}
                    </strong>

                </div>

            `).join("")}


            <div class="checkout-total">

                <span>
                    TOTAL
                </span>

                <strong>
                    Rs.
                    ${getCartTotal()
                        .toLocaleString()}
                </strong>

            </div>

        `;

    }


    /* =====================================================
       OPEN CHECKOUT
    ===================================================== */

    if (checkoutButton) {

        checkoutButton.addEventListener(
            "click",
            () => {

                if (cart.length === 0) {

                    showToast(
                        "Your cart is empty."
                    );

                    return;

                }


                updateCheckoutSummary();


                if (!checkoutModal) {

                    showToast(
                        "Checkout is unavailable."
                    );

                    return;

                }


                checkoutModal.classList.add(
                    "active"
                );


                checkoutModal.setAttribute(
                    "aria-hidden",
                    "false"
                );


                document.body.classList.add(
                    "modal-open"
                );

            }
        );

    }


    /* =====================================================
       CLOSE CHECKOUT
    ===================================================== */

    function closeCheckoutModal() {

        if (!checkoutModal) return;


        checkoutModal.classList.remove(
            "active"
        );


        checkoutModal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "modal-open"
        );

    }


    if (closeCheckout) {

        closeCheckout.addEventListener(
            "click",
            closeCheckoutModal
        );

    }


    /* Close checkout by clicking outside */

    if (checkoutModal) {

        checkoutModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    checkoutModal
                ) {

                    closeCheckoutModal();

                }

            }
        );

    }


    /* =====================================================
       PHONE VALIDATION
    ===================================================== */

    function isValidPakistanPhone(
        phone
    ) {

        const cleaned =
            phone.replace(
                /[\s\-()]/g,
                ""
            );


        return (
            /^03\d{9}$/.test(cleaned) ||
            /^\+923\d{9}$/.test(cleaned) ||
            /^923\d{9}$/.test(cleaned)
        );

    }


    /* =====================================================
       PLACE ORDER
    ===================================================== */

    if (checkoutForm) {

        checkoutForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                if (cart.length === 0) {

                    showToast(
                        "Your cart is empty."
                    );

                    return;

                }


                const nameInput =
                    document.getElementById(
                        "customerName"
                    );


                const phoneInput =
                    document.getElementById(
                        "customerPhone"
                    );


                const addressInput =
                    document.getElementById(
                        "customerAddress"
                    );


                const cityInput =
                    document.getElementById(
                        "customerCity"
                    );


                const paymentInput =
                    document.getElementById(
                        "paymentMethod"
                    );


                if (
                    !nameInput ||
                    !phoneInput ||
                    !addressInput ||
                    !cityInput ||
                    !paymentInput
                ) {

                    showToast(
                        "Checkout form is incomplete."
                    );

                    return;

                }


                const name =
                    nameInput.value.trim();


                const phone =
                    phoneInput.value.trim();


                const address =
                    addressInput.value.trim();


                const city =
                    cityInput.value.trim();


                const payment =
                    paymentInput.value;


                /* Basic validation */

                if (
                    name.length < 2
                ) {

                    showToast(
                        "Please enter your full name."
                    );

                    nameInput.focus();

                    return;

                }


                if (
                    !isValidPakistanPhone(
                        phone
                    )
                ) {

                    showToast(
                        "Please enter a valid Pakistani phone number."
                    );

                    phoneInput.focus();

                    return;

                }


                if (
                    address.length < 5
                ) {

                    showToast(
                        "Please enter your complete address."
                    );

                    addressInput.focus();

                    return;

                }


                if (
                    city.length < 2
                ) {

                    showToast(
                        "Please enter your city."
                    );

                    cityInput.focus();

                    return;

                }


                /* =================================================
                   CREATE ORDER NUMBER
                ================================================= */

                const orderNumber =
                    "ACT-" +
                    Date.now()
                        .toString()
                        .slice(-6);


                /* =================================================
                   CREATE PRODUCT LIST
                ================================================= */

                let orderItems = "";


                cart.forEach(item => {

                    const itemTotal =
                        Number(item.price) *
                        Number(item.quantity);


                    orderItems +=
                        `• ${item.name} × ${item.quantity} = Rs. ${itemTotal.toLocaleString()}\n`;

                });


                /* =================================================
                   ORDER TOTAL
                ================================================= */

                const total =
                    getCartTotal();


                /* =================================================
                   IMPORTANT
                   REPLACE WITH YOUR REAL WHATSAPP NUMBER

                   Example:
                   923001234567

                   DO NOT USE:
                   +92
                   spaces
                   dashes
                ================================================= */

                const storeWhatsApp =
                    "923000000000";


                /* =================================================
                   WHATSAPP MESSAGE
                ================================================= */

                const message =

`🛒 *NEW ORDER - ASAD CAMERA TECHNOLOGY*

Order No: *${orderNumber}*

👤 *CUSTOMER*
Name: ${name}
Phone: ${phone}

📍 *DELIVERY ADDRESS*
${address}
${city}

📦 *ORDER*
${orderItems}
💰 *TOTAL: Rs. ${total.toLocaleString()}*

💳 Payment: ${payment}

Please confirm this order.`;


                /* =================================================
                   CREATE WHATSAPP URL
                ================================================= */

                const whatsappURL =
                    "https://wa.me/" +
                    storeWhatsApp +
                    "?text=" +
                    encodeURIComponent(
                        message
                    );


                /* =================================================
                   OPEN WHATSAPP
                ================================================= */

                const whatsappWindow =
                    window.open(
                        whatsappURL,
                        "_blank"
                    );


                /*
                   Some browsers block popups.
                   If blocked, tell the customer.
                */

                if (!whatsappWindow) {

                    showToast(
                        "Please allow pop-ups to open WhatsApp."
                    );

                    return;

                }


                /* =================================================
                   CLEAR CART
                ================================================= */

                cart = [];

                saveCart();

                updateCartDisplay();


                /* =================================================
                   RESET FORM
                ================================================= */

                checkoutForm.reset();


                /* =================================================
                   CLOSE MODALS
                ================================================= */

                closeCheckoutModal();

                closeCartModal();


                /* =================================================
                   SUCCESS MESSAGE
                ================================================= */

                showToast(
                    "Order prepared successfully!"
                );

            }
        );

    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            closeCartModal();

            closeCheckoutModal();


            if (mobileNavigation) {

                mobileNavigation.classList.remove(
                    "active"
                );

            }


            if (mobileButton) {

                mobileButton.textContent =
                    "☰";


                mobileButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealTargets =
        document.querySelectorAll(
            "[data-reveal]"
        );


    if (
        "IntersectionObserver" in window &&
        revealTargets.length
    ) {

        const revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "in-view"
                                );


                                revealObserver.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.12,
                    rootMargin:
                        "0px 0px -40px 0px"
                }
            );


        revealTargets.forEach(
            target => {

                revealObserver.observe(
                    target
                );

            }
        );

    } else {

        revealTargets.forEach(
            target => {

                target.classList.add(
                    "in-view"
                );

            }
        );

    }


    /* =====================================================
       SMOOTH INTERNAL LINKS
    ===================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        });


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    updateCartDisplay();

    updateCartMessage();


    console.log(
        "ASAD CAMERA TECHNOLOGY website loaded successfully."
    );

});

