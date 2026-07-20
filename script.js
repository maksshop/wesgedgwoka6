/**
 * Estate Atelier - Main JavaScript
 * Modular structure with localStorage theme persistence
 */

// ============================================
// THEME MODULE
// ============================================
const ThemeModule = (() => {
  const STORAGE_KEY = "estate-atelier-theme";
  const root = document.documentElement;
  const themeToggle = document.querySelector('[data-theme-toggle]');

  // Get saved theme or system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme) return savedTheme;
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  // Update theme icon based on current theme
  const updateThemeIcon = (theme) => {
    if (!themeToggle) return;
    
    const moonIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    const sunIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    
    themeToggle.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
  };

  // Set theme
  const setTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateThemeIcon(theme);
  };

  // Toggle theme
  const toggleTheme = () => {
    const currentTheme = root.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Initialize
  const init = () => {
    if (!themeToggle) return;
    
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    
    themeToggle.addEventListener('click', toggleTheme);
  };

  return { init };
})();

// ============================================
// MOBILE MENU MODULE
// ============================================
const MobileMenuModule = (() => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  const toggleMenu = () => {
    if (!mobilePanel || !menuToggle) return;
    const isOpen = mobilePanel.classList.toggle('is-open');
    
    // Update ARIA attributes
    menuToggle.setAttribute('aria-expanded', isOpen);
    mobilePanel.setAttribute('aria-hidden', !isOpen);
    
    // Focus management
    if (isOpen) {
      const firstLink = mobilePanel.querySelector('a');
      if (firstLink) firstLink.focus();
    }
  };

  const closeMenu = () => {
    if (!mobilePanel || !menuToggle) return;
    mobilePanel.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobilePanel.setAttribute('aria-hidden', 'true');
  };

  const init = () => {
    if (!menuToggle || !mobilePanel) return;

    menuToggle.addEventListener('click', toggleMenu);

    // Close menu when clicking on links
    mobilePanel.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobilePanel.classList.contains('is-open')) {
        closeMenu();
        menuToggle.focus();
      }
    });

    // Close menu on click outside
    document.addEventListener('click', (e) => {
      if (!mobilePanel.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMenu();
      }
    });
  };

  return { init };
})();

// ============================================
// SCROLL ANIMATIONS MODULE
// ============================================
const ScrollAnimationsModule = (() => {
  const observerOptions = {
    threshold: 0.14,
    rootMargin: '0px 0px -50px 0px'
  };

  const handleIntersection = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Optional: unobserve after animation
        // observer.unobserve(entry.target);
      }
    });
  };

  const init = () => {
    const revealElements = document.querySelectorAll('.reveal');
    
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    revealElements.forEach(el => observer.observe(el));
  };

  return { init };
})();

