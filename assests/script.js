'use strict';

/* =========================================================
   ASAD CAMERA TECHNOLOGY
   COMPLETE CORRECTED JAVASCRIPT
========================================================= */

/* =========================================================
   CONFIG
========================================================= */

const STORE_WHATSAPP = '923115593745';
const CART_KEY = 'asadCameraCart';
const USER_KEY = 'asadCameraUser';
const ORDERS_KEY = 'asadCameraOrders';
const LAST_ORDER_KEY = 'asadCameraLastOrder';


/* =========================================================
   STATE
========================================================= */

const state = {
    cart: JSON.parse(localStorage.getItem(CART_KEY) || '[]'),
    user: JSON.parse(localStorage.getItem(USER_KEY) || 'null')
};


/* =========================================================
   HELPERS
========================================================= */

const $ = (selector, root = document) =>
    root.querySelector(selector);

const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

const money = number =>
    `Rs. ${Number(number || 0).toLocaleString('en-PK')}`;

const escapeHTML = value =>
    String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));


/* =========================================================
   TOAST
========================================================= */

function toast(message, type = '') {

    let element = $('#toast');

    if (!element) {
        element = document.createElement('div');
        element.id = 'toast';
        element.className = 'toast';
        document.body.appendChild(element);
    }

    element.textContent = message;
    element.className = `toast show ${type}`;

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        element.classList.remove('show');
    }, 2800);
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
}

function saveUser() {
    if (state.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    } else {
        localStorage.removeItem(USER_KEY);
    }
}

function getOrders() {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
}

function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}


/* =========================================================
   CART CALCULATIONS
========================================================= */

function cartCount() {

    return state.cart.reduce(
        (total, product) =>
            total + Number(product.quantity || 0),
        0
    );
}

function cartTotal() {

    return state.cart.reduce(
        (total, product) =>
            total +
            Number(product.price || 0) *
            Number(product.quantity || 0),
        0
    );
}


/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {

    const element = $('#cartCount');

    if (!element) return;

    element.textContent = cartCount();

    element.classList.remove('bump');

    void element.offsetWidth;

    element.classList.add('bump');
}


/* =========================================================
   PRODUCT INFORMATION
========================================================= */

function getProductName(card) {

    if (!card) return 'Product';

    const title =
        $('h3', card) ||
        $('h2', card) ||
        $('.product-title', card) ||
        $('.laptop-title', card);

    return title
        ? title.textContent.trim()
        : 'Product';
}

function getProductPrice(card) {

    if (!card) return 0;

    const priceElement =
        $('.product-bottom strong', card) ||
        $('.laptop-info strong', card) ||
        $('.price', card) ||
        $('.product-price', card);

    if (!priceElement) return 0;

    const priceText = priceElement.textContent || '';

    return parseInt(
        priceText.replace(/[^\d]/g, ''),
        10
    ) || 0;
}


/* =========================================================
   ADD TO CART
========================================================= */

