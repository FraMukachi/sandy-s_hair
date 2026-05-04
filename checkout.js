/* ============================================
   Sandy Hair - Checkout JavaScript
   ============================================ */

const Checkout = {};

Checkout.state = {
    currentStep: 1,
    delivery: 'paxi',
    selectedBank: 'capitec',
    cart: [],
    deliveryFee: 59.95,
    subtotal: 0,
    total: 0
};

// Load cart
Checkout.loadCart = function() {
    const saved = localStorage.getItem('sandyHairCart');
    if (saved) {
        try { Checkout.state.cart = JSON.parse(saved); } catch (e) { Checkout.state.cart = []; }
    }
    
    if (Checkout.state.cart.length === 0) {
        // Show empty message
        document.getElementById('orderItems').innerHTML = '<p class="empty-cart">Your cart is empty. <a href="index.html">Go shop!</a></p>';
        document.getElementById('grandTotal').textContent = 'R0.00';
        document.getElementById('payBtn').disabled = true;
        return;
    }
    
    Checkout.updateSummary();
};

// Update order summary
Checkout.updateSummary = function() {
    const container = document.getElementById('orderItems');
    let subtotal = 0;
    let html = '';
    
    Checkout.state.cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        html += `
            <div class="order-item">
                <span class="order-item-name">${item.productName}</span>
                <span class="order-item-qty">x${item.quantity}</span>
                <span class="order-item-price">R${itemTotal.toFixed(2)}</span>
                <button class="remove-btn" onclick="Checkout.removeItem(${index})">×</button>
            </div>
        `;
    });
    
    Checkout.state.subtotal = subtotal;
    
    // Calculate delivery
    if (Checkout.state.delivery === 'paxi') {
        if (subtotal >= 650) {
            Checkout.state.deliveryFee = 0;
            html += '<div class="order-item"><span>🚚 Paxi Delivery</span><span class="order-item-price" style="color:#4caf50;">FREE</span></div>';
        } else {
            const itemCount = Checkout.state.cart.reduce((s, i) => s + i.quantity, 0);
            if (itemCount <= 2) Checkout.state.deliveryFee = 59.95;
            else if (itemCount <= 4) Checkout.state.deliveryFee = 79.95;
            else Checkout.state.deliveryFee = 109.95;
            html += `<div class="order-item"><span>🚚 Paxi Delivery</span><span class="order-item-price">R${Checkout.state.deliveryFee.toFixed(2)}</span></div>`;
        }
    } else {
        Checkout.state.deliveryFee = 0;
        html += '<div class="order-item"><span>📍 Collection</span><span class="order-item-price" style="color:#4caf50;">FREE</span></div>';
    }
    
    Checkout.state.total = subtotal + Checkout.state.deliveryFee;
    
    container.innerHTML = html;
    document.getElementById('grandTotal').textContent = `R${Checkout.state.total.toFixed(2)}`;
};

// Remove item
Checkout.removeItem = function(index) {
    Checkout.state.cart.splice(index, 1);
    localStorage.setItem('sandyHairCart', JSON.stringify(Checkout.state.cart));
    Checkout.updateSummary();
    
    if (Checkout.state.cart.length === 0) {
        document.getElementById('payBtn').disabled = true;
        document.getElementById('orderItems').innerHTML = '<p class="empty-cart">Your cart is empty. <a href="index.html">Go shop!</a></p>';
        document.getElementById('grandTotal').textContent = 'R0.00';
    }
};

// Step navigation
Checkout.goToStep = function(step) {
    // Validation
    if (Checkout.state.currentStep === 1 && step > 1) {
        const name = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        if (!name) { alert('Please enter your full name'); return; }
        if (!email) { alert('Please enter your email'); return; }
        if (!phone) { alert('Please enter your phone number'); return; }
    }
    
    if (Checkout.state.currentStep === 2 && step === 3) {
        if (Checkout.state.delivery === 'paxi') {
            const code = document.getElementById('paxiCode').value.trim();
            const point = document.getElementById('paxiPoint').value.trim();
            if (!code) { alert('Please enter your Paxi code'); return; }
            if (!point) { alert('Please enter your Paxi point name'); return; }
        }
    }
    
    // Hide all, show target
    for (let i = 1; i <= 3; i++) {
        document.getElementById('step' + i).style.display = 'none';
    }
    document.getElementById('step' + step).style.display = 'block';
    
    Checkout.state.currentStep = step;
    Checkout.updateStepIndicator();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Update step indicator
Checkout.updateStepIndicator = function() {
    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById('step' + i + 'Ind');
        ind.classList.remove('active', 'completed');
        if (i < Checkout.state.currentStep) ind.classList.add('completed');
        else if (i === Checkout.state.currentStep) ind.classList.add('active');
    }
};

// Delivery selection
Checkout.selectDelivery = function(method) {
    Checkout.state.delivery = method;
    document.getElementById('paxiOpt').classList.toggle('selected', method === 'paxi');
    document.getElementById('collectOpt').classList.toggle('selected', method === 'collection');
    document.getElementById('paxiFields').style.display = method === 'paxi' ? 'block' : 'none';
    
    if (method === 'collection') {
        document.getElementById('paxiCode').required = false;
        document.getElementById('paxiPoint').required = false;
    } else {
        document.getElementById('paxiCode').required = true;
        document.getElementById('paxiPoint').required = true;
    }
    
    Checkout.updateSummary();
};

// Bank selection
Checkout.selectBank = function(bank, el) {
    Checkout.state.selectedBank = bank;
    document.querySelectorAll('.bank-option').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
};

// Process payment
Checkout.processPayment = function() {
    if (Checkout.state.cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    const ref = 'SH-' + Date.now().toString(36).toUpperCase();
    
    // Disable button
    const btn = document.getElementById('payBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Processing...';
    
    setTimeout(() => {
        document.getElementById('successMsg').classList.add('show');
        document.getElementById('orderRef').textContent = ref;
        btn.style.display = 'none';
        
        // Clear cart
        localStorage.removeItem('sandyHairCart');
        Checkout.state.cart = [];
        
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 2000);
};

// Init
Checkout.init = function() {
    Checkout.loadCart();
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    Checkout.updateStepIndicator();
    
    if (Checkout.state.cart.length === 0) {
        document.getElementById('payBtn').disabled = true;
    }
    
    console.log('✅ Checkout ready');
};

document.addEventListener('DOMContentLoaded', Checkout.init);
window.Checkout = Checkout;