// ============================================
// TOAST NOTIFICATION MODULE
// ============================================
const ToastModule = (() => {
  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      padding: 1rem 2rem;
      border-radius: var(--radius-lg);
      background: ${type === 'success' ? 'var(--color-success)' : '#dc3545'};
      color: white;
      font-weight: 600;
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      opacity: 0;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `;
    
    const icon = type === 'success' ? '✓' : '✕';
    toast.innerHTML = `<span style="font-size: 1.2rem;">${icon}</span> ${message}`;
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    // Remove after delay
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  return { showToast };
})();

// ============================================
// CONTACT FORM MODULE
// ============================================
const ContactFormModule = (() => {
  const form = document.getElementById('contactForm');
  const SUBMIT_SUCCESS_MESSAGE = 'Изпратено успешно';
  const RESET_DELAY = 1800;

  const validateForm = (formData) => {
    const errors = {};
    
    if (!formData.get('name')?.trim()) {
      errors.name = 'Моля, въведете вашето име';
    }
    
    if (!formData.get('phone')?.trim()) {
      errors.phone = 'Моля, въведете вашия телефон';
    }
    
    const email = formData.get('email')?.trim();
    if (email && !isValidEmail(email)) {
      errors.email = 'Моля, въведете валиден имейл адрес';
    }
    
    return errors;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showSuccess = (btn, originalText) => {
    btn.textContent = SUBMIT_SUCCESS_MESSAGE;
    btn.disabled = true;
    
    // Show toast notification
    ToastModule.showToast('Запитването е изпратено успешно!', 'success');
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      form.reset();
    }, RESET_DELAY);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form) return;

    const formData = new FormData(form);
    const errors = validateForm(formData);
    
    if (Object.keys(errors).length > 0) {
      console.warn('Form validation errors:', errors);
      ToastModule.showToast('Моля, попълнете всички задължителни полета', 'error');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;

    const originalText = btn.textContent;
    
    try {
      // Here you would typically send the form data to a server
      // For now, we'll just show success
      showSuccess(btn, originalText);
      
      console.log('Form submitted successfully:', Object.fromEntries(formData));
    } catch (error) {
      console.error('Form submission error:', error);
      btn.textContent = 'Грешка при изпращане';
      ToastModule.showToast('Възникна грешка при изпращане', 'error');
      setTimeout(() => {
        btn.textContent = originalText;
      }, RESET_DELAY);
    }
  };

  const init = () => {
    if (!form) return;
    
    form.addEventListener('submit', handleSubmit);
  };

  return { init };
})();

// ============================================
// SMOOTH SCROLL MODULE
// ============================================
const SmoothScrollModule = (() => {
  const init = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  };

  return { init };
})();

// ============================================
// ANIMATED COUNTERS MODULE
// ============================================
const CountersModule = (() => {
  const animateCounter = (element, target, duration = 2000) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };
    
    updateCounter();
  };

  const init = () => {
    const counters = document.querySelectorAll('.counter');
    const metrics = document.querySelectorAll('.metric[data-count]');
    
    if (metrics.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target.querySelector('.counter');
          const target = parseInt(entry.target.dataset.count);
          
          if (counter && target) {
            animateCounter(counter, target);
            observer.unobserve(entry.target);
          }
        }
      });
    }, { threshold: 0.5 });

    metrics.forEach(metric => observer.observe(metric));
  };

  return { init };
})();

// ============================================
// SCROLL PROGRESS MODULE
// ============================================
const ScrollProgressModule = (() => {
  const init = () => {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
      z-index: 1000;
      transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      progressBar.style.width = `${progress}%`;
    };

    window.addEventListener('scroll', updateProgress);
  };

  return { init };
})();

// ============================================
// BACK TO TOP MODULE
// ============================================
const BackToTopModule = (() => {
  const init = () => {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.setAttribute('aria-label', 'Обратно към началото');
    button.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>';
    button.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 3rem;
      height: 3rem;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--color-primary);
      color: var(--color-text-inverse);
      border: none;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
      transition: all 0.3s ease;
      z-index: 99;
      box-shadow: var(--shadow-md);
    `;
    document.body.appendChild(button);

    const toggleButton = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 500) {
        button.style.opacity = '1';
        button.style.visibility = 'visible';
        button.style.transform = 'translateY(0)';
      } else {
        button.style.opacity = '0';
        button.style.visibility = 'hidden';
        button.style.transform = 'translateY(20px)';
      }
    };

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    window.addEventListener('scroll', toggleButton);
    button.addEventListener('click', scrollToTop);
  };

  return { init };
})();

// ============================================
// PARALLAX EFFECT MODULE
// ============================================
const ParallaxModule = (() => {
  const init = () => {
    const parallaxElements = document.querySelectorAll('.hero-image, .about-visual');
    
    if (parallaxElements.length === 0) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      
      parallaxElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const speed = 0.3;
        
        // Only animate if element is in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const yPos = -(scrolled * speed);
          element.style.transform = `translateY(${yPos}px)`;
        }
      });
    };

    // Use requestAnimationFrame for better performance
    let ticking = false;
    const optimizedScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedScroll, { passive: true });
  };

  return { init };
});