function addToCart(card) {

    if (!card) {
        toast('Product could not be found.');
        return;
    }

    const name = getProductName(card);
    const price = getProductPrice(card);

    if (!price) {
        toast('Product price is unavailable.');
        return;
    }

    const existing = state.cart.find(
        product => product.name === name
    );

    if (existing) {

        existing.quantity =
            Number(existing.quantity || 0) + 1;

    } else {

        state.cart.push({
            name,
            price,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    renderCart();

    toast(`${name} added to cart`, 'success');
}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

    const container = $('#cartText');
    const checkoutButton = $('#checkoutButton');

    if (!container) return;

    if (!state.cart.length) {

        container.innerHTML = `
            <div class="cart-empty-state">
                <div class="empty-icon">🛒</div>

                <strong>Your cart is empty</strong>

                <span>
                    Add products from the store to begin checkout.
                </span>
            </div>
        `;

        if (checkoutButton) {
            checkoutButton.disabled = true;
        }

        return;
    }

    if (checkoutButton) {
        checkoutButton.disabled = false;
    }

    container.innerHTML = `
        <div class="cart-items">

            ${state.cart.map((product, index) => `

                <div class="cart-line">

                    <div class="cart-line-main">

                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>

                        <small>
                            ${money(product.price)} each
                        </small>

                    </div>

                    <div class="qty-control">

                        <button
                            type="button"
                            data-cart-action="minus"
                            data-index="${index}">
                            −
                        </button>

                        <b>${product.quantity}</b>

                        <button
                            type="button"
                            data-cart-action="plus"
                            data-index="${index}">
                            +
                        </button>

                    </div>

                    <strong class="line-total">
                        ${money(
                            Number(product.price) *
                            Number(product.quantity)
                        )}
                    </strong>

                    <button
                        type="button"
                        class="remove-line"
                        data-cart-action="remove"
                        data-index="${index}"
                        aria-label="Remove product">
                        ×
                    </button>

                </div>

            `).join('')}

        </div>

        <div class="cart-total-row">

            <span>Subtotal</span>

            <strong>
                ${money(cartTotal())}
            </strong>

        </div>
    `;
}


/* =========================================================
   CART ACTIONS
========================================================= */

function handleCartAction(event) {

    const button =
        event.target.closest('[data-cart-action]');

    if (!button) return;

    const index =
        Number(button.dataset.index);

    const action =
        button.dataset.cartAction;

    if (!state.cart[index]) return;

    if (action === 'plus') {

        state.cart[index].quantity++;

    } else if (action === 'minus') {

        state.cart[index].quantity--;

        if (state.cart[index].quantity <= 0) {
            state.cart.splice(index, 1);
        }

    } else if (action === 'remove') {

        state.cart.splice(index, 1);
    }

    saveCart();
    updateCartCount();
    renderCart();
}


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {

    const element = document.getElementById(id);

    if (!element) return;

    element.classList.add('active');

    element.setAttribute(
        'aria-hidden',
        'false'
    );

    document.body.classList.add('modal-open');
}

function closeModal(id) {

    const element = document.getElementById(id);

    if (!element) return;

    element.classList.remove('active');

    element.setAttribute(
        'aria-hidden',
        'true'
    );

    if (
        !document.querySelector(
            '.cart-modal.active,' +
            '.checkout-modal.active,' +
            '.account-modal.active'
        )
    ) {
        document.body.classList.remove('modal-open');
    }
}


/* =========================================================
   CHECKOUT SUMMARY
========================================================= */

function renderCheckout() {

    const summary = $('#checkoutSummary');

    if (!summary) return;

    const subtotal = cartTotal();

    summary.innerHTML = `

        <div class="summary-title">
            ORDER SUMMARY
        </div>

        ${state.cart.map(product => `

            <div class="checkout-item">

                <span>
                    ${escapeHTML(product.name)}
                    × ${product.quantity}
                </span>

                <strong>
                    ${money(
                        Number(product.price) *
                        Number(product.quantity)
                    )}
                </strong>

            </div>

        `).join('')}

        <div class="checkout-subtotal">

            <span>Subtotal</span>

            <strong>
                ${money(subtotal)}
            </strong>

        </div>

        <div class="checkout-total">

            <span>TOTAL</span>

            <strong>
                ${money(subtotal)}
            </strong>

        </div>
    `;
}


/* =========================================================
   PAKISTANI PHONE VALIDATION
========================================================= */

function validPakistanPhone(phone) {

    const cleaned = String(phone || '')
        .replace(/[\s\-()]/g, '');

    return (
        /^03\d{9}$/.test(cleaned) ||
        /^\+923\d{9}$/.test(cleaned) ||
        /^923\d{9}$/.test(cleaned)
    );
}


/* =========================================================
   CREATE ORDER NUMBER
========================================================= */

function generateOrderNumber() {

    const time = Date.now()
        .toString()
        .slice(-8);

    const random =
        Math.floor(100 + Math.random() * 900);

    return `ACT-${time}-${random}`;
}


/* =========================================================
   WHATSAPP ORDER
========================================================= */

function createWhatsAppOrder(order) {

    let message = `
ASAD CAMERA TECHNOLOGY
NEW ORDER

Order Number: ${order.orderNumber}

CUSTOMER DETAILS
Name: ${order.customer.name}
Phone: ${order.customer.phone}
Address: ${order.customer.address}
City: ${order.customer.city}

PRODUCTS
`;

    order.items.forEach((item, index) => {

        message += `
${index + 1}. ${item.name}
Quantity: ${item.quantity}
Price: ${money(item.price)}
Total: ${money(item.price * item.quantity)}
`;
    });

    message += `
TOTAL: ${money(order.total)}

Payment: Cash on Delivery
`;

    const url =
        `https://wa.me/${STORE_WHATSAPP}?text=` +
        encodeURIComponent(message);

    window.open(url, '_blank');
}


/* =========================================================
   PLACE ORDER
========================================================= */

async function placeOrder(event) {

    event.preventDefault();

    if (!state.cart.length) {
        toast('Your cart is empty.');
        return;
    }

    const form = event.currentTarget;

    const customerName =
        $('#customerName', form)?.value.trim() || '';

    const customerPhone =
        $('#customerPhone', form)?.value.trim() || '';

    const customerAddress =
        $('#customerAddress', form)?.value.trim() || '';

    const customerCity =
        $('#customerCity', form)?.value.trim() || '';

    const paymentMethod =
        $('#paymentMethod', form)?.value ||
        'Cash on Delivery';


    /* -------------------------
       VALIDATION
    ------------------------- */

    if (customerName.length < 2) {
        toast('Enter your full name.');
        return;
    }

    if (!validPakistanPhone(customerPhone)) {
        toast('Enter a valid Pakistani phone number.');
        return;
    }

    if (customerAddress.length < 5) {
        toast('Enter your complete address.');
        return;
    }

    if (customerCity.length < 2) {
        toast('Enter your city.');
        return;
    }


    const button =
        $('.place-order-button', form) ||
        $('button[type="submit"]', form);

    if (button) {

        button.disabled = true;
        button.textContent = 'PROCESSING...';
    }


    /* -------------------------
       CREATE ORDER
    ------------------------- */

    const order = {

        orderNumber:
            generateOrderNumber(),

        createdAt:
            new Date().toISOString(),

        customer: {

            name: customerName,
            phone: customerPhone,
            address: customerAddress,
            city: customerCity

        },

        paymentMethod,

        items:
            state.cart.map(item => ({
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity)
            })),

        total:
            cartTotal(),

        status:
            'Pending'
    };


    /* -------------------------
       SAVE ORDER LOCALLY
    ------------------------- */

    const orders = getOrders();

    orders.unshift(order);

    saveOrders(orders);

    localStorage.setItem(
        LAST_ORDER_KEY,
        JSON.stringify(order)
    );


    /* -------------------------
       UPDATE USER
    ------------------------- */

    if (state.user) {

        state.user.orderCount =
            Number(state.user.orderCount || 0) + 1;

        state.user.phone =
            customerPhone;

        state.user.city =
            customerCity;

        saveUser();
    }


    /* -------------------------
       CLEAR CART
    ------------------------- */

    state.cart = [];

    saveCart();
    updateCartCount();
    renderCart();


    /* -------------------------
       CLOSE CHECKOUT
    ------------------------- */

    closeModal('checkoutModal');

    form.reset();


    /* -------------------------
       SUCCESS
    ------------------------- */

    toast(
        `Order ${order.orderNumber} placed successfully!`,
        'success'
    );


    /* -------------------------
       WHATSAPP
    ------------------------- */

    setTimeout(() => {

        createWhatsAppOrder(order);

    }, 500);


    if (button) {

        button.disabled = false;
        button.textContent = 'PLACE ORDER';
    }
}


/* =========================================================
   ACCOUNT
========================================================= */

async function openAccount(tab = 'profile') {

    renderAccount();

    openModal('accountModal');

    setAccountTab(tab);
}


/* =========================================================
   RENDER ACCOUNT
========================================================= */

function renderAccount() {

    const body = $('#accountBody');

    if (!body) return;


    /* -------------------------
       NOT LOGGED IN
    ------------------------- */

    if (!state.user) {

        body.innerHTML = `

            <div class="account-auth">

                <div class="auth-intro">

                    <span>
                        MEMBER ACCESS
                    </span>

                    <h3>
                        Welcome back.
                    </h3>

                    <p>
                        Sign in to save your details,
                        view orders and speed up checkout.
                    </p>

                </div>


                <form
                    id="loginForm"
                    class="account-form">

                    <label>

                        Email

                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="you@example.com">

                    </label>


                    <label>

                        Password

                        <input
                            name="password"
                            type="password"
                            required
                            minlength="6"
                            placeholder="••••••••">

                    </label>


                    <button
                        class="account-submit"
                        type="submit">

                        SIGN IN

                    </button>


                    <p class="auth-switch">

                        New customer?

                        <button
                            type="button"
                            data-auth="signup">

                            Create an account

                        </button>

                    </p>

                </form>

            </div>
        `;

        $('#loginForm')
            ?.addEventListener('submit', login);

        return;
    }


    /* -------------------------
       LOGGED IN
    ------------------------- */

    body.innerHTML = `

        <div class="account-profile">

            <div class="profile-head">

                <div class="avatar">

                    ${escapeHTML(
                        (state.user.name || 'A')
                            .charAt(0)
                            .toUpperCase()
                    )}

                </div>


                <div>

                    <span>
                        MY ACCOUNT
                    </span>

                    <h3>
                        ${escapeHTML(state.user.name)}
                    </h3>

                    <p>
                        ${escapeHTML(state.user.email)}
                    </p>

                </div>


                <button
                    class="logout-button"
                    id="logoutButton">

                    LOG OUT

                </button>

            </div>


            <div class="account-stats">

                <div>

                    <strong>
                        ${state.user.orderCount || 0}
                    </strong>

                    <span>
                        Orders
                    </span>

                </div>


                <div>

                    <strong>
                        ${state.user.city
                            ? escapeHTML(state.user.city)
                            : '—'}
                    </strong>

                    <span>
                        City
                    </span>

                </div>


                <div>

                    <strong>
                        COD
                    </strong>

                    <span>
                        Payment
                    </span>

                </div>

            </div>


            <div class="account-tabs">

                <button
                    data-account-tab="profile">

                    PROFILE

                </button>

                <button
                    data-account-tab="orders">

                    ORDERS

                </button>

            </div>


            <div id="accountPanel"></div>

        </div>
    `;


    $('#logoutButton')
        ?.addEventListener('click', () => {

            state.user = null;

            localStorage.removeItem(USER_KEY);

            renderAccount();

            toast(
                'You have been signed out.',
                'success'
            );
        });


    $$('.account-tabs button')
        .forEach(button => {

            button.addEventListener(
                'click',
                () =>
                    setAccountTab(
                        button.dataset.accountTab
                    )
            );
        });


    setAccountTab('profile');
}


/* =========================================================
   ACCOUNT TABS
========================================================= */

function setAccountTab(tab) {

    $$('.account-tabs button')
        .forEach(button => {

            button.classList.toggle(
                'active',
                button.dataset.accountTab === tab
            );
        });


    const panel = $('#accountPanel');

    if (!panel) return;


    /* -------------------------
       ORDERS
    ------------------------- */

    if (tab === 'orders') {

        const orders = getOrders();

        if (!orders.length) {

            panel.innerHTML = `
                <div class="no-orders">
                    No orders yet.
                    Your completed orders
                    will appear here.
                </div>
            `;

            return;
        }


        panel.innerHTML = orders.map(order => `

            <div class="order-card">

                <div>

                    <strong>
                        ${escapeHTML(order.orderNumber)}
                    </strong>

                    <span>
                        ${new Date(
                            order.createdAt
                        ).toLocaleDateString('en-PK')}
                    </span>

                </div>


                <b>
                    ${money(order.total)}
                </b>


                <small>
                    ${escapeHTML(
                        order.status || 'Pending'
                    )}
                </small>

            </div>

        `).join('');

        return;
    }


    /* -------------------------
       PROFILE
    ------------------------- */

    panel.innerHTML = `

        <div class="profile-details">

            <div>

                <span>
                    FULL NAME
                </span>

                <strong>
                    ${escapeHTML(state.user.name)}
                </strong>

            </div>


            <div>

                <span>
                    EMAIL
                </span>

                <strong>
                    ${escapeHTML(state.user.email)}
                </strong>

            </div>


            <div>

                <span>
                    PHONE
                </span>

                <strong>
                    ${escapeHTML(
                        state.user.phone ||
                        'Not set'
                    )}
                </strong>

            </div>


            <div>

                <span>
                    CITY
                </span>

                <strong>
                    ${escapeHTML(
                        state.user.city ||
                        'Not set'
                    )}
                </strong>

            </div>

        </div>
    `;
}


/* =========================================================
   LOGIN
========================================================= */

async function login(event) {

    event.preventDefault();

    const form = event.currentTarget;

    const data =
        Object.fromEntries(
            new FormData(form).entries()
        );


    try {

        const response = await fetch(
            '/api/auth/login',
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body:
                    JSON.stringify(data)
            }
        );


        const result =
            await response.json();


        if (!response.ok) {
            throw new Error(
                result.message ||
                'Sign in failed.'
            );
        }


        state.user =
            result.user;


        saveUser();

        renderAccount();

        toast(
            'Welcome back!',
            'success'
        );


    } catch (error) {

        /*
         * If the backend does not exist,
         * show a friendly message.
         */

        toast(
            error.message ||
            'Sign in failed.'
        );
    }
}


