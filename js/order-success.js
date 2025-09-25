function initPageAnimations() {
    const body = document.body;
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    const nav = document.querySelector('.nav');
    
    body.style.overflow = 'hidden';
    
    const tl = gsap.timeline({
        onComplete: () => {
            body.style.overflow = '';
        }
    });
    
    tl.to(preloader, {
        duration: 1.2,
        opacity: 0,
        ease: "power2.inOut",
        delay: 1,
        onComplete: () => preloader.style.display = 'none'
    })
    .to(nav, { duration: 1, opacity: 1, ease: "power2.out" }, "-=0.5")
    .to(mainContent, { duration: 1, opacity: 1, ease: "power2.out" }, "<");
}

function initOrderSuccessAnimations() {
    if (typeof Splitting !== 'undefined') {
        Splitting();
    }

    const successContainer = document.querySelector('.order-success-container');
    if (successContainer) {
        gsap.fromTo(successContainer,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power2.out',
                delay: 0.3
            }
        );
    }

    if (document.querySelector('.success-title')) {
        const chars = document.querySelectorAll('.success-title .char');
        if (chars.length > 0) {
            gsap.fromTo(chars, 
                { y: '100%', opacity: 0 }, 
                { 
                    y: 0, 
                    opacity: 1, 
                    stagger: 0.05, 
                    duration: 1.5,
                    ease: 'power3.out',
                    delay: 0.5
                }
            );
        }
    }

    gsap.utils.toArray('.order-item').forEach((element, index) => {
        gsap.fromTo(element,
            { opacity: 0, x: -30 },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: 'power2.out',
                delay: 0.7 + (index * 0.1)
            }
        );
    });

    const continueBtn = document.querySelector('.continue-shopping-btn');
    if (continueBtn) {
        gsap.fromTo(continueBtn,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power2.out',
                delay: 1.2
            }
        );
    }
}

async function loadOrderDetails(orderId) {
    const orderDetailsContainer = document.getElementById('order-details');
    
    try {
        const { data: order, error } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error || !order) {
            console.error('Error fetching order:', error);
            showFallbackContent();
            return;
        }

        document.getElementById('order-number').textContent = order.id;
        document.getElementById('order-total').textContent = order.total.toFixed(2);

        const shipping = order.shipping || {};
        const addressParts = [
            shipping.name,
            shipping.address?.line1,
            shipping.address?.city,
            shipping.address?.state,
            shipping.address?.postal_code,
            shipping.address?.country
        ].filter(part => part && part.trim());
        
        document.getElementById('shipping-address').textContent = 
            addressParts.join(', ') || 'Address not available';

        const orderItemsContainer = document.getElementById('order-items');
        if (orderItemsContainer && order.items && Array.isArray(order.items)) {
            orderItemsContainer.innerHTML = order.items.map(item => `
                <div class="order-item">
                    <img src="${item.image || 'https://placehold.co/70x70/dde5f2/4A5568?text=Image'}" 
                         alt="${item.name || 'Product'}"
                         onerror="this.src='https://placehold.co/70x70/dde5f2/4A5568?text=Image'">
                    <div class="order-item-details">
                        <h4>${item.name || 'Unknown Product'}</h4>
                        <p>Qty: ${item.quantity || 1} × $${parseFloat(item.price || 0).toFixed(2)}</p>
                    </div>
                    <div class="order-item-total">
                        $${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </div>
                </div>
            `).join('');
        } else {
            orderItemsContainer.innerHTML = '<p>No items found for this order.</p>';
        }

        orderDetailsContainer.style.display = 'block';
        initOrderSuccessAnimations();

    } catch (err) {
        console.error('Unexpected error:', err);
        showFallbackContent();
    }
}

function showFallbackContent() {
    document.getElementById('order-number').textContent = 'Not Available';
    document.getElementById('order-total').textContent = '0.00';
    document.getElementById('shipping-address').textContent = 'No shipping information available';

    const orderItemsContainer = document.getElementById('order-items');
    if (orderItemsContainer) {
        orderItemsContainer.innerHTML = `
            <div class="no-order-message">
                <p>No order information found. If you have placed an order, please check your email for the order confirmation link.</p>
            </div>
        `;
    }

    const orderDetailsContainer = document.getElementById('order-details');
    if (orderDetailsContainer) {
        orderDetailsContainer.style.display = 'block';
    }

    initOrderSuccessAnimations();
}

function initializeOrderSuccessPage() {
    if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
        gsap.registerPlugin(ScrollTrigger);
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order');

    initPageAnimations();

    if (orderId) {
        loadOrderDetails(orderId);
    } else {
        showFallbackContent();
    }
}

document.addEventListener('DOMContentLoaded', initializeOrderSuccessPage);