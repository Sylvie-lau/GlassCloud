let productGrid, sortSelect, categorySidebarLinks, categoryNavLinks;
let productData = [];

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

async function performSearch(query) {
    try {
        if (!query) {
            productData = [];
            sortAndRenderProducts();
            return;
        }
        const lowerQuery = query.toLowerCase().trim();
        const categoryMap = {
            'vases': ['vase', 'va'],
            'glassware': ['glass'],
            'decor': ['deco'],
            'bowls': ['bowl'],
            'candleholders': ['candle', 'holder'],
            'gift sets': ['gift', 'gifts', 'set', 'gi', 'fit']
        };
        let orConditions = [`name.ilike.%${lowerQuery}%`, `category.ilike.%${lowerQuery}%`];
        for (const category in categoryMap) {
            if (category.includes(lowerQuery) || categoryMap[category].some(term => lowerQuery.includes(term))) {
                orConditions.push(`category.ilike.%${category}%`);
            }
        }
        orConditions = [...new Set(orConditions)];
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .or(orConditions.join(','));
        if (error) {
            console.error('Error during search:', error);
            if (productGrid) productGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Error performing search.</p>';
            return;
        }
        productData = data || [];
        sortAndRenderProducts();
    } catch (err) {
        console.error('Unexpected error during search:', err);
        if (productGrid) productGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Search error. Please try again.</p>';
    }
}

function renderProducts(products) {
    if (!productGrid) return;
    productGrid.innerHTML = '';
    if (!products || products.length === 0) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery) {
             productGrid.innerHTML = `<p style="text-align: center; padding: 40px; color: #666;">No products found for "${searchQuery}".</p>`;
        } else {
             productGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No products in this category.</p>';
        }
        return;
    }
    products.forEach(product => {
        const price = parseFloat(product.price || 0);
        const productCardHTML = `
            <div class="product-card">
                <a href="product-detail.html?id=${product.id}">
                    <div class="product-image-wrapper">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/600x600/dde5f2/FFFFFF?text=Image'">
                    </div>
                    <div class="product-card-info">
                        <p class="product-category">${product.category}</p>
                        <h3>${product.name}</h3>
                        <p class="product-price">$${price.toFixed(2)}</p>
                    </div>
                </a>
                <div class="product-card-actions">
                    <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${price.toFixed(2)}" data-image="${product.image}">Add to Cart</button>
                </div>
            </div>
        `;
        productGrid.innerHTML += productCardHTML;
    });
}

function sortAndRenderProducts() {
    if (!productData) {
        renderProducts([]);
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    let productsToRender = [...productData];
    if (!searchQuery) {
        const activeCategoryLink = document.querySelector('.category-sidebar-link.active');
        const category = activeCategoryLink ? activeCategoryLink.dataset.category : 'all';
        if (category !== 'all') {
            productsToRender = productData.filter(p => p.category === category);
        }
    }
    const sortCriteria = sortSelect?.value || 'default';
    switch (sortCriteria) {
        case 'price-asc':
            productsToRender.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
            break;
        case 'price-desc':
            productsToRender.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
            break;
        default:
            break;
    }
    renderProducts(productsToRender);
}

function setInitialCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromURL = urlParams.get('category');
    if (categoryFromURL) {
        document.querySelectorAll('.category-sidebar-link, .category-nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll(`.category-sidebar-link[data-category="${categoryFromURL}"], .category-nav-link[data-category="${categoryFromURL}"]`).forEach(l => l.classList.add('active'));
    }
}

async function loadProducts() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        const pageTitle = document.querySelector('.shop-page-title h1');
        if (searchQuery) {
            if (pageTitle) pageTitle.textContent = `Results for "${searchQuery}"`;
            document.querySelectorAll('.category-sidebar-link').forEach(l => l.classList.remove('active'));
            await performSearch(searchQuery);
        } else {
            if (pageTitle) pageTitle.textContent = 'Products';
            const { data, error } = await supabaseClient.from('products').select('*');
            if (error) {
                console.error('Error fetching products:', error);
                if (productGrid) productGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Error loading products. Please refresh the page.</p>';
            } else {
                productData = data || [];
                setInitialCategory();
                sortAndRenderProducts();
            }
        }
    } catch (err) {
        console.error('Unexpected error loading products:', err);
        if (productGrid) productGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Error loading products. Please try again later.</p>';
    }
}

function handleCategoryLink(e) {
    e.preventDefault();
    const category = e.currentTarget.dataset.category;
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('search');
    newUrl.searchParams.set('category', category);
    window.history.pushState({}, '', newUrl);
    document.querySelectorAll('.category-sidebar-link, .category-nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll(`.category-sidebar-link[data-category="${category}"], .category-nav-link[data-category="${category}"]`).forEach(l => l.classList.add('active'));
    if (category === 'all') {
        const allLink = document.querySelector('.category-sidebar-link[data-category="all"]');
        if (allLink) allLink.classList.add('active');
    }
    if (sortSelect) sortSelect.value = 'default';
    sortAndRenderProducts();
}

function initializeProductsPage() {
    productGrid = document.querySelector('.product-grid');
    sortSelect = document.getElementById('sort-select');
    categorySidebarLinks = document.querySelectorAll('.category-sidebar-link');
    categoryNavLinks = document.querySelectorAll('.category-nav-link');
    
    document.body.addEventListener('click', e => {
        if (e.target.classList.contains('add-to-cart')) {
            const button = e.target;
            const product = {
                id: button.dataset.id,
                name: button.dataset.name,
                price: parseFloat(button.dataset.price) || 0,
                image: button.dataset.image
            };
            if (window.addToCartById) { 
                window.addToCartById(product);
            }
        }
    });
    
    gsap.registerPlugin(ScrollTrigger);
    sortSelect?.addEventListener('change', sortAndRenderProducts);
    categorySidebarLinks.forEach(link => link.addEventListener('click', handleCategoryLink));
    categoryNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.currentTarget.dataset.category;
            window.location.href = `products.html?category=${encodeURIComponent(category)}`;
        });
    });
    
    initPageAnimations();
    loadProducts();
}

document.addEventListener('DOMContentLoaded', initializeProductsPage);