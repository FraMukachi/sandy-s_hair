const SandyHair = {};

SandyHair.products = [
    { id: 'jet_black_bob', name: '10" Jet Black Bob', price: 450, oldPrice: null, description: 'High-volume, pre-plucked natural black bob with a slight wave.', specs: ['10 Inches', 'Swiss Lace', '150% Density'], colors: ['black', 'brown'], image: 'images/jet_black_bob.jpg', promo: 'Buy Any 3 Of Your Choice For R1500' },
    { id: 'mocha_hairess', name: '16" Mocha Hairess', price: 800, oldPrice: null, description: 'Our viral #1 unit. Wispy bangs and long layers of hair.', specs: ['16 Inches', 'Transparent Lace'], colors: [], image: 'images/mocha_hairess.jpg', promo: '243.8K Likes' },
    { id: 'wavy_layered_burgundy', name: '20" Wavy Layered Burgundy', price: 800, oldPrice: 950, description: 'Wavy Layered Burgundy with a hint of red.', specs: ['HD Lace', '150% Density'], colors: [], image: 'images/wavy_layered_burgundy.jpg', promo: null },
    { id: 'jet_black', name: '24" Jet Black Straight Unit', price: 900, oldPrice: 950, description: 'Sleek jet black straight unit.', specs: ['HD Lace', '150% Density'], colors: [], image: 'images/jet_black.jpg', promo: null },
    { id: 'wavy', name: '26" Wavy Layered Unit', price: 900, oldPrice: 950, description: 'Long wavy layered unit with beautiful movement.', specs: ['26 Inches', 'HD Lace', '150% Density'], colors: [], image: 'images/wavy.jpg', promo: null },
    { id: 'fringe', name: '16" Fringe Layered Bob', price: 700, oldPrice: 950, description: 'Fringe layered bob, perfect face-framing style.', specs: ['HD Lace', '150% Density'], colors: [], image: 'images/fringe.jpg', promo: null },
    { id: 'velvet', name: '22" Velvet Riot', price: 850, oldPrice: 950, description: 'Velvet textured layered unit.', specs: ['22 Inches', 'HD Lace', '150% Density'], colors: [], image: 'images/velvet.jpg', promo: null },
    { id: 'wavy_layered_unit', name: '12" Wavy Layered Unit', price: 650, oldPrice: 750, description: 'Wavy layered unit, perfect shorter length.', specs: ['12 Inches', '150% Density'], colors: [], image: 'images/wavy_layered_unit.jpg', promo: null },
    { id: 'cocoa_empress', name: '26" Cocoa Empress', price: 800, oldPrice: 950, description: 'Beautiful cocoa brown empress unit.', specs: ['26 Inches', '150% Density'], colors: [], image: 'images/cocoa_empress.jpg', promo: null },
    { id: 'solange_bob', name: '8" Solange Bob', price: 500, oldPrice: 550, description: 'Cute short Solange bob.', specs: ['8 Inches', '150% Density'], colors: [], image: 'images/solange_bob.jpg', promo: null },
    { id: 'water_wave', name: '24" Water Wave Unit', price: 950, oldPrice: 1050, description: 'Gorgeous water wave texture.', specs: ['24 Inches', '150% Density'], colors: [], image: 'images/water_wave.jpg', promo: null },
    { id: 'ash_blonde', name: '26" Ash Blonde', price: 900, oldPrice: 950, description: 'Trendy ash blonde unit.', specs: ['HD Lace', '150% Density'], colors: [], image: 'images/ash_blonde.jpg', promo: null },
    { id: 'copper', name: '12" Copper Unit', price: 650, oldPrice: 750, description: 'Warm copper toned unit.', specs: ['HD Lace', '150% Density'], colors: [], image: 'images/copper.jpg', promo: null },
    { id: 'blonde', name: '12" Blonde Unit', price: 650, oldPrice: 750, description: 'Classic blonde unit.', specs: ['HD Lace', '150% Density'], colors: [], image: 'images/blonde.jpg', promo: null },
    { id: 'copper_blonde', name: '12" Copper Blonde', price: 650, oldPrice: null, description: 'Sleek, elegant layered unit.', specs: ['12 Inches', 'Swiss Lace', 'Pre-plucked'], colors: ['blonde', 'brown'], image: 'images/copper_blonde.jpg', promo: null }
];

SandyHair.cart = [];

