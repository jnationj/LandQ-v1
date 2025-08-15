// components/ImageCarousel.tsx
'use client';

import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import { useEffect } from 'react';

const images = [
  '/assets/hero1.jpg',
  '/assets/hero2.jpg',
  '/assets/hero3.jpg',
  '/assets/hero4.jpg',
];

export default function ImageCarousel() {
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slideChanged: () => {},
    created: () => {},
  });

  // Auto-play every 5 seconds
  useEffect(() => {
    if (!slider) return;
    const interval = setInterval(() => {
      slider.current?.next();
    }, 5000);
    return () => clearInterval(interval);
  }, [slider]);

  return (
    <div ref={sliderRef} className="keen-slider rounded-xl overflow-hidden shadow-lg">
      {images.map((src, index) => (
        <div className="keen-slider__slide" key={index}>
          <img src={src} alt={`Slide ${index + 1}`} className="w-full h-auto object-cover" />
        </div>
      ))}
    </div>
  );
}
