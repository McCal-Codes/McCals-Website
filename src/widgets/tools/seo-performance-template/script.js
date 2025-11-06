/* global document */

// SEO/Performance Widget Script

document.addEventListener('DOMContentLoaded', () => {
    console.log('SEO/Performance Widget Loaded');

    // Example: Lazy load additional content
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
        img.addEventListener('load', () => {
            console.log(`Image loaded: ${img.src}`);
        });
    });
});