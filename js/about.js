function initPageAnimations() {
    const body = document.body;
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    const nav = document.querySelector('.nav');
    body.style.overflow = 'hidden';
    const tl = gsap.timeline({
        onComplete: () => {
            body.style.overflow = '';
            initScrollAnimations();
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

function initScrollAnimations() {
    gsap.utils.toArray('.animated-element').forEach(element => {
        gsap.fromTo(element, 
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });
}

function initializeAboutPage() {
    gsap.registerPlugin(ScrollTrigger);
    initPageAnimations();
}

document.addEventListener('DOMContentLoaded', initializeAboutPage);