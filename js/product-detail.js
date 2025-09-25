let addToCartBtn;

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
        duration: 0.8,
        opacity: 0,
        ease: "power2.inOut",
        onComplete: () => preloader.style.display = 'none'
    })
    .to(nav, { duration: 0.5, opacity: 1, ease: "power2.out" }, "-=0.3")
    .to(mainContent, { duration: 0.5, opacity: 1, ease: "power2.out" }, "<");
}

async function loadProductDetails(id) {
    try {
        const { data: product, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !product) {
            console.error('Error fetching product:', error);
            document.querySelector('.product-detail-container').innerHTML = '<p class="error-message">Could not load product details.</p>';
            return;
        }
        document.title = `${product.name} - GlassCloud`;
        const productImage = document.getElementById('product-image');
        const productCategory = document.getElementById('product-category');
        const productName = document.getElementById('product-name');
        const productPrice = document.getElementById('product-price');
        const productDescription = document.getElementById('product-description');
        
        const price = parseFloat(product.price || 0);
        
        if (productImage) {
            productImage.src = product.image;
            productImage.alt = product.name;
        }
        if (productCategory) productCategory.textContent = product.category;
        if (productName) productName.textContent = product.name;
        if (productPrice) productPrice.textContent = `${price.toFixed(2)}`;
        if (productDescription) {
            productDescription.textContent = product.description || 'A masterpiece of handcrafted glass art, designed to elevate any space.';
        }
        if (addToCartBtn) {
            addToCartBtn.dataset.id = product.id;
            addToCartBtn.dataset.name = product.name;
            addToCartBtn.dataset.price = price.toFixed(2);
            addToCartBtn.dataset.image = product.image;
        }
        loadRelatedProducts(product.category, product.id);
    } catch (err) {
        console.error('Unexpected error loading product:', err);
        document.querySelector('.product-detail-container').innerHTML = '<p class="error-message">Error loading product. Please try again later.</p>';
    }
}

async function loadRelatedProducts(category, currentId) {
    try {
        const { data: related, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('category', category)
            .not('id', 'eq', currentId)
            .limit(8);
        const relatedSection = document.querySelector('.related-products');
        if (!relatedSection) return;
        if (error || !related || related.length === 0) {
            relatedSection.style.display = 'none';
            return;
        }
        const wrapper = document.getElementById('related-products-grid');
        if (!wrapper) return;
        wrapper.innerHTML = related.map(product => {
            const price = parseFloat(product.price || 0);
            return `
                <div class="swiper-slide">
                    <a href="product-detail.html?id=${product.id}" class="related-product-card">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/600x600/dde5f2/FFFFFF?text=Image'">
                        <div class="related-product-info">
                            <h3>${product.name}</h3>
                            <p class="price">${price.toFixed(2)}</p>
                        </div>
                    </a>
                </div>
            `;
        }).join('');
        const breakpoints = {
            320: { slidesPerView: 1, spaceBetween: 20 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            900: { slidesPerView: 3, spaceBetween: 30 },
            1100: { slidesPerView: 4, spaceBetween: 30 }
        };
        new Swiper('.swiper-container', {
            loop: related.length > 4,
            slidesPerView: 1,
            spaceBetween: 20,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: breakpoints,
        });
    } catch (err) {
        console.error('Error loading related products:', err);
        const relatedSection = document.querySelector('.related-products');
        if (relatedSection) {
           relatedSection.style.display = 'none';
        }
    }
}

function initializeProductDetailPage() {
    gsap.registerPlugin(ScrollTrigger);
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    addToCartBtn = document.getElementById('add-to-cart-btn');
    
    addToCartBtn?.addEventListener('click', (e) => {
        const product = {
            id: e.target.dataset.id,
            name: e.target.dataset.name,
            price: parseFloat(e.target.dataset.price) || 0,
            image: e.target.dataset.image
        };
        if (window.addToCartById) {
            window.addToCartById(product);
        }
    });

    initPageAnimations();
    
    if (productId) {
        loadProductDetails(productId);
    } else {
        document.querySelector('.product-detail-container').innerHTML = '<p class="error-message">Product not found.</p>';
    }
}

document.addEventListener('DOMContentLoaded', initializeProductDetailPage);