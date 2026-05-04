/* ============================================
   Sandy Hair - Main JavaScript
   ============================================ */

// ===== Namespace =====
const SandyHair = {};

// ===== Product Database =====
SandyHair.products = {
    'jet_black_bob': { name: '10" Jet Black Bob', price: 450 },
    'mocha_hairess': { name: '16" Mocha Hairess', price: 800 },
    'wavy_layered_burgundy': { name: 'Wavy Layered Burgundy', price: 800 },
    'jet_black': { name: 'Jet Black Straight Unit', price: 900 },
    'wavy': { name: '26" Wavy Layered Unit', price: 900 },
    'fringe': { name: 'Fringe Layered Bob', price: 700 },
    'velvet': { name: 'Velvet Layered Unit', price: 850 },
    'wavy_layered_unit': { name: '12" Wavy Layered Unit', price: 650 },
    'cocoa_empress': { name: '26" Cocoa Empress', price: 800 },
    'solange_bob': { name: '8" Solange Bob', price: 500 },
    'water_wave': { name: 'Water Wave Unit', price: 950 },
    'ash_blonde': { name: 'Ash Blonde', price: 900 },
    'copper': { name: 'Copper Unit', price: 650 },
    'blonde': { name: 'Blonde Unit', price: 650 },
    'copper_blonde': { name: '12" Copper Blonde', price: 650 }
};

// ===== Cart Management =====
SandyHair.cart = [];

SandyHair.loadCart = function() {
    const savedCart = localStorage.getItem('sandyHairCart');
    if (savedCart) {
        try {
            SandyHair.cart = JSON.parse(savedCart);
        } catch (e) {
            SandyHair.cart = [];
        }
    }
    SandyHair.updateCartUI();
};

SandyHair.saveCart = function() {
    localStorage.setItem('sandyHairCart', JSON.stringify(SandyHair.cart));
    SandyHair.updateCartUI();
};

SandyHair.addToCart = function(productId, productName, price) {
    const existingItem = SandyHair.cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        SandyHair.cart.push({
            productId: productId,
            productName: productName,
            price: price,
            quantity: 1
        });
    }
    
    SandyHair.saveCart();
    SandyHair.showToast(`${productName} added to cart! 🛒`);
};

SandyHair.removeFromCart = function(productId) {
    SandyHair.cart = SandyHair.cart.filter(item => item.productId !== productId);
    SandyHair.saveCart();
};

SandyHair.updateCartUI = function() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = SandyHair.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        if (totalItems > 0) {
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }
    }
};

SandyHair.clearCart = function() {
    SandyHair.cart = [];
    SandyHair.saveCart();
};

// ===== Zoom Modal =====
SandyHair.openZoom = function(imageSrc) {
    const modal = document.getElementById('zoomModal');
    const img = document.getElementById('zoomedImg');
    
    if (!modal || !img) return;
    
    img.src = imageSrc;
    img.alt = 'Zoomed product view';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

SandyHair.closeZoom = function() {
    const modal = document.getElementById('zoomModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    setTimeout(() => {
        const img = document.getElementById('zoomedImg');
        if (img) img.src = '';
    }, 300);
};

// ===== Toast Notification =====
SandyHair.showToast = function(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};

// ===== Image Handling =====
SandyHair.initImages = function() {
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
};

// ===== Color Selection =====
SandyHair.initColorSelection = function() {
    const colorCircles = document.querySelectorAll('.color-circle');
    
    colorCircles.forEach(circle => {
        circle.addEventListener('click', function(event) {
            event.stopPropagation();
            
            const parentOptions = this.closest('.color-options');
            if (parentOptions) {
                parentOptions.querySelectorAll('.color-circle').forEach(c => {
                    c.style.boxShadow = '0 0 0 2px #e91e63';
                    c.style.transform = 'scale(1)';
                });
            }
            
            this.style.boxShadow = '0 0 0 3px #e91e63, 0 0 10px rgba(233, 30, 99, 0.5)';
            this.style.transform = 'scale(1.2)';
        });
    });
};

// ===== Smooth Scroll =====
SandyHair.initSmoothScroll = function() {
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
};

// ===== Keyboard Accessibility =====
SandyHair.initKeyboard = function() {
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('zoomModal');
            if (modal && modal.classList.contains('active')) {
                SandyHair.closeZoom();
            }
        }
    });
};

// ===== Initialize Everything =====
SandyHair.init = function() {
    SandyHair.loadCart();
    SandyHair.initImages();
    SandyHair.initColorSelection();
    SandyHair.initSmoothScroll();
    SandyHair.initKeyboard();
    
    // Hide cart count if empty
    const cartCount = document.getElementById('cartCount');
    if (cartCount && SandyHair.cart.length === 0) {
        cartCount.style.display = 'none';
    }
    
    console.log('✅ Sandy Hair website initialized');
    console.log('🛒 Cart items:', SandyHair.cart.length);
};

// ===== Run on DOM Load =====
document.addEventListener('DOMContentLoaded', SandyHair.init);

// ===== Export to Global Scope =====
window.SandyHair = SandyHair;
