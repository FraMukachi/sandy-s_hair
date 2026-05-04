/* ============================================
   Sandy Hair - Checkout with PayFast Integration
   ============================================ */

const Checkout = {};

// ===== Configuration - REPLACE THESE WITH YOUR REAL PAYFAST DETAILS =====
Checkout.config = {
    // PayFast Merchant Credentials
    merchantId: '14200440',        // REPLACE: Your PayFast Merchant ID
    merchantKey: 'n6nehnkkafqcp',  // REPLACE: Your PayFast Merchant Key
    
    // PayFast URLs
    payfastUrl: 'https://www.payfast.co.za/eng/process',   // Production
    // payfastUrl: 'https://sandbox.payfast.co.za/eng/process', // Testing/Sandbox
    
    // Return URLs - REPLACE with your actual website URLs
    returnUrl: 'https://sandy-s-hair.vercel.app/success.html',
    cancelUrl: 'https://sandy-s-hair.vercel.app/cancel.html',
    notifyUrl: 'https://sandy-s-hair.vercel.app/notify.php'
};

// ===== State =====
Checkout.state = {
    currentStep: 1,
    delivery: 'paxi',
    cart: [],
    deliveryFee: 60.00,
    subtotal: 0,
    total: 0,
    paymentId: ''
};

// ===== Load Cart from localStorage =====
Checkout.loadCart = function() {
    const saved = localStorage.getItem('sandyHairCart');
    if (saved) {
        try { Checkout.state.cart = JSON.parse(saved); } 
        catch (e) { Checkout.state.cart = []; }
    }
    
    if (Checkout.state.cart.length === 0) {
        document.getElementById('orderItems').innerHTML = 
            '<p class="empty-cart">Your cart is empty. <a href="index.html">Continue shopping</a></p>';
        document.getElementById('grandTotal').textContent = 'R0.00';
        document.getElementById('payBtn').disabled = true;
        return;
    }
    
    Checkout.updateSummary();
};