/* =========================================================
   SIGNUP
========================================================= */

async function signup(event) {

    event.preventDefault();

    const form = event.currentTarget;

    const data =
        Object.fromEntries(
            new FormData(form).entries()
        );


    if (
        data.password !==
        data.confirmPassword
    ) {

        toast(
            'Passwords do not match.'
        );

        return;
    }


    try {

        const response =
            await fetch(
                '/api/auth/signup',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(data)
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                'Could not create account.'
            );
        }


        state.user =
            result.user;


        saveUser();

        renderAccount();

        toast(
            'Account created successfully!',
            'success'
        );


    } catch (error) {

        toast(
            error.message ||
            'Could not create account.'
        );
    }
}


/* =========================================================
   SHOW SIGNUP
========================================================= */

function showSignup() {

    const body = $('#accountBody');

    if (!body) return;


    body.innerHTML = `

        <div class="account-auth">

            <div class="auth-intro">

                <span>
                    CREATE ACCOUNT
                </span>

                <h3>
                    Join the store.
                </h3>

                <p>
                    Keep your delivery details ready
                    and track your orders.
                </p>

            </div>


            <form
                id="signupForm"
                class="account-form">


                <label>

                    Full Name

                    <input
                        name="name"
                        required
                        minlength="2"
                        placeholder="Your full name">

                </label>


                <label>

                    Email

                    <input
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com">

                </label>


                <label>

                    Phone

                    <input
                        name="phone"
                        type="tel"
                        required
                        placeholder="03001234567">

                </label>


                <label>

                    City

                    <input
                        name="city"
                        required
                        placeholder="Chakwal">

                </label>


                <label>

                    Password

                    <input
                        name="password"
                        type="password"
                        required
                        minlength="6"
                        placeholder="Minimum 6 characters">

                </label>


                <label>

                    Confirm Password

                    <input
                        name="confirmPassword"
                        type="password"
                        required
                        minlength="6"
                        placeholder="Repeat password">

                </label>


                <button
                    class="account-submit"
                    type="submit">

                    CREATE ACCOUNT

                </button>


                <p class="auth-switch">

                    Already registered?

                    <button
                        type="button"
                        data-auth="login">

                        Sign in

                    </button>

                </p>

            </form>

        </div>
    `;


    $('#signupForm')
        ?.addEventListener(
            'submit',
            signup
        );


    $('[data-auth="login"]')
        ?.addEventListener(
            'click',
            renderAccount
        );
}


