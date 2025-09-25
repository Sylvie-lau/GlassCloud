const supabaseUrl = 'https://gvaowqeyqmjtbfhrthsa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YW93cWV5cW1qdGJmaHJ0aHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNDg4ODEsImV4cCI6MjA3MzgyNDg4MX0.gSfgEtm0qXQjvDJDq0DpLDlplpD4ASyEx8wXYTf0LNU';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let cart = JSON.parse(localStorage.getItem('glasscloud-cart')) || [];

function showNotification(message) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function updateCartBadge() {
    const cartBadge = document.getElementById('cart-badge');
    if (!cartBadge) return;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    cartBadge.classList.toggle('visible', totalItems > 0);
}

function saveCart() {
    localStorage.setItem('glasscloud-cart', JSON.stringify(cart));
    updateCartBadge();
    
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar && cartSidebar.classList.contains('show')) {
        renderCart();
    }
}

window.addToCartById = (product) => {
    if (!product || !product.id) return;
    const existingItem = cart.find(item => item.id == product.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    showNotification(`${product.name} has been added to your cart.`);
};

function renderCart() {
    const cartContainer = document.getElementById('cart-items-container');
    const cartFooter = document.getElementById('cart-footer');
    const totalPriceEl = document.getElementById('cart-total-price');
    if (!cartContainer || !cartFooter || !totalPriceEl) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        cartFooter.style.display = 'none';
    } else {
        cartContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${parseFloat(item.price || 0).toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-change" data-id="${item.id}" data-change="-1">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-change" data-id="${item.id}" data-change="1">+</button>
                </div>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0);
        totalPriceEl.textContent = total.toFixed(2);
        cartFooter.style.display = 'block';
    }
}

function performSearchRedirect(query) {
    if (!query || query.length < 1) {
        return;
    }
    const encodedQuery = encodeURIComponent(query);
    window.location.href = `products.html?search=${encodedQuery}`;
}

function initializeApp() {
    const nav = document.querySelector('.nav');
    const navToggle = document.querySelector('.nav__toggle');
    const navMobile = document.querySelector('.nav__mobile');
    const lightEffect = document.getElementById('light-effect-wrapper');
    const searchBtn = document.getElementById('search-btn');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchInput = document.querySelector('.search-overlay__input');
    const accountBtn = document.getElementById('account-btn');
    const cartBtn = document.getElementById('cart-btn');
    const authModal = document.getElementById('auth-modal');
    const cartSidebar = document.getElementById('cart-sidebar');
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');
    const loginView = document.getElementById('login-view');
    const signupView = document.getElementById('signup-view');
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('cookie-accept-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const logoutModal = document.getElementById('logout-modal');
    const logoutEmailDisplay = document.getElementById('logout-email-display');
    const logoutSwitchBtn = document.getElementById('logout-switch-btn');
    const logoutConfirmBtn = document.getElementById('logout-confirm-btn');

    if (lightEffect) {
        document.addEventListener('mousemove', (e) => {
            lightEffect.style.setProperty('--mouse-x', `${e.clientX}px`);
            lightEffect.style.setProperty('--mouse-y', `${e.clientY}px`);
        });
    }

    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('sticky', window.scrollY > 50);
        });
    }

    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('quantity-change')) {
            const id = e.target.dataset.id;
            const change = parseInt(e.target.dataset.change, 10);
            const itemIndex = cart.findIndex(item => item.id == id);
            if (itemIndex > -1) {
                cart[itemIndex].quantity += change;
                if (cart[itemIndex].quantity <= 0) {
                    cart.splice(itemIndex, 1);
                }
                saveCart();
            }
        }
    });

    searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            performSearchRedirect(query);
        }
    });

    signupForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) {
            showNotification('Error: ' + error.message);
        } else {
            showNotification('Registration successful! Please check your email to continue.');
            authModal?.classList.remove('show');
        }
    });

    loginForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            showNotification('Error: ' + error.message);
        } else {
            showNotification('Login successful!');
            authModal?.classList.remove('show');
        }
    });

    accountBtn?.addEventListener('click', async () => {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            if (logoutEmailDisplay) {
                logoutEmailDisplay.textContent = `Logged in as ${session.user.email}`;
            }
            logoutModal?.classList.add('show');
        } else {
            authModal?.classList.add('show');
        }
    });

    const googleLoginBtn = document.getElementById('google-login-btn');
    googleLoginBtn?.addEventListener('click', async () => {
        try {
            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) {
                showNotification(`Error: ${error.message}`);
            }
        } catch (error) {
            showNotification('An unexpected error occurred.');
        }
    });

    logoutSwitchBtn?.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        logoutModal?.classList.remove('show');
        authModal?.classList.add('show');
        showNotification('Previous user logged out.');
    });

    logoutConfirmBtn?.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        logoutModal?.classList.remove('show');
        showNotification('You have been logged out.');
    });

    searchBtn?.addEventListener('click', () => searchOverlay?.classList.add('show'));

    cartBtn?.addEventListener('click', () => {
        renderCart();
        cartSidebar?.classList.add('show');
    });

    checkoutBtn?.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });

    document.querySelectorAll('.search-overlay__close, .cart-close, .modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            searchOverlay?.classList.remove('show');
            cartSidebar?.classList.remove('show');
            authModal?.classList.remove('show');
            logoutModal?.classList.remove('show');
        });
    });
    
    document.addEventListener('click', (e) => {
        if (e.target === authModal) authModal.classList.remove('show');
        if (e.target === logoutModal) logoutModal.classList.remove('show');
        if (e.target === searchOverlay) searchOverlay.classList.remove('show');
    });

    showSignupBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if(loginView && signupView) {
            loginView.style.display = 'none';
            signupView.style.display = 'block';
        }
    });

    showLoginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if(loginView && signupView) {
            signupView.style.display = 'none';
            loginView.style.display = 'block';
        }
    });

    navToggle?.addEventListener('click', () => {
        nav?.classList.toggle('open');
        navMobile?.classList.toggle('open');
    });

    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => cookieBanner?.classList.add('show'), 2000);
    }

    acceptCookiesBtn?.addEventListener('click', () => {
        cookieBanner?.classList.remove('show');
        localStorage.setItem('cookiesAccepted', 'true');
    });

    updateCartBadge();
}

document.addEventListener('DOMContentLoaded', initializeApp);