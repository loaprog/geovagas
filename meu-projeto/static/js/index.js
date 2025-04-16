// Loader Removal
document.addEventListener("DOMContentLoaded", function() {
    const load = document.getElementById("load");
    if (load && !load.classList.contains('loader-removed')) {
        setTimeout(function() {
            load.classList.add("loader-removed");
        }, 300);
    }

    // Initialize all functionality
    initMobileMenu();
    initScrollTop();
    initWhatsAppWidget();
    initSmoothScrolling();
    initCompaniesCarousel();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.dt-mobile-header');
    const closeBtn = document.querySelector('.dt-close-mobile-menu-icon');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.add('active');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
        });
    }

    // Clone main nav to mobile nav
    const primaryMenu = document.getElementById('primary-menu');
    const mobileMenuContainer = document.getElementById('mobile-menu');
    
    if (primaryMenu && mobileMenuContainer) {
        mobileMenuContainer.innerHTML = primaryMenu.innerHTML;
    }
}

// Scroll to Top Button
function initScrollTop() {
    const scrollTop = document.querySelector('.scroll-top');
    
    if (scrollTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollTop.classList.add('on');
            } else {
                scrollTop.classList.remove('on');
            }
        });

        scrollTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// WhatsApp Widget
function initWhatsAppWidget() {
    const whatsappBtn = document.querySelector('.joinchat__button');
    const whatsappBox = document.querySelector('.joinchat__box');
    
    if (whatsappBtn && whatsappBox) {
        whatsappBtn.addEventListener('click', function() {
            whatsappBox.classList.toggle('active');
        });

        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.joinchat') && whatsappBox.classList.contains('active')) {
                whatsappBox.classList.remove('active');
            }
        });
    }
}

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Companies Carousel
function initCompaniesCarousel() {
    const carousel = document.querySelector('.companies-carousel');
    if (!carousel) return;

    // Sample companies data - replace with your actual data
    const companies = [
        { name: 'Company 1', logo: 'static/img/001-dark.png' },
        { name: 'Company 2', logo: 'static/img/002-dark.png' },
        { name: 'Company 3', logo: 'static/img/003-dark.png' },
        { name: 'Company 4', logo: 'static/img/004-dark.png' },
        { name: 'Company 5', logo: 'static/img/005-dark.png' },
        { name: 'Company 6', logo: 'static/img/006-dark.png' },
    ];

    // Populate carousel
    carousel.innerHTML = companies.map(company => `
        <img src="${company.logo}" alt="${company.name}" title="${company.name}">
    `).join('');

    // Initialize Swiper if available
    if (typeof Swiper !== 'undefined') {
        new Swiper('.companies-carousel', {
            slidesPerView: 'auto',
            spaceBetween: 30,
            freeMode: true,
            loop: true,
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
            },
            breakpoints: {
                768: {
                    slidesPerView: 4,
                },
                992: {
                    slidesPerView: 6,
                },
                1200: {
                    slidesPerView: 8,
                }
            }
        });
    }
}

// Lazy Loading
function initLazyLoading() {
    const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const lazyElement = entry.target;
                if (lazyElement.dataset.src) {
                    lazyElement.src = lazyElement.dataset.src;
                }
                if (lazyElement.dataset.srcset) {
                    lazyElement.srcset = lazyElement.dataset.srcset;
                }
                lazyElement.classList.remove('lazy');
                observer.unobserve(lazyElement);
            }
        });
    });

    document.querySelectorAll('.lazy').forEach(lazyElement => {
        lazyLoadObserver.observe(lazyElement);
    });
}

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

function initAll() {
    initMobileMenu();
    initScrollTop();
    initWhatsAppWidget();
    initSmoothScrolling();
    initCompaniesCarousel();
    initLazyLoading();
}






document.addEventListener('DOMContentLoaded', function() {
    // Elementos do menu
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.dt-mobile-header');
    const closeMenuBtn = document.querySelector('.dt-close-mobile-menu-icon');
    
    // Verifica se os elementos existem antes de adicionar event listeners
    if (mobileMenuToggle && mobileMenu) {
        // Abrir menu ao clicar no hamburguer
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            document.body.classList.add('no-scroll');
        });
    }

    if (closeMenuBtn && mobileMenu) {
        // Fechar menu ao clicar no botão de fechar
        closeMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }

    // Fechar menu ao clicar em um link (opcional)
    const mobileLinks = document.querySelectorAll('.mobile-main-nav a');
    if (mobileLinks.length > 0) {
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (mobileMenu) {
                    mobileMenu.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                }
            });
        });
    }
});