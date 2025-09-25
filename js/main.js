function initPageAnimations() {
    const body = document.body;
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    const nav = document.querySelector('.nav');
    body.style.overflow = 'hidden';
    const tl = gsap.timeline({
        onComplete: () => {
            body.style.overflow = '';
            initHomepageAnimations();
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

function initHomepageAnimations() {
    if (document.querySelector('.hero-title')) {
        const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
        heroTl.fromTo('.hero-title .char', { y: '100%', opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 1.5 })
              .fromTo('.cs-button-solid', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=1.0");
    }
    gsap.utils.toArray('.section-title[data-splitting], .artisan-title[data-splitting], #store-feature h2[data-splitting]').forEach(title => {
        gsap.from(title.querySelectorAll('.char'), {
            scrollTrigger: {
                trigger: title,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            y: 15,
            opacity: 0,
            stagger: 0.05,
            duration: 0.8,
            ease: "power2.out"
        });
    });
}

function initArtisanGallery() {
    const artisanGallery = document.querySelector('.artwork-gallery');
    if (artisanGallery) {
        const galleryImages = [
            'img/bowls/Oceanic Opalescence.png',
            'img/bowls/Ember Patina.jpg',
            'img/candle holders/River Stone.jpg'
        ];
        const imageElement = document.getElementById('gallery-image');
        const prevButton = document.getElementById('gallery-prev-btn');
        const nextButton = document.getElementById('gallery-next-btn');
        let currentIndex = 0;
        function updateImage() {
            if(imageElement) {
                imageElement.src = galleryImages[currentIndex];
            }
        }
        nextButton?.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % galleryImages.length;
            updateImage();
        });
        prevButton?.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            updateImage();
        });
        updateImage();
    }
}

function initializeMainPage() {
    gsap.registerPlugin(ScrollTrigger);
    Splitting();
    AOS.init({ duration: 1000, once: true, offset: 100 });

    initPageAnimations();
    initArtisanGallery();
}

document.addEventListener('DOMContentLoaded', initializeMainPage);