'use strict';

const bestsellers = [
  { 
    id: 1, 
    name: 'Vase Collection', 
    description: 'A curated selection of our most popular artisanal vases.',
    image: 'img/bestsellers/Vase Collection.jpg' 
  },
  { 
    id: 2, 
    name: 'Glassware Collection', 
    description: 'An exquisite collection of handcrafted glassware for every occasion.',
    image: 'img/bestsellers/Glassware Collection.jpg'
  },
  { 
    id: 3, 
    name: 'Decor Collection', 
    description: 'Stunning art glass pieces to elevate any interior.',
    image: 'img/bestsellers/Decor Collection.jpg'
  }
];

function BestsellersCarousel() {
    const [currentIndex, setCurrentIndex] = React.useState(1);
    const [isTransitioning, setIsTransitioning] = React.useState(true);
    const [isAutoplayActive, setIsAutoplayActive] = React.useState(true);
    const autoplayTimeoutRef = React.useRef(null);

    const itemsToShow = React.useMemo(() => [
        bestsellers[bestsellers.length - 1],
        ...bestsellers, 
        bestsellers[0]
    ], []);

    const advanceSlide = React.useCallback((direction) => {
        if (!isTransitioning) return;
        setCurrentIndex(prevIndex => prevIndex + direction);
    }, [isTransitioning]);

    React.useEffect(() => {
        let interval = null;
        if (isAutoplayActive) {
            interval = setInterval(() => advanceSlide(1), 4000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isAutoplayActive, advanceSlide]);

    React.useEffect(() => {
        if (currentIndex === itemsToShow.length - 1) {
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(1);
                setTimeout(() => setIsTransitioning(true), 50);
            }, 1150);
            return () => clearTimeout(timer);
        }
        if (currentIndex === 0) {
             const timer = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(itemsToShow.length - 2);
                setTimeout(() => setIsTransitioning(true), 50);
            }, 1150);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, itemsToShow.length]);

    React.useEffect(() => {
        return () => {
            if (autoplayTimeoutRef.current) {
                clearTimeout(autoplayTimeoutRef.current);
            }
        };
    }, []);

    const handleInteraction = () => {
        setIsAutoplayActive(false);
        if (autoplayTimeoutRef.current) {
            clearTimeout(autoplayTimeoutRef.current);
        }
        autoplayTimeoutRef.current = setTimeout(() => {
            setIsAutoplayActive(true);
        }, 300000);
    };

    const handleNextClick = () => {
        advanceSlide(1);
        handleInteraction();
    };

    const handlePrevClick = () => {
        advanceSlide(-1);
        handleInteraction();
    };

    const wrapperStyle = {
        display: 'flex',
        width: `${itemsToShow.length * 100}%`,
        transform: `translateX(-${(currentIndex / itemsToShow.length) * 100}%)`,
        transition: isTransitioning ? 'transform 1.2s cubic-bezier(0.77, 0, 0.175, 1)' : 'none'
    };

    return (
        React.createElement('div', { className: 'bestsellers-slider-container' },
            React.createElement('div', { style: wrapperStyle },
                itemsToShow.map((artwork, index) => (
                    React.createElement('div', { className: 'bestsellers-slide-item', key: index },
                        React.createElement('div', { className: 'bestsellers-card' },
                            React.createElement('img', { src: artwork.image, alt: artwork.name })
                        )
                    )
                ))
            ),
            React.createElement('button', { className: 'carousel-arrow prev', onClick: handlePrevClick, 'aria-label': 'Previous slide' }),
            React.createElement('button', { className: 'carousel-arrow next', onClick: handleNextClick, 'aria-label': 'Next slide' })
        )
    );
}

ReactDOM.render(React.createElement(BestsellersCarousel), document.getElementById('react-root'));
