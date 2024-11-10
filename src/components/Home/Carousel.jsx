import React, { useState, useEffect } from 'react';
import './Carousel.css';

const Carousel = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const carouselImages = [
    '/images/pic2.jpg',
    '/images/pic3.jpg',
    '/images/pic4.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentImage((prev) => 
      (prev - 1 + carouselImages.length) % carouselImages.length
    );
  };

  const handleNext = () => {
    setCurrentImage((prev) => (prev + 1) % carouselImages.length);
  };

  return (
    <div className="carousel" aria-label="Image Carousel">
      <img 
        src={carouselImages[currentImage]} 
        alt={`Slide ${currentImage + 1}`} 
        id="carousel-image" 
        loading="lazy" 
      />
      <button 
        className="carousel-button prev" 
        onClick={handlePrev}
        aria-label="Previous image"
      >
        &lt;
      </button>
      <button 
        className="carousel-button next" 
        onClick={handleNext}
        aria-label="Next image"
      >
        &gt;
      </button>
    </div>
  );
};

export default Carousel; 