SandyHair.loadCart = function() {
    var saved = localStorage.getItem('sandyHairCart');
    if (saved) { try { SandyHair.cart = JSON.parse(saved); } catch (e) { SandyHair.cart = []; } }
    SandyHair.updateCartUI();
};

SandyHair.saveCart = function() {
    localStorage.setItem('sandyHairCart', JSON.stringify(SandyHair.cart));
    SandyHair.updateCartUI();
};

SandyHair.addToCart = function(productId) {
    var product = SandyHair.products.find(function(p) { return p.id === productId; });
    if (!product) return;
    
    var existing = SandyHair.cart.find(function(item) { return item.productId === productId; });
    if (existing) { existing.quantity += 1; }
    else { SandyHair.cart.push({ productId: product.id, productName: product.name, price: product.price, quantity: 1 }); }
    
    SandyHair.saveCart();
    SandyHair.showToast(product.name + ' added to cart!');
    
    var totalItems = SandyHair.cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
    if (totalItems === 2) { SandyHair.showToast('Add 1 more wig to get 3 for R1500!'); }
};

SandyHair.updateCartUI = function() {
    var countEl = document.getElementById('cartCount');
    if (countEl) {
        var total = SandyHair.cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
        countEl.textContent = total;
        countEl.style.display = total > 0 ? 'flex' : 'none';
    }
};

SandyHair.openZoom = function(imageSrc) {
    document.getElementById('zoomedImg').src = imageSrc;
    document.getElementById('zoomModal').classList.add('active');
    document.body.style.overflow = 'hidden';
};

SandyHair.closeZoom = function() {
    document.getElementById('zoomModal').classList.remove('active');
    document.body.style.overflow = '';
};

SandyHair.showToast = function(message) {
    var toast = document.getElementById('toast');
    var msg = document.getElementById('toastMessage');
    if (!toast || !msg) return;
    msg.textContent = message;
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 3000);
};

SandyHair.renderProducts = function() {
    var grid = document.getElementById('productGrid');
    if (!grid) return;
    
    var html = '';
    
    // Promo banner at the very top with no gap
    html += '<div class="promo-banner" style="margin-bottom:20px;">';
    html += '<img src="images/promo-banner.jpg" alt="Buy Any 3 Wigs for R1500" style="width:100%;border-radius:15px;" onerror="this.style.display=\'none\'">';
    html += '<h3>SPECIAL OFFER: Buy Any 3 Wigs for R1500!</h3>';
    html += '<p>Mix and match from our collection. Discount applied automatically at checkout.</p>';
    html += '</div>';
    
    SandyHair.products.forEach(function(product) {
        var deliveryFrom = 60.00;
        var totalFrom = product.price + deliveryFrom;
        var colorHTML = '';
        if (product.colors && product.colors.length) {
            colorHTML = '<div class="color-options"><span class="color-label">Available in:</span>';
            product.colors.forEach(function(c) { colorHTML += '<div class="color-circle ' + c + '"></div>'; });
            colorHTML += '</div>';
        }
        var oldPriceHTML = product.oldPrice ? '<span class="old-price">R' + product.oldPrice + '</span>' : '';
        var promoHTML = product.promo ? '<span class="promo-tag">' + product.promo + '</span>' : '';
        
        html += '<article class="product-card">';
        html += '<div class="product-img" onclick="SandyHair.openZoom(\'' + product.image + '\')">' + promoHTML + '<img src="' + product.image + '" alt="' + product.name + '" loading="lazy" onerror="this.src=\'images/fallback.jpg\'"></div>';
        html += '<div class="product-details"><h3>' + product.name + '</h3><div class="price">R' + product.price + ' ' + oldPriceHTML + '</div><p class="product-description">' + product.description + '</p><div class="specs">';
        product.specs.forEach(function(s) { html += '<span class="spec">' + s + '</span>'; });
        html += '</div>' + colorHTML;
        html += '<div class="product-total"><p>Product: R' + product.price + ' + Delivery: from R' + deliveryFrom.toFixed(2) + '</p><p class="total-price">Total from: R' + totalFrom.toFixed(2) + '</p></div>';
        html += '<button class="add-to-cart-btn" onclick="SandyHair.addToCart(\'' + product.id + '\')">Add to Cart</button>';
        html += '</div></article>';
    });
    
    grid.innerHTML = html;
};

SandyHair.init = function() {
    SandyHair.loadCart();
    SandyHair.renderProducts();
};

window.onload = SandyHair.init;
