// McCal Media Gallery App
class GalleryApp {
  constructor() {
    this.galleries = [];
    this.currentGallery = null;
    this.viewList = document.getElementById('view-list');
    this.viewGallery = document.getElementById('view-gallery');
    this.galleriesContainer = document.getElementById('galleries');
    this.thumbsContainer = document.getElementById('thumbs');
    this.galleryTitle = document.getElementById('gallery-title');
    this.categoryFilter = document.getElementById('category-filter');
    this.backButton = document.getElementById('back');
    
    this.init();
  }

  async init() {
    await this.loadGalleries();
    this.setupEventListeners();
    this.renderGalleries();
    this.setupCategories();
  }

  async loadGalleryFromManifest(basePath) {
    try {
      const response = await fetch(`${basePath}/manifest.json`);
      const files = await response.json();
      return files.map(file => `${basePath}/${file}`);
    } catch (error) {
      console.error(`Error loading manifest from ${basePath}:`, error);
      return [];
    }
  }

  async loadGalleries() {
    try {
      // Load Funky Lamp images from manifest
      const funkyLampBasePath = './images/Portfolios/Concert/Funky Lamp';
      const funkyLampImages = await this.loadGalleryFromManifest(funkyLampBasePath);
      
      // In a real app, this would fetch from your images API
      // For now, we'll simulate your portfolio structure
      this.galleries = [
        {
          id: 'funky-lamp',
          title: 'Funky Lamp',
          category: 'Concert',
          description: 'Live concert photography at Black Lodge Music (touched up December 2024)',
          date: '2024-01-13',
          coverImage: `${funkyLampBasePath}/2024/12/13-01-24_Black Lodge Music 183.jpg`,
          imageCount: funkyLampImages.length,
          images: funkyLampImages
        },
        {
          id: 'the-book-club',
          title: 'The Book Club',
          category: 'Concert',
          description: 'Live performance photography at Haven',
          date: '2024-08-29',
          coverImage: './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4584.jpg',
          imageCount: 23,
          images: [
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4584.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4587.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4588.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4607.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4610.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4634.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4640.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4649.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4652.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4659.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4667.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4670.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4677.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4678.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4691.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4694.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4700.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4701.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4709.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4712.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4730.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4742.jpg',
            './images/Portfolios/Concert/The Book Club/The Book Club/250829_Haven_CAL4746.jpg'
          ]
        },
        {
          id: 'turtle-park',
          title: 'Turtle Park',
          category: 'Concert',
          description: 'Live concert photography at Haven',
          date: '2024-08-29',
          coverImage: './images/Portfolios/Concert/Turtle Park/250829_Haven_CAL4388.jpg',
          imageCount: 8,
          images: [
            './images/Portfolios/Concert/Turtle Park/250829_Haven_CAL4388.jpg',
            './images/Portfolios/Concert/Turtle Park/250829_Haven_CAL4401.jpg',
            './images/Portfolios/Concert/Turtle Park/250829_Haven_CAL4437.jpg',
            './images/Portfolios/Concert/Turtle Park/250829_Haven_CAL4482.jpg',
            './images/Portfolios/Concert/Turtle Park/250829_Haven_CAL4490.jpg',
            './images/Portfolios/Concert/Turtle Park/250829_Haven_CAL4543.jpg',
            './images/Portfolios/Concert/Turtle Park/250829_Haven_CAL4570.jpg'
          ]
        },
        {
          id: 'stardust',
          title: 'We Are All Made of Stardust',
          category: 'Concert',
          description: 'Live performance at Haven',
          date: '2024-08-29',
          coverImage: './images/Portfolios/Concert/We Are All Made of Stardust/250829_Haven_CAL4356.jpg',
          imageCount: 5,
          images: [
            './images/Portfolios/Concert/We Are All Made of Stardust/250829_Haven_CAL4356.jpg',
            './images/Portfolios/Concert/We Are All Made of Stardust/250829_Haven_CAL4363.jpg',
            './images/Portfolios/Concert/We Are All Made of Stardust/250829_Haven_CAL4373.jpg',
            './images/Portfolios/Concert/We Are All Made of Stardust/250829_Haven_CAL4376.jpg',
            './images/Portfolios/Concert/We Are All Made of Stardust/250829_Haven_CAL4382.jpg'
          ]
        },
        {
          id: 'journalism',
          title: 'Journalism Portfolio',
          category: 'Journalism',
          description: 'Political events and portrait photography',
          date: '2024-03-15',
          coverImage: './images/Portfolios/Journalism/250315_Butler Democracy Protest_CAL9773.jpg',
          imageCount: 2,
          images: [
            './images/Portfolios/Journalism/250315_Butler Democracy Protest_CAL9773.jpg',
            './images/Portfolios/Journalism/250417 The Rooney Rule_CAL3148.jpg'
          ]
        }
      ];
    } catch (error) {
      console.error('Error loading galleries:', error);
    }
  }