/* =========================================================
   SEARCH
========================================================= */

function searchProducts() {

    const input = $('#searchInput');

    if (!input) return;

    const query =
        input.value
            .trim()
            .toLowerCase();


    const cards = $$(
        '.product-card,' +
        '.laptop-card,' +
        '.network-card,' +
        '.category-box,' +
        '.accessory-box,' +
        '.brand-card'
    );


    let found = 0;


    cards.forEach(card => {

        const text =
            card.textContent
                .toLowerCase();


        const matches =
            !query ||
            text.includes(query);


        card.classList.toggle(
            'search-hidden',
            !matches
        );


        if (matches) {
            found++;
        }
    });


    let empty =
        $('#noSearchResults');


    if (!empty) {

        empty =
            document.createElement('div');

        empty.id =
            'noSearchResults';

        empty.className =
            'no-results';


        empty.innerHTML = `

            <strong>
                NO PRODUCTS FOUND
            </strong>

            <span>
                Try CCTV, SSD, laptop,
                gaming, RAM or networking.
            </span>

        `;


        const main =
            $('main') ||
            document.body;

        main.appendChild(empty);
    }


    empty.style.display =
        query && found === 0
            ? 'grid'
            : 'none';


    if (query && found > 0) {

        const first =
            cards.find(
                card =>
                    !card.classList.contains(
                        'search-hidden'
                    )
            );


        if (first) {

            first.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function initMobileNavigation() {

    $$('.mobile-category-button')
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const menu =
                        button.nextElementSibling;

                    if (menu) {
                        menu.classList.toggle(
                            'active'
                        );
                    }
                }
            );
        });


    const mobileButton =
        $('#mobileButton');


    const mobileNavigation =
        $('#mobileNavigation');


    if (
        mobileButton &&
        mobileNavigation
    ) {

        mobileButton.addEventListener(
            'click',
            () => {

                const active =
                    mobileNavigation
                        .classList.toggle(
                            'active'
                        );


                mobileButton.textContent =
                    active
                        ? '✕'
                        : '☰';
            }
        );
    }


    $$('.desktop-nav a, .mobile-navigation a')
        .forEach(link => {

            link.addEventListener(
                'click',
                () => {

                    mobileNavigation
                        ?.classList.remove(
                            'active'
                        );


                    if (mobileButton) {
                        mobileButton.textContent =
                            '☰';
                    }
                }
            );
        });
}


