// ===== Image Handling =====
function initImageHandling() {
    const images = document.querySelectorAll('.product-img img');
   
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
       
        if (img.complete) {
            img.style.opacity = '1';
        }
       
        img.addEventListener('error', function() {
            console.warn('Image failed to load:', this.src);
            this.src = 'images/fallback.jpg';
        });
    });
}

// ===== Zoom Modal =====
function openZoom(imageSrc) {
    const modal = document.getElementById('zoomModal');
    const img = document.getElementById('zoomedImg');
   
    if (!modal || !img) return;
   
    img.src = imageSrc;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeZoom() {
    const modal = document.getElementById('zoomModal');
    if (!modal) return;
   
    modal.classList.remove('active');
    document.body.style.overflow = '';
   
    setTimeout(() => {
        const img = document.getElementById('zoomedImg');
        if (img) img.src = '';
    }, 300);
}

// ===== Keyboard Accessibility =====
function initKeyboardAccessibility() {
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('zoomModal');
            if (modal && modal.classList.contains('active')) {
                closeZoom();
            }
        }
    });
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
           
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== Main Init =====
function init() {
    initImageHandling();
    initKeyboardAccessibility();
    initSmoothScroll();
    console.log('✅ Sandy Hair website ready');
}

document.addEventListener('DOMContentLoaded', init);

window.SandyHair = {
    openZoom,
    closeZoom
};