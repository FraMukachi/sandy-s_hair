/* ============================================
   Sandy Hair - Checkout JavaScript
   ============================================ */

// ===== Checkout Namespace =====
const Checkout = {};

// ===== State =====
Checkout.state = {
    currentStep: 'customer',
    delivery: 'paxi',
    selectedBank: 'capitec',
    cart: [],
    deliveryFee: 59.95,
    subtotal: 0,
    total: 0,
    orderData: null
};

// ===== Load Cart =====
Checkout.loadCart = function() {
    const savedCart = localStorage.getItem('sandyHairCart');
    if (savedCart) {
        try {
            Checkout.state.cart = JSON.parse(savedCart);
        } catch (e) {
            Checkout.state.cart = [];
        }
    }
    
    if (Checkout.state.cart.length === 0) {
        Checkout.state.cart = [
            { productId: 'jet_black_bob', productName: '10" Jet Black Bob', price: 450, quantity: 1 }
        ];
    }
    
    Checkout.updateOrderSummary();
};

// ===== Update Order Summary =====
Checkout.updateOrderSummary = function() {
    const orderItems = document.getElementById('orderItems');
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
                <button class="remove-item" onclick="Checkout.removeItem(${index})">×</button>
            </div>
        `;
    });
    
    Checkout.state.subtotal = subtotal;
    
    if (Checkout.state.delivery === 'paxi') {
        if (subtotal >= 650) {
            Checkout.state.deliveryFee = 0;
            html += `
                <div class="order-item delivery-row">
                    <span>🚚 Paxi Delivery</span>
                    <span class="order-item-price">FREE</span>
                </div>
            `;
        } else {
            const itemCount = Checkout.state.cart.reduce((sum, item) => sum + item.quantity, 0);
            if (itemCount <= 2) {
                Checkout.state.deliveryFee = 59.95;
            } else if (itemCount <= 4) {
                Checkout.state.deliveryFee = 79.95;
            } else {
                Checkout.state.deliveryFee = 109.95;
            }
            html += `
                <div class="order-item">
                    <span>🚚 Paxi Delivery</span>
                    <span class="order-item-price">R${Checkout.state.deliveryFee.toFixed(2)}</span>
                </div>
            `;
        }
    } else {
        Checkout.state.deliveryFee = 0;
        html += `
            <div class="order-item delivery-row">
                <span>📍 Collection</span>
                <span class="order-item-price">FREE</span>
            </div>
        `;
    }
    
    Checkout.state.total = subtotal + Checkout.state.deliveryFee;
    
    orderItems.innerHTML = html;
    document.getElementById('grandTotal').textContent = `R${Checkout.state.total.toFixed(2)}`;
};

// ===== Remove Item =====
Checkout.removeItem = function(index) {
    Checkout.state.cart.splice(index, 1);
    localStorage.setItem('sandyHairCart', JSON.stringify(Checkout.state.cart));
    Checkout.updateOrderSummary();
};

// ===== Step Navigation =====
Checkout.nextStep = function(step) {
    // Validate current step
    if (Checkout.state.currentStep === 'customer') {
        const name = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        if (!name) { alert('Please enter your full name'); return; }
        if (!email) { alert('Please enter your email'); return; }
        if (!phone) { alert('Please enter your phone number'); return; }
    }
    
    if (step === 'delivery' && Checkout.state.currentStep === 'customer') {
        document.getElementById('customerSection').style.display = 'none';
        document.getElementById('deliverySection').style.display = 'block';
        document.getElementById('paymentSection').style.display = 'none';
        Checkout.state.currentStep = 'delivery';
        Checkout.updateStepIndicator(2);
    }
    
    if (step === 'payment' && Checkout.state.currentStep === 'delivery') {
        if (Checkout.state.delivery === 'paxi') {
            const paxiCode = document.getElementById('paxiCode').value.trim();
            const paxiPoint = document.getElementById('paxiPoint').value.trim();
            if (!paxiCode) { alert('Please enter your Paxi code'); return; }
            if (!paxiPoint) { alert('Please enter your Paxi point name'); return; }
        }
        document.getElementById('customerSection').style.display = 'none';
        document.getElementById('deliverySection').style.display = 'none';
        document.getElementById('paymentSection').style.display = 'block';
        Checkout.state.currentStep = 'payment';
        Checkout.updateStepIndicator(3);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

Checkout.prevStep = function(step) {
    if (step === 'customer') {
        document.getElementById('customerSection').style.display = 'block';
        document.getElementById('deliverySection').style.display = 'none';
        document.getElementById('paymentSection').style.display = 'none';
        Checkout.state.currentStep = 'customer';
        Checkout.updateStepIndicator(1);
    }
    
    if (step === 'delivery') {
        document.getElementById('customerSection').style.display = 'none';
        document.getElementById('deliverySection').style.display = 'block';
        document.getElementById('paymentSection').style.display = 'none';
        Checkout.state.currentStep = 'delivery';
        Checkout.updateStepIndicator(2);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ===== Update Step Indicator =====
Checkout.updateStepIndicator = function(activeStep) {
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById(`step${i}Indicator`);
        if (indicator) {
            indicator.classList.remove('active', 'completed');
            if (i < activeStep) {
                indicator.classList.add('completed');
            } else if (i === activeStep) {
                indicator.classList.add('active');
            }
        }
    }
};

// ===== Delivery Selection =====
Checkout.selectDelivery = function(method) {
    Checkout.state.delivery = method;
    
    document.getElementById('paxiOption').classList.remove('selected');
    document.getElementById('collectionOption').classList.remove('selected');
    
    if (method === 'paxi') {
        document.getElementById('paxiOption').classList.add('selected');
        document.getElementById('paxiFields').style.display = 'block';
        document.querySelector('#paxiOption input').checked = true;
    } else {
        document.getElementById('collectionOption').classList.add('selected');
        document.getElementById('paxiFields').style.display = 'none';
        document.querySelector('#collectionOption input').checked = true;
    }
    
    Checkout.updateOrderSummary();
};

// ===== Bank Selection =====
Checkout.selectBank = function(bank, element) {
    Checkout.state.selectedBank = bank;
    
    document.querySelectorAll('.bank-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    element.classList.add('selected');
};

// ===== Process Payment =====
Checkout.processPayment = function() {
    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const paxiCode = document.getElementById('paxiCode')?.value.trim() || '';
    const paxiPoint = document.getElementById('paxiPoint')?.value.trim() || '';
    
    // Build order data
    Checkout.state.orderData = {
        customer: { name, email, phone },
        delivery: {
            method: Checkout.state.delivery,
            paxiCode,
            paxiPoint
        },
        cart: Checkout.state.cart,
        payment: {
            method: 'instant_eft',
            bank: Checkout.state.selectedBank,
            amount: Checkout.state.total
        },
        reference: name.replace(/\s+/g, '_') + '_' + Date.now()
    };
    
    // Save to localStorage
    localStorage.setItem('sandyHairOrderData', JSON.stringify(Checkout.state.orderData));
    
    // Disable button
    const payBtn = document.getElementById('payButton');
    payBtn.disabled = true;
    payBtn.textContent = '⏳ Processing...';
    
    // Simulate payment processing
    setTimeout(() => {
        // Show success
        document.getElementById('successMessage').classList.add('show');
        payBtn.style.display = 'none';
        
        // Generate WhatsApp link
        const message = encodeURIComponent(
            `🛍️ *New Order - Sandy Hair*\n\n` +
            `👤 *Customer:* ${name}\n` +
            `📧 *Email:* ${email}\n` +
            `📱 *Phone:* ${phone}\n\n` +
            `📦 *Delivery:* ${Checkout.state.delivery === 'paxi' ? 'Paxi' : 'Collection'}\n` +
            `${Checkout.state.delivery === 'paxi' ? `📍 Paxi Code: ${paxiCode}\n📍 Point: ${paxiPoint}\n` : ''}` +
            `💰 *Amount:* R${Checkout.state.total.toFixed(2)}\n` +
            `🏦 *Bank:* ${Checkout.state.selectedBank.toUpperCase()}\n` +
            `🔢 *Reference:* ${Checkout.state.orderData.reference}\n\n` +
            `_Payment proof attached below_`
        );
        
        document.getElementById('whatsappLink').href = `https://wa.me/27798104481?text=${message}`;
        
        // Clear cart
        localStorage.removeItem('sandyHairCart');
        
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 2000);
};

// ===== Initialize =====
Checkout.init = function() {
    Checkout.loadCart();
    
    // Set initial step
    document.getElementById('customerSection').style.display = 'block';
    document.getElementById('deliverySection').style.display = 'none';
    document.getElementById('paymentSection').style.display = 'none';
    Checkout.updateStepIndicator(1);
    
    console.log('✅ Checkout initialized');
    console.log('🛒 Cart items:', Checkout.state.cart.length);
};

// ===== Run on DOM Load =====
document.addEventListener('DOMContentLoaded', Checkout.init);

// ===== Export =====
window.Checkout = Checkout;