/* =========================================================
   NEWSLETTER
========================================================= */

function initNewsletter() {

    $$('.newsletter-form, #newsletterForm')
        .forEach(form => {

            form.addEventListener(
                'submit',
                event => {

                    event.preventDefault();


                    const email =
                        $('input[type="email"]', form);


                    if (
                        email &&
                        !email.value.trim()
                    ) {

                        toast(
                            'Enter your email address.'
                        );

                        return;
                    }


                    toast(
                        'Thanks for subscribing!',
                        'success'
                    );


                    form.reset();
                }
            );
        });
}


/* =========================================================
   MODAL BACKDROP
========================================================= */

function initModalBackdrop() {

    $('#checkoutModal')
        ?.addEventListener(
            'click',
            event => {

                if (
                    event.target.id ===
                    'checkoutModal'
                ) {

                    closeModal(
                        'checkoutModal'
                    );
                }
            }
        );


    $('#cartModal')
        ?.addEventListener(
            'click',
            event => {

                if (
                    event.target.id ===
                    'cartModal'
                ) {

                    closeModal(
                        'cartModal'
                    );
                }
            }
        );


    $('#accountModal')
        ?.addEventListener(
            'click',
            event => {

                if (
                    event.target.id ===
                    'accountModal'
                ) {

                    closeModal(
                        'accountModal'
                    );
                }
            }
        );
}


