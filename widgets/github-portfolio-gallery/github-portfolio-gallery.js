(function() {
  'use strict';
  
  // Configuration
  const GITHUB_CONFIG = {
    owner: 'McCal-Codes',
    repo: 'McCals-Website',
    path: 'images/Portfolios',
    branch: 'main'
  };
  
  // GitHub API URLs
  const GITHUB_API_BASE = 'https://api.github.com';
  const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';
  
  // Gallery container selector - adjust this for your Squarespace page
  const GALLERY_CONTAINER = '.portfolio-gallery'; // Change to your container class/ID
  
  // Supported image extensions
  const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  
  // Cache for better performance
  let portfolioCache = null;
  let cacheTimestamp = null;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Check if cached data is still valid
   */
  function isCacheValid() {
    return portfolioCache && cacheTimestamp && 
           (Date.now() - cacheTimestamp) < CACHE_DURATION;
  }
  
  /**
   * Get portfolio folders from GitHub API
   */
  async function getPortfolioFolders() {
    if (isCacheValid()) {
      return portfolioCache;
    }
    
    try {
      const url = `${GITHUB_API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      const folders = data.filter(item => item.type === 'dir');
      
      // Get images for each folder
      const portfolios = await Promise.all(
        folders.map(async folder => {
          try {
            const imagesResponse = await fetch(
              `${GITHUB_API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}/${folder.name}`
            );
            
            if (!imagesResponse.ok) {
              console.warn(`Failed to fetch images for ${folder.name}`);
              return null;
            }
            
            const images = await imagesResponse.json();
            const imageFiles = images
              .filter(file => file.type === 'file')
              .filter(file => IMAGE_EXTENSIONS.some(ext => 
                file.name.toLowerCase().endsWith(ext)
              ))
              .map(file => ({
                name: file.name,
                url: `${GITHUB_RAW_BASE}/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.path}/${folder.name}/${file.name}`,
                downloadUrl: file.download_url
              }));
            
            if (imageFiles.length === 0) return null;
            
            return {
              name: folder.name,
              displayName: folder.name.replace(/[-_]/g, ' '), // Clean up folder names
              images: imageFiles,
              thumbnail: imageFiles[0] // Use first image as thumbnail
            };
          } catch (error) {
            console.warn(`Error fetching images for ${folder.name}:`, error);
            return null;
          }
        })
      );
      
      // Filter out failed requests and cache result
      portfolioCache = portfolios.filter(portfolio => portfolio !== null);
      cacheTimestamp = Date.now();
      
      return portfolioCache;
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      return [];
    }
  }
  
  /**
   * Create gallery HTML structure
   */
  function createGalleryHTML(portfolios) {
    const galleryHTML = `
      <div class="github-portfolio-gallery">
        <div class="portfolio-grid">
          ${portfolios.map(portfolio => `
            <div class="portfolio-card" data-portfolio="${portfolio.name}">
              <div class="portfolio-thumbnail">
                <img src="${portfolio.thumbnail.url}" 
                     alt="${portfolio.displayName}" 
                     loading="lazy"
                     onerror="this.style.display='none'">
                <div class="portfolio-overlay">
                  <h3 class="portfolio-title">${portfolio.displayName}</h3>
                  <p class="portfolio-count">${portfolio.images.length} images</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Lightbox Modal -->
      <div id="portfolioLightbox" class="portfolio-lightbox" aria-hidden="true">
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close gallery">&times;</button>
          <div class="lightbox-header">
            <h2 id="lightboxTitle"></h2>
            <p id="lightboxMeta"></p>
          </div>
          <div class="lightbox-gallery" id="lightboxGallery">
            <div class="loading-spinner">Loading images...</div>
          </div>
        </div>
      </div>
    `;
    
    return galleryHTML;
  }
  
  /**
   * Add CSS styles to page
   */
  function addStyles() {
    const styles = `
      <style>
        .github-portfolio-gallery {
          margin: 20px 0;
        }
        
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          padding: 20px 0;
        }
        
        .portfolio-card {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          background: #f5f5f5;
        }
        
        .portfolio-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        .portfolio-thumbnail {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
        }
        
        .portfolio-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .portfolio-card:hover .portfolio-thumbnail img {
          transform: scale(1.05);
        }
        
        .portfolio-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          color: white;
          padding: 30px 15px 15px;
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }
        
        .portfolio-card:hover .portfolio-overlay {
          transform: translateY(0);
        }
        
        .portfolio-title {
          margin: 0 0 5px 0;
          font-size: 16px;
          font-weight: bold;
        }
        
        .portfolio-count {
          margin: 0;
          font-size: 12px;
          opacity: 0.9;
        }
        
        /* Lightbox Styles */
        .portfolio-lightbox {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          z-index: 10000;
        }
        
        .portfolio-lightbox.is-open {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .lightbox-content {
          width: 90%;
          height: 90%;
          max-width: 1200px;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        .lightbox-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: none;
          border: none;
          color: white;
          font-size: 30px;
          cursor: pointer;
          z-index: 10001;
        }
        
        .lightbox-header {
          color: white;
          text-align: center;
          padding: 0 0 20px 0;
        }
        
        .lightbox-header h2 {
          margin: 0 0 5px 0;
        }
        
        .lightbox-header p {
          margin: 0;
          opacity: 0.8;
        }
        
        .lightbox-gallery {
          flex: 1;
          overflow-y: auto;
          text-align: center;
          padding: 20px;
        }
        
        .lightbox-gallery img {
          max-width: 100%;
          max-height: 80vh;
          margin: 10px auto;
          display: block;
          border-radius: 4px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        
        .loading-spinner {
          color: white;
          text-align: center;
          padding: 50px;
          font-size: 16px;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .portfolio-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          .portfolio-thumbnail {
            height: 150px;
          }
          
          .lightbox-content {
            width: 95%;
            height: 95%;
          }
          
          .lightbox-gallery {
            padding: 10px;
          }
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }
  
  /**
   * Open lightbox with portfolio images
   */
  async function openLightbox(portfolio) {
    const lightbox = document.getElementById('portfolioLightbox');
    const gallery = document.getElementById('lightboxGallery');
    const title = document.getElementById('lightboxTitle');
    const meta = document.getElementById('lightboxMeta');
    
    // Set title and meta
    title.textContent = portfolio.displayName;
    meta.textContent = `${portfolio.images.length} images`;
    
    // Show loading spinner
    gallery.innerHTML = '<div class="loading-spinner">Loading images...</div>';
    
    // Open lightbox
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Load images
    const imageElements = portfolio.images.map(image => 
      `<img src="${image.url}" alt="${image.name}" loading="lazy" onerror="this.style.display='none'">`
    ).join('');
    
    gallery.innerHTML = imageElements;
  }
  
  /**
   * Close lightbox
   */
  function closeLightbox() {
    const lightbox = document.getElementById('portfolioLightbox');
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  
  /**
   * Initialize the gallery
   */
  async function initGallery() {
    const container = document.querySelector(GALLERY_CONTAINER);
    
    if (!container) {
      console.warn(`Gallery container "${GALLERY_CONTAINER}" not found. Please update the selector.`);
      return;
    }
    
    // Show loading state
    container.innerHTML = '<div class="loading-spinner">Loading portfolio...</div>';
    
    try {
      // Fetch portfolio data
      const portfolios = await getPortfolioFolders();
      
      if (portfolios.length === 0) {
        container.innerHTML = '<p>No portfolios found or unable to load from GitHub.</p>';
        return;
      }
      
      // Add styles
      addStyles();
      
      // Create gallery
      container.innerHTML = createGalleryHTML(portfolios);
      
      // Add event listeners
      const cards = container.querySelectorAll('.portfolio-card');
      cards.forEach(card => {
        card.addEventListener('click', () => {
          const portfolioName = card.dataset.portfolio;
          const portfolio = portfolios.find(p => p.name === portfolioName);
          if (portfolio) {
            openLightbox(portfolio);
          }
        });
        
        // Keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });
      });
      
      // Lightbox close handlers
      const lightbox = document.getElementById('portfolioLightbox');
      const closeBtn = lightbox.querySelector('.lightbox-close');
      
      closeBtn.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
      });
      
      // ESC key handler
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
          closeLightbox();
        }
      });
      
    } catch (error) {
      console.error('Error initializing gallery:', error);
      container.innerHTML = '<p>Error loading portfolio. Please try again later.</p>';
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
  } else {
    initGallery();
  }
  
})();