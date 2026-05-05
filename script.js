/* ============================================
   Sandy Hair - Main JavaScript
   ============================================ */

const SandyHair = {};

// Product Database
SandyHair.products = [
    {
        id: 'jet_black_bob',
        name: '10" Jet Black Bob',
        price: 450,
        oldPrice: null,
        description: 'High-volume, pre-plucked natural hairline.',
        specs: ['10 Inches', 'Swiss Lace', '150% Density'],
        colors: ['black', 'brown'],
        image: 'images/jet_black_bob.jpg',
        promo: '🔥 Buy Any 3 Of Your Choice For R1300'
    },
    {
        id: 'mocha_hairess',
        name: '16" Mocha Hairess',
        price: 800,
        oldPrice: null,
        description: 'Our viral #1 unit. Wispy bangs, zero styling needed.',
        specs: ['16 Inches', 'Transparent Lace', '130% Density'],
        colors: [],
        image: 'images/mocha_hairess.jpg',
        promo: '⭐ 243.8K Likes'
    },
    {
        id: 'wavy_layered_burgundy',
        name: '20" Wavy Layered Burgundy',
        price: 800,
        oldPrice: 950,
        description: 'Wavy Layered Burgundy with HD lace.',
        specs: ['HD Lace', '150% Density'],
        colors: [],
        image: 'images/wavy_layered_burgundy.jpg',
        promo: null
    },
    {
        id: 'jet_black',
        name: '24" Jet Black Straight Unit',
        price: 900,
        oldPrice: 950,
        description: 'Sleek jet black straight unit.',
        specs: ['HD Lace', '150% Density'],
        colors: [],
        image: 'images/jet_black.jpg',
        promo: null
    },
    {
        id: 'wavy',
        name: '26" Wavy Layered Unit',
        price: 900,
        oldPrice: 950,
        description: 'Long wavy layered unit with beautiful movement.',
        specs: ['26 Inches', 'HD Lace', '150% Density'],
        colors: [],
        image: 'images/wavy.jpg',
        promo: null
    },
    {
        id: 'fringe',
        name: '16" Fringe Layered Bob',
        price: 700,
        oldPrice: 950,
        description: 'Fringe layered bob, perfect face-framing style.',
        specs: ['HD Lace', '150% Density'],
        colors: [],
        image: 'images/fringe.jpg',
        promo: null
    },
    {
        id: 'velvet',
        name: '22" Velvet Riot',
        price: 850,
        oldPrice: 950,
        description: 'Velvet textured layered unit.',
        specs: ['26 Inches', 'HD Lace', '150% Density'],
        colors: [],
        image: 'images/velvet.jpg',
        promo: null
    },
    {
        id: 'wavy_layered_unit',
        name: '12" Wavy Layered Unit',
        price: 650,
        oldPrice: 750,
        description: 'Wavy layered unit, perfect shorter length.',
        specs: ['12 Inches', '150% Density'],
        colors: [],
        image: 'images/wavy_layered_unit.jpg',
        promo: null
    },
    {
        id: 'cocoa_empress',
        name: '26" Cocoa Empress',
        price: 800,
        oldPrice: 950,
        description: 'Beautiful cocoa brown empress unit.',
        specs: ['26 Inches', '150% Density'],
        colors: [],
        image: 'images/cocoa_empress.jpg',
        promo: null
    },
    {
        id: 'solange_bob',
        name: '8" Solange Bob',
        price: 500,
        oldPrice: 550,
        description: 'Cute short Solange bob.',
        specs: ['8 Inches', '150% Density'],
        colors: [],
        image: 'images/solange_bob.jpg',
        promo: null
    },
    {
        id: ' water_wave',
        name: '24" Water Wave Unit',
        price: 950,
        oldPrice: 1050,
        description: 'Gorgeous water wave texture.',
        specs: ['8 Inches', '150% Density'],
        colors: [],
        image: 'images/water_wave.jpg',
        promo: null
    },
    {
        id: 'ash_blonde',
        name: '26" Ash Blonde',
        price: 900,
        oldPrice: 950,
        description: 'Trendy ash blonde unit.',
        specs: ['HD Lace', '150% Density'],
        colors: [],
        image: 'images/ash_blonde.jpg',
        promo: null
    },
    {
        id: 'copper',
        name: '12" Copper Unit',
        price: 650,
        oldPrice: 750,
        description: 'Warm copper toned unit.',
        specs: ['HD Lace', '150% Density'],
        colors: [],
        image: 'images/copper.jpg',
        promo: null
    },
    {
        id: 'blonde',
        name: '12" Blonde Unit',
        price: 650,
        oldPrice: 750,
        description: 'Classic blonde unit.',
        specs: ['HD Lace', '150% Density'],
        colors: [],
        image: 'images/blonde.jpg',
        promo: null
    },
    {
        id: 'copper_blonde',
        name: '12" Copper Blonde',
        price: 650,
        oldPrice: null,
        description: 'Sleek, elegant layered unit.',
        specs: ['12 Inches', 'Swiss Lace', 'Pre-plucked'],
        colors: ['blonde', 'brown'],
        image: 'images/copper_blonde.jpg',
        promo: null
    }
];