  setupEventListeners() {
    this.backButton.addEventListener('click', () => this.showGalleryList());
    this.categoryFilter.addEventListener('change', () => this.filterGalleries());
    
    // Handle browser back button
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.gallery) {
        this.showGallery(e.state.gallery);
      } else {
        this.showGalleryList();
      }
    });
  }

  setupCategories() {
    const categories = [...new Set(this.galleries.map(g => g.category))];
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.toLowerCase();
      option.textContent = category;
      this.categoryFilter.appendChild(option);
    });
  }

  renderGalleries() {
    const selectedCategory = this.categoryFilter.value;
    const filteredGalleries = selectedCategory 
      ? this.galleries.filter(g => g.category.toLowerCase() === selectedCategory)
      : this.galleries;

    this.galleriesContainer.innerHTML = filteredGalleries.map(gallery => `
      <article class="gallery-item" data-gallery-id="${gallery.id}">
        <img src="${gallery.coverImage}" alt="${gallery.title}" loading="lazy" />
        <div class="gallery-item-content">
          <h3>${gallery.title}</h3>
          <p>${gallery.description}</p>
          <div class="meta">
            <span>${gallery.category}</span>
            <span>${gallery.imageCount} photos</span>
          </div>
        </div>
      </article>
    `).join('');

    // Add click listeners
    this.galleriesContainer.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const galleryId = item.dataset.galleryId;
        const gallery = this.galleries.find(g => g.id === galleryId);
        if (gallery) {
          this.showGallery(gallery);
          history.pushState({ gallery: gallery.id }, '', `#${gallery.id}`);
        }
      });
    });
  }

  filterGalleries() {
    this.renderGalleries();
  }

  showGallery(gallery) {
    this.currentGallery = gallery;
    this.galleryTitle.textContent = gallery.title;
    
    this.thumbsContainer.innerHTML = gallery.images.map((image, index) => `
      <div class="thumb" data-image-index="${index}">
        <img src="${image}" alt="${gallery.title} - Photo ${index + 1}" loading="lazy" />
        <div class="thumb-overlay">
          <span>View Image</span>
        </div>
      </div>
    `).join('');

    // Add click listeners for lightbox (simplified for now)
    this.thumbsContainer.querySelectorAll('.thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const imageIndex = parseInt(thumb.dataset.imageIndex);
        this.openLightbox(gallery.images[imageIndex]);
      });
    });

    this.viewList.hidden = true;
    this.viewGallery.hidden = false;
  }

  showGalleryList() {
    this.viewList.hidden = false;
    this.viewGallery.hidden = true;
    this.currentGallery = null;
    history.pushState(null, '', location.pathname);
  }

  openLightbox(imageSrc) {
    // Simple lightbox - open image in new tab for now
    // In a real app, you'd implement a proper lightbox modal
    window.open(imageSrc, '_blank');
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new GalleryApp();
});