/* =========================================================
   ESC KEY
========================================================= */

function initEscapeKey() {

    document.addEventListener(
        'keydown',
        event => {

            if (event.key !== 'Escape') {
                return;
            }


            closeModal('cartModal');

            closeModal('checkoutModal');

            closeModal('accountModal');
        }
    );
}


/* =========================================================
   AUTH BUTTONS
========================================================= */

function initAuthButtons() {

    document.addEventListener(
        'click',
        event => {

            const button =
                event.target.closest(
                    '[data-auth]'
                );


            if (!button) return;


            const action =
                button.dataset.auth;


            if (action === 'signup') {

                showSignup();

            } else if (action === 'login') {

                renderAccount();
            }
        }
    );
}


/* =========================================================
   PRODUCT CART BUTTONS
========================================================= */

function initCartButtons() {

    $$('.add-cart')
        .forEach(button => {

            button.addEventListener(
                'click',
                event => {

                    event.preventDefault();

                    const card =
                        button.closest(
                            '.product-card,' +
                            '.laptop-card,' +
                            '.network-card,' +
                            '.accessory-box'
                        );


                    addToCart(card);
                }
            );
        });
}


/* =========================================================
   CART MODAL
========================================================= */

function initCart() {

    $('#cartButton')
        ?.addEventListener(
            'click',
            () => {

                renderCart();

                openModal(
                    'cartModal'
                );
            }
        );


    $('#closeCart')
        ?.addEventListener(
            'click',
            () => {

                closeModal(
                    'cartModal'
                );
            }
        );


    $('#cartText')
        ?.addEventListener(
            'click',
            handleCartAction
        );
}