// Cart
SandyHair.cart = [];

SandyHair.loadCart = function() {
    const saved = localStorage.getItem('sandyHairCart');
    if (saved) {
        try { SandyHair.cart = JSON.parse(saved); } catch (e) { SandyHair.cart = []; }
    }
    SandyHair.updateCartUI();
};

SandyHair.saveCart = function() {
    localStorage.setItem('sandyHairCart', JSON.stringify(SandyHair.cart));
    SandyHair.updateCartUI();
};

SandyHair.addToCart = function(productId) {
    const product = SandyHair.products.find(p => p.id === productId);
    if (!product) return;
    
    const existing = SandyHair.cart.find(item => item.productId === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        SandyHair.cart.push({
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    SandyHair.saveCart();
    SandyHair.showToast(`${product.name} added to cart! 🛒`);
    
    // Animate cart button
    const cartFloat = document.getElementById('cartFloat');
    if (cartFloat) {
        cartFloat.style.transform = 'scale(1.2)';
        setTimeout(() => { cartFloat.style.transform = 'scale(1)'; }, 200);
    }
};

SandyHair.updateCartUI = function() {
    const countEl = document.getElementById('cartCount');
    if (countEl) {
        const total = SandyHair.cart.reduce((sum, item) => sum + item.quantity, 0);
        countEl.textContent = total;
        countEl.style.display = total > 0 ? 'flex' : 'none';
    }
};

// Zoom Modal
SandyHair.openZoom = function(imageSrc) {
    const modal = document.getElementById('zoomModal');
    const img = document.getElementById('zoomedImg');
    if (!modal || !img) return;
    img.src = imageSrc;
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

// Toast
SandyHair.showToast = function(message) {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toastMessage');
    if (!toast || !msg) return;
    msg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
};

// Render Products
SandyHair.renderProducts = function() {
    const grid = document.getElementById('productGrid');
    if (!grid) {
        console.error('Product grid element not found');
        return;
    }
    
    let html = '';
    
    SandyHair.products.forEach(product => {
        const deliveryFrom = 59.95;
        const totalFrom = product.price + deliveryFrom;
        
        // Color options HTML
        let colorHTML = '';
        if (product.colors && product.colors.length > 0) {
            colorHTML = `
                <div class="color-options">
                    <span class="color-label">Available in:</span>
                    ${product.colors.map(c => `<div class="color-circle ${c}" title="${c}"></div>`).join('')}
                </div>
            `;
        }
        
        // Old price HTML
        let oldPriceHTML = '';
        if (product.oldPrice) {
            oldPriceHTML = `<span class="old-price">R${product.oldPrice}</span>`;
        }
        
        // Promo tag HTML
        let promoHTML = '';
        if (product.promo) {
            promoHTML = `<span class="promo-tag">${product.promo}</span>`;
        }
        
        html += `
            <article class="product-card">
                <div class="product-img" onclick="SandyHair.openZoom('${product.image}')">
                    ${promoHTML}
                    <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='images/fallback.jpg'">
                </div>
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <div class="price">R${product.price} ${oldPriceHTML}</div>
                    <p class="product-description">${product.description}</p>
                    <div class="specs">
                        ${product.specs.map(s => `<span class="spec">${s}</span>`).join('')}
                    </div>
                    ${colorHTML}
                    <div class="product-total">
                        <p>Product: R${product.price} + Delivery: from R${deliveryFrom.toFixed(2)}</p>
                        <p class="total-price">Total from: R${totalFrom.toFixed(2)}</p>
                    </div>
                    <button class="add-to-cart-btn" onclick="SandyHair.addToCart('${product.id}')">
                        🛒 Add to Cart
                    </button>
                </div>
            </article>
        `;
    });
    
    grid.innerHTML = html;
    console.log(`✅ Rendered ${SandyHair.products.length} products`);
};

// Smooth Scroll
SandyHair.initSmoothScroll = function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
};

// Keyboard
SandyHair.initKeyboard = function() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('zoomModal');
            if (modal && modal.classList.contains('active')) {
                SandyHair.closeZoom();
            }
        }
    });
};

// Init
SandyHair.init = function() {
    console.log('🚀 Initializing Sandy Hair...');
    SandyHair.loadCart();
    SandyHair.renderProducts();
    SandyHair.initSmoothScroll();
    SandyHair.initKeyboard();
    console.log('✅ Sandy Hair ready');
};

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', SandyHair.init);

// Export to window
window.SandyHair = SandyHair;
