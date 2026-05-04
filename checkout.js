/* ============================================
   Sandy Hair - PayFast Production Checkout
   ============================================ */

const Checkout = {};

// PayFast Production Configuration
Checkout.config = {
    merchantId: '14200440',
    merchantKey: 'n6nehnkkafqcp',
    payfastUrl: 'https://www.payfast.co.za/eng/process',
    returnUrl: 'https://sandy-s-1.0.0.payfast.com/success.html',
    cancelUrl: 'https://sandy-s-1.0.0.payfast.com/cancel.html',
    notifyUrl: 'https://sandy-s-1.0.0.payfast.com/notify.php'
};

// State
Checkout.state = {
    currentStep: 1,
    delivery: 'paxi',
    cart: [],
    deliveryFee: 60.00,
    subtotal: 0,
    total: 0,
    paymentId: ''
};

// Load cart from localStorage
Checkout.loadCart = function() {
    const saved = localStorage.getItem('sandyHairCart');
    if (saved) {
        try { 
            Checkout.state.cart = JSON.parse(saved); 
        } catch (e) { 
            Checkout.state.cart = []; 
        }
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
                <span class="order-item-qty">Ã—${item.quantity}</span>
                <span class="order-item-price">R${itemTotal.toFixed(2)}</span>
                <button class="remove-btn" onclick="Checkout.removeItem(${index})">Ã—</button>
            </div>
        `;
    });
    
    Checkout.state.subtotal = subtotal;
    
    // Delivery fee
    if (Checkout.state.delivery === 'paxi') {
        if (subtotal >= 650) {
            Checkout.state.deliveryFee = 0;
            html += `<div class="order-item"><span>ðŸšš Paxi Delivery</span><span class="order-item-price free">FREE</span></div>`;
        } else {
            const itemCount = Checkout.state.cart.reduce((s, i) => s + i.quantity, 0);
            if (itemCount <= 2) Checkout.state.deliveryFee = 60.00;
            else if (itemCount <= 4) Checkout.state.deliveryFee = 80.00;
            else Checkout.state.deliveryFee = 110.00;
            html += `<div class="order-item"><span>ðŸšš Paxi Delivery</span><span class="order-item-price">R${Checkout.state.deliveryFee.toFixed(2)}</span></div>`;
        }
    } else {
        Checkout.state.deliveryFee = 0;
        html += `<div class="order-item"><span>ðŸ“ Collection (Potchefstroom)</span><span class="order-item-price free">FREE</span></div>`;
    }
    
    Checkout.state.total = subtotal + Checkout.state.deliveryFee;
    
    container.innerHTML = html;
    document.getElementById('grandTotal').textContent = `R${Checkout.state.total.toFixed(2)}`;
};

// Remove item from cart
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

// Step navigation
Checkout.goToStep = function(step) {
    // Validate step 1
    if (Checkout.state.currentStep === 1 && step > 1) {
        const first = document.getElementById('firstName').value.trim();
        const last = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        if (!first) { alert('Please enter your first name'); return; }
        if (!last) { alert('Please enter your last name'); return; }
        if (!email) { alert('Please enter your email address'); return; }
        if (!phone || phone.length !== 10 || !/^[0-9]+$/.test(phone)) { 
            alert('Please enter a valid 10-digit phone number (e.g., 0712345678)'); 
            return; 
        }
    }
    
    // Validate step 2
    if (Checkout.state.currentStep === 2 && step === 3) {
        if (Checkout.state.delivery === 'paxi') {
            const code = document.getElementById('paxiCode').value.trim();
            const point = document.getElementById('paxiPoint').value.trim();
            if (!code) { alert('Please enter your Paxi point code'); return; }
            if (!point) { alert('Please enter your Paxi point name'); return; }
        }
    }
    
    // Show target step
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
        if (!ind) continue;
        ind.classList.remove('active', 'completed');
        if (i < Checkout.state.currentStep) ind.classList.add('completed');
        else if (i === Checkout.state.currentStep) ind.classList.add('active');
    }
};

// Select delivery method
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

// Generate unique payment ID
Checkout.generatePaymentId = function() {
    return 'SH-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
};

// Build item description
Checkout.buildItemDescription = function() {
    let desc = Checkout.state.cart.map(i => i.productName + ' x' + i.quantity).join(', ');
    if (desc.length > 250) desc = desc.substring(0, 247) + '...';
    return desc;
};

// Sanitize phone number for PayFast (remove any non-digits)
Checkout.sanitizePhone = function(phone) {
    return phone.replace(/[^0-9]/g, '');
};

// Process payment via PayFast
Checkout.processPayment = function() {
    if (Checkout.state.cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Get customer details
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    let phone = document.getElementById('phone').value.trim();
    
    // Clean phone number
    phone = Checkout.sanitizePhone(phone);
    
    // Validate phone
    if (!phone || phone.length !== 10 || !/^[0-9]+$/.test(phone)) {
        alert('Please enter a valid 10-digit phone number (e.g., 0712345678)');
        document.getElementById('phone').focus();
        return;
    }
    
    // Validate delivery
    if (Checkout.state.delivery === 'paxi') {
        const paxiCode = document.getElementById('paxiCode').value.trim();
        const paxiPoint = document.getElementById('paxiPoint').value.trim();
        if (!paxiCode || !paxiPoint) {
            alert('Please complete your delivery details in Step 2');
            Checkout.goToStep(2);
            return;
        }
    }
    
    // Get delivery details
    const paxiCode = Checkout.state.delivery === 'paxi' ? document.getElementById('paxiCode').value.trim() : 'COLLECTION';
    const paxiPoint = Checkout.state.delivery === 'paxi' ? document.getElementById('paxiPoint').value.trim() : 'Potchefstroom';
    
    // Generate payment ID
    Checkout.state.paymentId = Checkout.generatePaymentId();
    
    // Build item name
    const itemName = Checkout.state.cart.length === 1 
        ? Checkout.state.cart[0].productName 
        : Checkout.state.cart.length + ' Wig Units';
    
    // Build description
    const itemDescription = Checkout.buildItemDescription();
    
    // Set PayFast form values
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
    
    // Save order to localStorage
    const orderData = {
        paymentId: Checkout.state.paymentId,
        customer: { firstName, lastName, email, phone },
        delivery: { method: Checkout.state.delivery, paxiCode, paxiPoint },
        cart: Checkout.state.cart,
        total: Checkout.state.total,
        date: new Date().toISOString()
    };
    localStorage.setItem('sandyHairLastOrder', JSON.stringify(orderData));
    
    // Show processing
    document.getElementById('payBtn').style.display = 'none';
    document.getElementById('processingMsg').style.display = 'block';
    
    // Log for debugging
    console.log('Submitting to PayFast:', {
        merchantId: Checkout.config.merchantId,
        paymentId: Checkout.state.paymentId,
        amount: Checkout.state.total.toFixed(2),
        itemName: itemName,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        paxiCode: paxiCode,
        paxiPoint: paxiPoint
    });
    
    // Submit to PayFast production
    setTimeout(() => {
        document.getElementById('payfastForm').submit();
    }, 1000);
};

// Check if returning from PayFast
Checkout.checkReturn = function() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const paymentId = params.get('m_payment_id');
    
    if (status === 'success' || paymentId) {
        // Try to get saved order
        const lastOrder = localStorage.getItem('sandyHairLastOrder');
        if (lastOrder) {
            try {
                const data = JSON.parse(lastOrder);
                document.getElementById('orderRef').textContent = data.paymentId || paymentId || 'N/A';
            } catch(e) {
                document.getElementById('orderRef').textContent = paymentId || 'N/A';
            }
        } else {
            document.getElementById('orderRef').textContent = paymentId || 'N/A';
        }
        
        // Show success
        document.getElementById('successMsg').classList.add('show');
        document.getElementById('payBtn').style.display = 'none';
        document.getElementById('processingMsg').style.display = 'none';
        
        // Clear cart
        localStorage.removeItem('sandyHairCart');
        localStorage.removeItem('sandyHairLastOrder');
    }
};

// Initialize checkout
Checkout.init = function() {
    console.log('ðŸš€ Initializing Checkout - Production Mode');
    console.log('Merchant ID:', Checkout.config.merchantId);
    console.log('PayFast URL:', Checkout.config.payfastUrl);
    
    Checkout.loadCart();
    
    // Show step 1
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    Checkout.updateStepIndicator();
    
    // Check if returning from payment
    Checkout.checkReturn();
    
    // Disable pay button if cart empty
    if (Checkout.state.cart.length === 0) {
        document.getElementById('payBtn').disabled = true;
    }
    
    console.log('âœ… Checkout ready - Production');
    console.log('Cart items:', Checkout.state.cart.length);
    console.log('Total:', Checkout.state.total.toFixed(2));
};

// Run on page load
document.addEventListener('DOMContentLoaded', Checkout.init);

// Export
window.Checkout = Checkout;