// ============================================
// PROPERTY GALLERY MODULE
// ============================================
const PropertyGalleryModule = (() => {
  let imageSets = {
    1: [
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80'
    ],
    2: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80'
    ],
    3: [
      'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&q=80'
    ]
  };

  const initGallery = (gallery) => {
    const galleryId = gallery.dataset.gallery;
    const mainImage = gallery.querySelector('.gallery-main');
    const thumbnails = gallery.querySelectorAll('.thumbnail');
    const images = imageSets[galleryId] || [];

    console.log('Gallery ID:', galleryId, 'Thumbnails:', thumbnails.length, 'Images:', images.length);

    if (!mainImage) {
      console.error('Main image not found for gallery:', galleryId);
      return;
    }

    if (thumbnails.length === 0) {
      console.error('No thumbnails found for gallery:', galleryId);
      return;
    }

    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Thumbnail clicked:', index, 'Image:', images[index]);
        
        // Update active state
        thumbnails.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        
        // Update main image with fade effect
        mainImage.style.opacity = '0';
        setTimeout(() => {
          mainImage.style.backgroundImage = `url('${images[index]}')`;
          mainImage.style.opacity = '1';
        }, 150);
      });
    });
  };

  const init = () => {
    console.log('Initializing property galleries...');
    const galleries = document.querySelectorAll('.property-gallery');
    console.log('Galleries found:', galleries.length);
    galleries.forEach(initGallery);
    console.log('Property galleries initialized');
  };

  return { init, imageSets };
})();

