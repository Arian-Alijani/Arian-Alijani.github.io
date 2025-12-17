document.addEventListener('DOMContentLoaded', () => {

// --- Navbar Blur Effect on Scroll ---
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('shadow-sm');
            navbar.classList.replace('bg-[#FEF7FF]/80', 'bg-[#FEF7FF]/95');
        } else {
            navbar.classList.remove('shadow-sm');
            navbar.classList.replace('bg-[#FEF7FF]/95', 'bg-[#FEF7FF]/80');
        }
    });
}

// --- Add to Cart Interaction (Toast) ---
const toast = document.getElementById('toast');
let toastTimeout;

// Delegate listener to document for dynamically added buttons
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn && btn.querySelector('.material-icon') && btn.querySelector('.material-icon').textContent === 'add') {
        e.stopPropagation();
        
        // Show Toast
        if (toast) {
            toast.classList.remove('translate-y-20', 'opacity-0');
            
            if (toastTimeout) clearTimeout(toastTimeout);
            
            toastTimeout = setTimeout(() => {
                toast.classList.add('translate-y-20', 'opacity-0');
            }, 3000);
        }
    }
});

// --- Ripple Effect Implementation ---
document.addEventListener('click', function (e) {
    const target = e.target.closest('.ripple');
    if (target) {
        const circle = document.createElement('span');
        const diameter = Math.max(target.clientWidth, target.clientHeight);
        const radius = diameter / 2;

        const rect = target.getBoundingClientRect();
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('ripple-effect');

        // Do not remove existing ripples immediately to allow multi-click smoothness
        target.appendChild(circle);
        
        setTimeout(() => {
            circle.remove();
        }, 600);
    }
});

// --- Entrance Animations (Intersection Observer) ---
const sections = document.querySelectorAll('section');
if (sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.classList.add('transition-all', 'duration-1000', 'opacity-0', 'translate-y-10');
        observer.observe(section);
    });
}

// --- Mobile Menu Logic ---
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
const openMenuBtn = document.getElementById('open-menu-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');

function toggleMenu() {
    if (!mobileMenu || !mobileMenuOverlay) return;
    
    const isHidden = mobileMenu.classList.contains('translate-x-full');
    if (isHidden) {
        // Open
        mobileMenu.classList.remove('translate-x-full');
        mobileMenuOverlay.classList.remove('hidden');
        setTimeout(() => mobileMenuOverlay.classList.remove('opacity-0'), 10);
        document.body.style.overflow = 'hidden';
    } else {
        // Close
        mobileMenu.classList.add('translate-x-full');
        mobileMenuOverlay.classList.add('opacity-0');
        setTimeout(() => mobileMenuOverlay.classList.add('hidden'), 300);
        document.body.style.overflow = '';
    }
}

if(openMenuBtn) openMenuBtn.addEventListener('click', toggleMenu);
if(closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
if(mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', toggleMenu);

// --- Banner Slider Logic ---
const bannerWrapper = document.getElementById('banner-wrapper');
const bannerSlides = document.querySelectorAll('.banner-slide');
const bannerDots = document.querySelectorAll('.banner-dot');
let bannerIndex = 0;
let bannerInterval;

function updateBanner(index) {
    if (!bannerWrapper) return;
    
    // Normalize index
    if (index >= bannerSlides.length) bannerIndex = 0;
    else if (index < 0) bannerIndex = bannerSlides.length - 1;
    else bannerIndex = index;

    // Move Slider
    bannerWrapper.style.transform = `translateX(-${bannerIndex * 100}%)`;

    // Update Active Slide Class (for CSS effects like zoom)
    bannerSlides.forEach((slide, i) => {
        if (i === bannerIndex) slide.classList.add('active');
        else slide.classList.remove('active');
    });

    // Update Dots
    bannerDots.forEach((dot, i) => {
        if (i === bannerIndex) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

function startBannerTimer() {
    if (bannerInterval) clearInterval(bannerInterval);
    bannerInterval = setInterval(() => {
        updateBanner(bannerIndex + 1);
    }, 10000);
}

if (bannerWrapper && bannerSlides.length > 0) {
    // Initial Start
    startBannerTimer();

    // Click events for dots
    bannerDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(bannerInterval);
            updateBanner(index);
            startBannerTimer(); // Restart timer
        });
    });
}
});