// ===== Update Order Summary =====
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
                <span class="order-item-qty">×${item.quantity}</span>
                <span class="order-item-price">R${itemTotal.toFixed(2)}</span>
                <button class="remove-btn" onclick="Checkout.removeItem(${index})" title="Remove">×</button>
            </div>
        `;
    });
    
    Checkout.state.subtotal = subtotal;
    
    // Calculate delivery fee
    if (Checkout.state.delivery === 'paxi') {
        if (subtotal >= 650) {
            Checkout.state.deliveryFee = 0;
            html += `<div class="order-item">
                <span>🚚 Paxi Delivery</span>
                <span class="order-item-price free">FREE</span>
            </div>`;
        } else {
            const itemCount = Checkout.state.cart.reduce((sum, item) => sum + item.quantity, 0);
            if (itemCount <= 2) Checkout.state.deliveryFee = 60.00;
            else if (itemCount <= 4) Checkout.state.deliveryFee = 90.00;
            else Checkout.state.deliveryFee = 109.95;
            
            html += `<div class="order-item">
                <span>🚚 Paxi Delivery</span>
                <span class="order-item-price">R${Checkout.state.deliveryFee.toFixed(2)}</span>
            </div>`;
        }
    } else {
        Checkout.state.deliveryFee = 0;
        html += `<div class="order-item">
            <span>📍 Collection (Potchefstroom)</span>
            <span class="order-item-price free">FREE</span>
        </div>`;
    }
    
    Checkout.state.total = subtotal + Checkout.state.deliveryFee;
    
    container.innerHTML = html;
    document.getElementById('grandTotal').textContent = `R${Checkout.state.total.toFixed(2)}`;
};

// ===== Remove Item from Cart =====
Checkout.removeItem = function(index) {
    Checkout.state.cart.splice(index, 1);
    localStorage.setItem('sandyHairCart', JSON.stringify(Checkout.state.cart));
    Checkout.updateSummary();
    
    if (Checkout.state.cart.length === 0) {
        document.getElementById('payBtn').disabled = true;
        document.getElementById('orderItems').innerHTML = 
            '<p class="empty-cart">Your cart is empty. <a href="index.html">Continue shopping</a></p>';
        document.getElementById('grandTotal').textContent = 'R0.00';
    }
};

// ===== Step Navigation =====
Checkout.goToStep = function(step) {
    // Validate current step before proceeding
    if (Checkout.state.currentStep === 1 && step > 1) {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        if (!firstName) { alert('Please enter your first name'); return; }
        if (!lastName) { alert('Please enter your last name'); return; }
        if (!email) { alert('Please enter your email address'); return; }
        if (!phone) { alert('Please enter your phone number'); return; }
    }
    
    if (Checkout.state.currentStep === 2 && step === 3) {
        if (Checkout.state.delivery === 'paxi') {
            const paxiCode = document.getElementById('paxiCode').value.trim();
            const paxiPoint = document.getElementById('paxiPoint').value.trim();
            if (!paxiCode) { alert('Please enter your Paxi point code'); return; }
            if (!paxiPoint) { alert('Please enter your Paxi point name'); return; }
        }
    }
    
    // Hide all steps, show target step
    for (let i = 1; i <= 3; i++) {
        document.getElementById('step' + i).style.display = 'none';
    }
    document.getElementById('step' + step).style.display = 'block';
    
    Checkout.state.currentStep = step;
    Checkout.updateStepIndicator();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ===== Update Step Indicator =====
Checkout.updateStepIndicator = function() {
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById('step' + i + 'Ind');
        if (!indicator) continue;
        indicator.classList.remove('active', 'completed');
        if (i < Checkout.state.currentStep) {
            indicator.classList.add('completed');
        } else if (i === Checkout.state.currentStep) {
            indicator.classList.add('active');
        }
    }
};

// ===== Select Delivery Method =====
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

// ===== Generate Unique Payment ID =====
Checkout.generatePaymentId = function() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return 'SH-' + timestamp + '-' + random;
};

// ===== Build Item Description for PayFast =====
Checkout.buildItemDescription = function() {
    const items = Checkout.state.cart.map(item => 
        `${item.productName} ×${item.quantity}`
    );
    let desc = items.join(', ');
    
    // PayFast limits description to 255 characters
    if (desc.length > 250) {
        desc = desc.substring(0, 247) + '...';
    }
    
    return desc;
};

// ===== Process Payment via PayFast =====
Checkout.processPayment = function() {
    if (Checkout.state.cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Validate customer details
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!firstName || !lastName) {
        alert('Please complete your details in Step 1');
        Checkout.goToStep(1);
        return;
    }
    
    if (Checkout.state.delivery === 'paxi') {
        const paxiCode = document.getElementById('paxiCode').value.trim();
        const paxiPoint = document.getElementById('paxiPoint').value.trim();
        if (!paxiCode || !paxiPoint) {
            alert('Please complete your Paxi delivery details in Step 2');
            Checkout.goToStep(2);
            return;
        }
    }
    
    // Generate payment ID
    Checkout.state.paymentId = Checkout.generatePaymentId();
    
    // Get paxi details
    const paxiCode = document.getElementById('paxiCode')?.value.trim() || 'COLLECTION';
    const paxiPoint = document.getElementById('paxiPoint')?.value.trim() || 'Potchefstroom Collection';
    
    // Build item name
    const itemName = Checkout.state.cart.length === 1 
        ? Checkout.state.cart[0].productName 
        : `${Checkout.state.cart.length} Wig Units`;
    
    // Build item description
    const itemDescription = Checkout.buildItemDescription();
    
    // Populate PayFast form
    document.getElementById('pfMerchantId').value = Checkout.config.merchantId;
    document.getElementById('pfMerchantKey').value = Checkout.config.merchantKey;
    document.getElementById('pfReturnUrl').value = Checkout.config.returnUrl;
    document.getElementById('pfCancelUrl').value = Checkout.config.cancelUrl;
    document.getElementById('pfNotifyUrl').value = Checkout.config.notifyUrl;
    document.getElementById('pfPaymentId').value = Checkout.state.paymentId;
    document.getElementById('pfAmount').value = Checkout.state.total.toFixed(2);
    document.getElementById('pfItemName').value = itemName;
    document.getElementById('pfItemDescription').value = itemDescription;
    document.getElementById('pfNameFirst').value = firstName;
    document.getElementById('pfNameLast').value = lastName;
    document.getElementById('pfEmail').value = email;
    document.getElementById('pfCell').value = phone;
    document.getElementById('pfCustom1').value = paxiCode;
    document.getElementById('pfCustom2').value = paxiPoint;
    document.getElementById('pfCustom3').value = Checkout.state.delivery;
    
    // Show processing state
    document.getElementById('payBtn').style.display = 'none';
    document.getElementById('processingMsg').style.display = 'block';
    
    // Save order data to localStorage (in case payment fails and customer needs to retry)
    const orderData = {
        paymentId: Checkout.state.paymentId,
        customer: { firstName, lastName, email, phone },
        delivery: { method: Checkout.state.delivery, paxiCode, paxiPoint },
        cart: Checkout.state.cart,
        total: Checkout.state.total,
        date: new Date().toISOString()
    };
    localStorage.setItem('sandyHairLastOrder', JSON.stringify(orderData));
    
    // Submit the PayFast form after a brief delay
    setTimeout(() => {
        document.getElementById('payfastForm').submit();
    }, 1500);
};

// ===== Check for Payment Return =====
Checkout.checkPaymentReturn = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('status');
    
    if (paymentStatus === 'success') {
        // Payment was successful
        const lastOrder = localStorage.getItem('sandyHairLastOrder');
        if (lastOrder) {
            try {
                const orderData = JSON.parse(lastOrder);
                document.getElementById('orderRef').textContent = orderData.paymentId;
            } catch (e) {
                document.getElementById('orderRef').textContent = 'N/A';
            }
        }
        
        // Show success message
        document.getElementById('successMsg').classList.add('show');
        document.getElementById('payBtn').style.display = 'none';
        document.getElementById('processingMsg').style.display = 'none';
        
        // Clear cart
        localStorage.removeItem('sandyHairCart');
        localStorage.removeItem('sandyHairLastOrder');
        
        // Disable payment button
        document.getElementById('payBtn').disabled = true;
    } else if (paymentStatus === 'cancelled') {
        // Payment was cancelled - restore state
        document.getElementById('payBtn').style.display = 'block';
        document.getElementById('processingMsg').style.display = 'none';
    }
};

// ===== Initialize =====
Checkout.init = function() {
    console.log('🚀 Initializing Checkout...');
    console.log('💳 PayFast Merchant ID:', Checkout.config.merchantId);
    console.log('🔗 PayFast URL:', Checkout.config.payfastUrl);
    
    Checkout.loadCart();
    
    // Show step 1 initially
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    Checkout.updateStepIndicator();
    
    // Disable pay button if cart is empty
    if (Checkout.state.cart.length === 0) {
        document.getElementById('payBtn').disabled = true;
    }
    
    // Check if returning from PayFast
    Checkout.checkPaymentReturn();
    
    console.log('✅ Checkout ready');
    console.log('🛒 Cart items:', Checkout.state.cart.length);
    console.log('💰 Total:', Checkout.state.total.toFixed(2));
};

// ===== Run on DOM Load =====
document.addEventListener('DOMContentLoaded', Checkout.init);

// ===== Export =====
window.Checkout = Checkout;
