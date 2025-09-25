const App = {
    state: {
        cart: [],
        user: null,
    },
    nodes: {},
    data: {
        countryStates: {
            AU: [
                { value: 'ACT', name: 'Australian Capital Territory' }, { value: 'NSW', name: 'New South Wales' },
                { value: 'NT', name: 'Northern Territory' }, { value: 'QLD', name: 'Queensland' },
                { value: 'SA', name: 'South Australia' }, { value: 'TAS', name: 'Tasmania' },
                { value: 'VIC', name: 'Victoria' }, { value: 'WA', name: 'Western Australia' }
            ],
            US: [
                { value: 'AL', name: 'Alabama' }, { value: 'AK', name: 'Alaska' }, { value: 'AZ', name: 'Arizona' },
                { value: 'AR', name: 'Arkansas' }, { value: 'CA', name: 'California' }, { value: 'CO', name: 'Colorado' },
                { value: 'CT', name: 'Connecticut' }, { value: 'DE', name: 'Delaware' }, { value: 'FL', name: 'Florida' },
                { value: 'GA', name: 'Georgia' }, { value: 'HI', name: 'Hawaii' }, { value: 'ID', name: 'Idaho' },
                { value: 'IL', name: 'Illinois' }, { value: 'IN', name: 'Indiana' }, { value: 'IA', name: 'Iowa' },
                { value: 'KS', name: 'Kansas' }, { value: 'KY', name: 'Kentucky' }, { value: 'LA', name: 'Louisiana' },
                { value: 'ME', name: 'Maine' }, { value: 'MD', name: 'Maryland' }, { value: 'MA', name: 'Massachusetts' },
                { value: 'MI', name: 'Michigan' }, { value: 'MN', name: 'Minnesota' }, { value: 'MS', name: 'Mississippi' },
                { value: 'MO', name: 'Missouri' }, { value: 'MT', name: 'Montana' }, { value: 'NE', name: 'Nebraska' },
                { value: 'NV', name: 'Nevada' }, { value: 'NH', name: 'New Hampshire' }, { value: 'NJ', name: 'New Jersey' },
                { value: 'NM', name: 'New Mexico' }, { value: 'NY', name: 'New York' }, { value: 'NC', name: 'North Carolina' },
                { value: 'ND', name: 'North Dakota' }, { value: 'OH', name: 'Ohio' }, { value: 'OK', name: 'Oklahoma' },
                { value: 'OR', name: 'Oregon' }, { value: 'PA', name: 'Pennsylvania' }, { value: 'RI', name: 'Rhode Island' },
                { value: 'SC', name: 'South Carolina' }, { value: 'SD', name: 'South Dakota' }, { value: 'TN', name: 'Tennessee' },
                { value: 'TX', name: 'Texas' }, { value: 'UT', name: 'Utah' }, { value: 'VT', name: 'Vermont' },
                { value: 'VA', name: 'Virginia' }, { value: 'WA', name: 'Washington' }, { value: 'WV', name: 'West Virginia' },
                { value: 'WI', name: 'Wisconsin' }, { value: 'WY', name: 'Wyoming' }
            ],
            CA: [
                { value: 'AB', name: 'Alberta' }, { value: 'BC', name: 'British Columbia' }, { value: 'MB', name: 'Manitoba' },
                { value: 'NB', name: 'New Brunswick' }, { value: 'NL', name: 'Newfoundland and Labrador' },
                { value: 'NS', name: 'Nova Scotia' }, { value: 'ON', name: 'Ontario' }, { value: 'PE', name: 'Prince Edward Island' },
                { value: 'QC', name: 'Quebec' }, { value: 'SK', name: 'Saskatchewan' }
            ]
        }
    },

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadStateFromLocalStorage();
            this.cacheDOMElements();
            this.initStripe();
            this.bindEvents();
            this.render();
            this.prefillUserInfo();
        });
    },

    loadStateFromLocalStorage() {
        this.state.cart = JSON.parse(localStorage.getItem('glasscloud-cart')) || [];
        this.state.user = JSON.parse(localStorage.getItem('glasscloud-user')) || null;
    },
    
    cacheDOMElements() {
        this.nodes.lightEffect = document.getElementById('light-effect-wrapper');
        this.nodes.nav = document.querySelector('.nav');
        this.nodes.accountBtn = document.getElementById('account-btn');
        this.nodes.cartBtn = document.getElementById('cart-btn');
        this.nodes.cartBadge = document.getElementById('cart-badge');
        this.nodes.cartSidebar = document.getElementById('cart-sidebar');
        this.nodes.cartContainer = document.getElementById('cart-items-container');
        this.nodes.cartFooter = document.getElementById('cart-footer');
        this.nodes.cartTotalPrice = document.getElementById('cart-total-price');
        this.nodes.cartCloseBtn = document.querySelector('.cart-close');
        this.nodes.notification = document.getElementById('notification');
        this.nodes.checkoutItems = document.getElementById('checkout-items');
        this.nodes.orderTotal = document.getElementById('order-total');
        this.nodes.placeOrderBtn = document.getElementById('place-order-btn');
        this.nodes.checkoutForm = document.getElementById('checkout-form');
        this.nodes.cardElementContainer = document.getElementById('card-element');
        this.nodes.cardErrors = document.getElementById('card-errors');
        this.nodes.stateWrapper = document.getElementById('state-wrapper');
        this.nodes.countrySelect = document.getElementById('country');
    },

    initStripe() {
        if (!this.nodes.cardElementContainer) return;

        this.stripe = Stripe('pk_test_51SAo4x3AbetwvGQDllE1obzadMH8VsMpErpEj9HimU42wuZ1KiUeEFpjqyf8WFbQHcIWejNNuoxRNUqDVK2qx0yc00WEE7cVED');
        const elements = this.stripe.elements();

        this.cardElement = elements.create('card', {
            style: {
                base: { fontSize: '16px', color: '#32325d' }
            },
            hidePostalCode: true 
        });

        this.cardElement.mount(this.nodes.cardElementContainer);

        this.cardElement.on('change', (event) => {
            this.nodes.cardErrors.textContent = event.error ? event.error.message : '';
        });
    },

    bindEvents() {
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('scroll', this.handleWindowScroll.bind(this));
        this.nodes.cartBtn?.addEventListener('click', this.openCartSidebar.bind(this));
        this.nodes.cartCloseBtn?.addEventListener('click', this.closeCartSidebar.bind(this));
        this.nodes.placeOrderBtn?.addEventListener('click', this.handlePlaceOrder.bind(this));
        this.nodes.cartContainer?.addEventListener('click', this.handleQuantityChange.bind(this));
        this.nodes.countrySelect?.addEventListener('change', this.handleCountryChange.bind(this));
    },
    
    render() {
        this.updateCartBadge();
        this.renderCartSidebar();
        this.renderCheckoutItems();
    },

    handleCountryChange() {
        const selectedCountry = this.nodes.countrySelect.value;
        const states = this.data.countryStates[selectedCountry];
        
        this.nodes.stateWrapper.innerHTML = ''; 

        if (states && states.length > 0) {
            const stateSelect = document.createElement('select');
            stateSelect.id = 'state';
            stateSelect.name = 'state';
            stateSelect.required = true;

            let optionsHTML = '<option value="">Select State / Province</option>';
            states.forEach(state => {
                optionsHTML += `<option value="${state.value}">${state.name}</option>`;
            });
            stateSelect.innerHTML = optionsHTML;
            this.nodes.stateWrapper.appendChild(stateSelect);
        } else {
            const stateInput = document.createElement('input');
            stateInput.type = 'text';
            stateInput.id = 'state';
            stateInput.name = 'state';
            stateInput.placeholder = 'State / Province';
            stateInput.required = true;
            this.nodes.stateWrapper.appendChild(stateInput);
        }
    },
    
    handleMouseMove(e) {
        this.nodes.lightEffect.style.setProperty('--mouse-x', `${e.clientX}px`);
        this.nodes.lightEffect.style.setProperty('--mouse-y', `${e.clientY}px`);
    },

    handleWindowScroll() {
        this.nodes.nav.classList.toggle('sticky', window.scrollY > 100);
    },

    openCartSidebar(e) {
        e?.preventDefault();
        this.nodes.cartSidebar.classList.add('show');
        this.renderCartSidebar();
    },
    
    closeCartSidebar() {
        this.nodes.cartSidebar.classList.remove('show');
    },

    handleQuantityChange(e) {
        const button = e.target.closest('[data-action="change-quantity"]');
        if (!button) return;

        const productId = button.dataset.productId;
        const change = parseInt(button.dataset.change, 10);
        
        const itemIndex = this.state.cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            this.state.cart[itemIndex].quantity += change;
            if (this.state.cart[itemIndex].quantity <= 0) {
                this.state.cart.splice(itemIndex, 1);
            }
            localStorage.setItem('glasscloud-cart', JSON.stringify(this.state.cart));
            this.render();
        }
    },

    async handlePlaceOrder(e) {
        e.preventDefault();

        if (!this.nodes.checkoutForm.checkValidity()) {
            this.nodes.checkoutForm.reportValidity();
            return;
        }
        if (this.state.cart.length === 0) {
            this.showNotification('Your cart is empty');
            return;
        }

        this.setOrderButtonState(true, 'Processing...');

        try {
            const { data, error: functionError } = await supabaseClient.functions.invoke('create-payment-intent', {
                body: {
                    amount: this.calculateTotal() * 100,
                    currency: 'usd',
                    metadata: { user_id: this.state.user?.id }
                }
            });

            if (functionError) {
                throw functionError;
            }
            
            const paymentIntent = data;

            if (paymentIntent.error) {
                throw new Error(paymentIntent.error);
            }

            const billingDetails = this.getBillingDetails();
            const { error: stripeError } = await this.stripe.confirmCardPayment(paymentIntent.client_secret, {
                payment_method: { card: this.cardElement, billing_details: billingDetails }
            });
            if (stripeError) throw stripeError;

            const orderData = this.createOrderDataObject(paymentIntent.id, billingDetails);
            const { data: newOrderData, error } = await supabaseClient.from('orders').insert([orderData]).select();
            if (error) throw error;
            
            this.clearCart();
            this.showNotification('Order placed successfully! Redirecting...');
            setTimeout(() => {
                window.location.href = `order-success.html?order=${newOrderData[0].id}`;
            }, 2000);

        } catch (error) {
            console.error('Error processing order:', error);
            this.showNotification(error.message || 'Error processing payment. Please try again.');
        } finally {
            this.setOrderButtonState(false, 'Place Order');
        }
    },

    updateCartBadge() {
        const totalItems = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
        this.nodes.cartBadge.textContent = totalItems;
        this.nodes.cartBadge.classList.toggle('visible', totalItems > 0);
    },

    renderCartSidebar() {
        if (!this.nodes.cartContainer) return;

        if (this.state.cart.length === 0) {
            this.nodes.cartContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
            this.nodes.cartFooter.style.display = 'none';
        } else {
            this.nodes.cartContainer.innerHTML = this.state.cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button data-action="change-quantity" data-product-id="${item.id}" data-change="-1">-</button>
                        <span>${item.quantity}</span>
                        <button data-action="change-quantity" data-product-id="${item.id}" data-change="1">+</button>
                    </div>
                </div>
            `).join('');
            this.nodes.cartTotalPrice.textContent = this.calculateTotal().toFixed(2);
            this.nodes.cartFooter.style.display = 'block';
        }
    },

    renderCheckoutItems() {
        if (!this.nodes.checkoutItems) return;

        const total = this.calculateTotal();
        if (this.state.cart.length === 0) {
            this.nodes.checkoutItems.innerHTML = '<p style="text-align: center; color: var(--accent-secondary); padding: 40px;">No items in cart</p>';
            this.nodes.orderTotal.textContent = '0.00';
            this.setOrderButtonState(true);
        } else {
            this.nodes.checkoutItems.innerHTML = this.state.cart.map(item => `
                <div class="order-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="order-item-details">
                        <h4>${item.name}</h4>
                        <p>Qty: ${item.quantity} × $${item.price.toFixed(2)}</p>
                    </div>
                    <div style="margin-left: auto; font-weight: 600;">
                        $${(item.price * item.quantity).toFixed(2)}
                    </div>
                </div>
            `).join('');
            this.nodes.orderTotal.textContent = total.toFixed(2);
            this.setOrderButtonState(false);
        }
    },
    
    showNotification(message) {
        this.nodes.notification.textContent = message;
        this.nodes.notification.classList.add('show');
        setTimeout(() => this.nodes.notification.classList.remove('show'), 3000);
    },

    calculateTotal() {
        return this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    prefillUserInfo() {
        if (this.state.user && document.getElementById('email')) {
            document.getElementById('email').value = this.state.user.email;
        }
    },
    
    setOrderButtonState(disabled, text = 'Place Order') {
        if (!this.nodes.placeOrderBtn) return;
        this.nodes.placeOrderBtn.disabled = disabled;
        this.nodes.placeOrderBtn.textContent = text;
        this.nodes.placeOrderBtn.style.opacity = disabled ? '0.5' : '1';
    },
    
    getBillingDetails() {
        return {
            name: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            address: {
                line1: document.getElementById('address').value,
                city: document.getElementById('city').value,
                postal_code: document.getElementById('postal-code').value,
                state: document.getElementById('state').value,
                country: document.getElementById('country').value
            }
        };
    },

    createOrderDataObject(paymentIntentId, shippingDetails) {
        return {
            user_id: this.state.user?.id || null,
            items: this.state.cart.map(({ id, name, quantity, price, image }) => ({ 
                product_id: id, 
                name, 
                quantity, 
                price, 
                image 
            })),
            total: this.calculateTotal(),
            created_at: new Date().toISOString(),
            shipping: shippingDetails,
            payment_info: { payment_intent_id: paymentIntentId },
            status: 'paid'
        };
    },
    
    clearCart() {
        localStorage.removeItem('glasscloud-cart');
        this.state.cart = [];
        this.render();
    }
};

App.init();