// ============================================
// PROPERTY MODAL MODULE
// ============================================
const PropertyModalModule = (() => {
  let modal;
  let closeButtons;
  let detailsButtons;
  
  const propertyData = {
    1: {
      badge: 'Продажба',
      title: 'Тристаен апартамент с модерен интериор',
      location: 'Пловдив, централна градска част',
      price: '€ 189,000',
      details: [
        { label: 'Площ', value: '96 кв.м' },
        { label: 'Стаи', value: '3 стаи' },
        { label: 'Етаж', value: '3/5' },
        { label: 'Година', value: '2018' },
        { label: 'Обзаведен', value: 'Да' },
        { label: 'Асансьор', value: 'Да' }
      ],
      description: 'Луксозен тристаен апартамент в сърцето на Пловдив с модерен интериорен дизайн. Апартаментът предлага просторно дневно с кухненски бокс, две спални, баня с тоалетна и тераса с панорамна гледка към града. Напълно обзаведен с висококачествени мебели и техника.',
      features: ['Централна климатизация', 'ПВЦ дограма', 'Подово отопление', 'Smart home система', 'Паркомясто', 'Складово помещение'],
      gallery: []
    },
    2: {
      badge: 'Къща',
      title: 'Нова къща с двор и висока пазарна стойност',
      location: 'Пловдив, южна зона',
      price: '€ 315,000',
      details: [
        { label: 'Площ', value: '186 кв.м' },
        { label: 'Спални', value: '4 спални' },
        { label: 'Двор', value: '500 кв.м' },
        { label: 'Година', value: '2020' },
        { label: 'Гараж', value: '2 места' },
        { label: 'Басейн', value: 'Да' }
      ],
      description: 'Ексклузивна нова къща в престижния южен район на Пловдив. Съвременна архитектура с четири спални, просторен хол с кухня, три бани, гараж за два автомобила и басейн в двора. Идеална за семейство, което търси комфорт и високо качество на живот.',
      features: ['Слънчеви колектори', 'Алармена система', 'Видео наблюдение', 'Автоматично поливане', 'Барбекю зона', 'Оранжерия'],
      gallery: []
    },
    3: {
      badge: 'Инвестиция',
      title: 'Парцел за жилищно строителство',
      location: 'с. Белащица / район Пловдив',
      price: '€ 92,500',
      details: [
        { label: 'Площ', value: '1000 кв.м' },
        { label: 'Статус', value: 'УПИ' },
        { label: 'Достъп', value: 'Асфалтиран' },
        { label: 'Категория', value: 'Жилищен' },
        { label: 'Ток', value: 'Да' },
        { label: 'Вода', value: 'Да' }
      ],
      description: 'Парцел с отлична локация в с. Белащица, подходящ за жилищно строителство. Равен терен с всички необходими комуникации. Перспективна инвестиция с възможност за изграждане на еднофамилен дом или няколко къщи.',
      features: ['Панорамна гледка', 'Близо до града', 'Тихо място', 'Регулация', 'Удобен достъп', 'Възможност за застрояване'],
      gallery: []
    }
  };

  const openModal = (propertyId) => {
    const data = propertyData[propertyId];
    if (!data) {
      console.error('Property data not found:', propertyId);
      return;
    }

    console.log('Opening modal for property:', propertyId);

    // Populate modal content
    const modalBadge = document.getElementById('modalBadge');
    const modalTitle = document.getElementById('modalTitle');
    const modalLocation = document.getElementById('modalLocation');
    const modalPrice = document.getElementById('modalPrice');
    const modalDescription = document.getElementById('modalDescription');
    const modalDetails = document.getElementById('modalDetails');
    const modalFeatures = document.getElementById('modalFeatures');
    const modalGallery = document.getElementById('modalGallery');

    if (!modalBadge || !modalTitle || !modalLocation || !modalPrice || !modalDescription || !modalDetails || !modalFeatures || !modalGallery) {
      console.error('Modal elements not found');
      return;
    }

    modalBadge.textContent = data.badge;
    modalTitle.textContent = data.title;
    modalLocation.textContent = data.location;
    modalPrice.textContent = data.price;
    modalDescription.textContent = data.description;

    // Populate details
    modalDetails.innerHTML = data.details.map(detail => `
      <div class="property-modal__detail-item">
        <span class="property-modal__detail-label">${detail.label}</span>
        <span class="property-modal__detail-value">${detail.value}</span>
      </div>
    `).join('');

    // Populate features
    modalFeatures.innerHTML = data.features.map(feature => `
      <div class="property-modal__feature">
        <span class="property-modal__feature-icon">✓</span>
        <span>${feature}</span>
      </div>
    `).join('');

    // Set gallery image (first one from PropertyGalleryModule)
    const imageSets = PropertyGalleryModule.imageSets || {};
    const images = imageSets[propertyId] || [];
    if (images.length > 0) {
      modalGallery.style.backgroundImage = `url('${images[0]}')`;
    }

    // Show modal
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const init = () => {
    console.log('Initializing property modal...');
    
    modal = document.getElementById('propertyModal');
    closeButtons = document.querySelectorAll('[data-modal-close]');
    detailsButtons = document.querySelectorAll('.property-details-btn');
    
    console.log('Modal element:', modal);
    console.log('Details buttons found:', detailsButtons.length);
    console.log('Close buttons found:', closeButtons.length);
    
    if (!modal) {
      console.error('Modal element not found');
      return;
    }

    if (detailsButtons.length === 0) {
      console.error('No details buttons found!');
      // Try alternative selector
      const allButtons = document.querySelectorAll('button');
      console.log('All buttons on page:', allButtons.length);
      allButtons.forEach((btn, i) => {
        console.log(`Button ${i}:`, btn.className, btn.textContent, btn.dataset);
      });
      return;
    }

    // Details buttons
    detailsButtons.forEach((btn, index) => {
      console.log(`Details button ${index}:`, btn.className, btn.dataset.property);
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const propertyId = btn.dataset.property;
        console.log('Details button clicked for property:', propertyId);
        openModal(propertyId);
      });
    });

    // Close buttons
    closeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Close on overlay click
    const overlay = modal.querySelector('.property-modal__overlay');
    if (overlay) {
      overlay.addEventListener('click', closeModal);
    }
    
    console.log('Property modal initialized successfully');
  };

  return { init };
})();

// ============================================
// LAZY LOADING MODULE
// ============================================
const LazyLoadModule = (() => {
  const init = () => {
    // Add lazy loading to images that don't have it
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  };

  return { init };
});

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  try {
    ThemeModule.init();
    MobileMenuModule.init();
    ScrollAnimationsModule.init();
    ContactFormModule.init();
    SmoothScrollModule.init();
    CountersModule.init();
    ScrollProgressModule.init();
    BackToTopModule.init();
    // ParallaxModule.init(); // Temporarily disabled
    PropertyGalleryModule.init();
    PropertyModalModule.init();
    LazyLoadModule.init();
    
    console.log('Estate Atelier initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// ============================================
// ERROR HANDLING
// ============================================
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});