/* =========================================================
   CHECKOUT
========================================================= */

function initCheckout() {

    $('#checkoutButton')
        ?.addEventListener(
            'click',
            () => {

                if (!state.cart.length) {

                    toast(
                        'Your cart is empty.'
                    );

                    return;
                }


                renderCheckout();

                closeModal(
                    'cartModal'
                );

                openModal(
                    'checkoutModal'
                );
            }
        );


    $('#closeCheckout')
        ?.addEventListener(
            'click',
            () => {

                closeModal(
                    'checkoutModal'
                );
            }
        );


    $('#checkoutForm')
        ?.addEventListener(
            'submit',
            placeOrder
        );
}


/* =========================================================
   ACCOUNT BUTTON
========================================================= */

function initAccount() {

    $('#accountButton')
        ?.addEventListener(
            'click',
            () => openAccount()
        );
}


/* =========================================================
   SEARCH FORM
========================================================= */

function initSearch() {

    const form =
        $('#searchForm');

    const input =
        $('#searchInput');


    if (form) {

        form.addEventListener(
            'submit',
            event => {

                event.preventDefault();

                searchProducts();
            }
        );
    }


    if (input) {

        input.addEventListener(
            'input',
            searchProducts
        );
    }
}


/* =========================================================
   SCROLL REVEAL
========================================================= */

function initReveal() {

    $$('.data-reveal, [data-reveal]')
        .forEach(element => {

            element.classList.add(
                'in-view'
            );
        });
}


/* =========================================================
   FIX IMAGE ERRORS
========================================================= */

function initImageFallbacks() {

    $$('img')
        .forEach(image => {

            image.addEventListener(
                'error',
                () => {

                    image.classList.add(
                        'image-error'
                    );
                }
            );
        });
}


/* =========================================================
   INITIALIZATION
========================================================= */

function init() {

    initCartButtons();

    initCart();

    initCheckout();

    initAccount();

    initSearch();

    initMobileNavigation();

    initNewsletter();

    initModalBackdrop();

    initEscapeKey();

    initAuthButtons();

    initReveal();

    initImageFallbacks();

    updateCartCount();

    renderCart();
}


/* =========================================================
   DOM READY
========================================================= */

if (
    document.readyState ===
    'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        init
    );

} else {

    init();
}