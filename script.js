/* ============================================
   Sandy Hair - PayFast Production Checkout
   3 Wigs for R1500 Promotion
   ============================================ */

const Checkout = {};

// PayFast Production Configuration
Checkout.config = {
    merchantId: '14200440',
    merchantKey: 'n6nehnkkafqcp',
    payfastUrl: 'https://www.payfast.co.za/eng/process',
    returnUrl: 'https://sandyhair.co.za/success.html',
    cancelUrl: 'https://sandyhair.co.za/cancel.html',
    notifyUrl: 'https://sandyhair.co.za/notify.php'
};

// Promo: 3 Wigs for R1500
Checkout.promo = {
    requiredItems: 3,
    promoPrice: 1500,
    pricePerUnit: 500
};

// State
Checkout.state = {
    currentStep: 1,
    delivery: 'paxi',
    cart: [],
    deliveryFee: 60.00,
    subtotal: 0,
    total: 0,
    paymentId: '',
    promoApplied: false,
    promoSavings: 0
};

Checkout.loadCart = function() {
    const saved = localStorage.getItem('sandyHairCart');
    if (saved) {
        try { Checkout.state.cart = JSON.parse(saved); } catch (e) { Checkout.state.cart = []; }
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

Checkout.updateSummary = function() {
    const container = document.getElementById('orderItems');
    let originalSubtotal = 0;
    let html = '';
    
    const totalItems = Checkout.state.cart.reduce((sum, item) => sum + item.quantity, 0);
    Checkout.state.promoApplied = totalItems >= Checkout.promo.requiredItems;
    
    if (Checkout.state.promoApplied) {
        html += `
            <div class="cart-promo-indicator">
                🎉 <strong>3-for-R1500 Promo Applied!</strong> You save R${originalSubtotal > 0 ? (originalSubtotal - 1500).toFixed(2) : '0.00'}!
            </div>
        `;
    } else if (totalItems === 2) {
        html += `
            <div class="cart-promo-indicator" style="background:#fff3e0;color:#e65100;">
                🔥 Add 1 more wig to get <strong>3 for R1500!</strong>
            </div>
        `;
    }
    
    Checkout.state.cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        originalSubtotal += itemTotal;
        
        let priceDisplay = `R${itemTotal.toFixed(2)}`;
        
        if (Checkout.state.promoApplied) {
            priceDisplay = `<span style="text-decoration:line-through;color:#999;">R${itemTotal.toFixed(2)}</span> <span style="color:#4caf50;font-weight:bold;">R${(Checkout.promo.pricePerUnit * item.quantity).toFixed(2)}</span>`;
        }
        
        html += `
            <div class="order-item">
                <span class="order-item-name">${item.productName}</span>
                <span class="order-item-qty">×${item.quantity}</span>
                <span class="order-item-price">${priceDisplay}</span>
                <button class="remove-btn" onclick="Checkout.removeItem(${index})">×</button>
            </div>
        `;
    });
    
    if (Checkout.state.promoApplied) {
        const groupsOf3 = Math.floor(totalItems / Checkout.promo.requiredItems);
        const remainder = totalItems % Checkout.promo.requiredItems;
        
        let remainderSubtotal = 0;
        if (remainder > 0) {
            const sortedByPrice = [...Checkout.state.cart].sort((a, b) => a.price - b.price);
            let remaining = remainder;
            for (let item of sortedByPrice) {
                if (remaining <= 0) break;
                const take = Math.min(item.quantity, remaining);
                remainderSubtotal += item.price * take;
                remaining -= take;
            }
        }
        
        Checkout.state.subtotal = (groupsOf3 * Checkout.promo.promoPrice) + remainderSubtotal;
        Checkout.state.promoSavings = originalSubtotal - Checkout.state.subtotal;
    } else {
        Checkout.state.subtotal = originalSubtotal;
        Checkout.state.promoSavings = 0;
    }
    
    if (Checkout.state.delivery === 'paxi') {
        if (totalItems >= 3 || Checkout.state.subtotal >= 650) {
            Checkout.state.deliveryFee = 0;
            html += '<div class="order-item"><span>🚚 Paxi Delivery</span><span class="order-item-price free">FREE</span></div>';
        } else {
            if (totalItems <= 2) Checkout.state.deliveryFee = 60.00;
            else Checkout.state.deliveryFee = 80.00;
            html += `<div class="order-item"><span>🚚 Paxi Delivery</span><span class="order-item-price">R${Checkout.state.deliveryFee.toFixed(2)}</span></div>`;
        }
    } else {
        Checkout.state.deliveryFee = 0;
        html += '<div class="order-item"><span>📍 Collection (Potchefstroom)</span><span class="order-item-price free">FREE</span></div>';
    }
    
    if (Checkout.state.promoSavings > 0) {
        html += `<div class="order-item savings-row"><span>💰 Promo Savings</span><span class="order-item-price" style="color:#4caf50;">-R${Checkout.state.promoSavings.toFixed(2)}</span></div>`;
    }
    
    Checkout.state.total = Checkout.state.subtotal + Checkout.state.deliveryFee;
    
    container.innerHTML = html;
    document.getElementById('grandTotal').textContent = `R${Checkout.state.total.toFixed(2)}`;
};

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

Checkout.goToStep = function(step) {
    if (Checkout.state.currentStep === 1 && step > 1) {
        const first = document.getElementById('firstName').value.trim();
        const last = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        if (!first) { alert('Please enter your first name'); return; }
        if (!last) { alert('Please enter your last name'); return; }
        if (!email) { alert('Please enter your email address'); return; }
        if (!phone || phone.length !== 10 || !/^[0-9]+$/.test(phone)) { 
            alert('Please enter a valid 10-digit phone number'); 
            return; 
        }
    }
    
    if (Checkout.state.currentStep === 2 && step === 3) {
        if (Checkout.state.delivery === 'paxi') {
            const code = document.getElementById('paxiCode').value.trim();
            const point = document.getElementById('paxiPoint').value.trim();
            if (!code) { alert('Please enter your Paxi point code'); return; }
            if (!point) { alert('Please enter your Paxi point name'); return; }
        }
    }
    
    for (let i = 1; i <= 3; i++) {
        document.getElementById('step' + i).style.display = 'none';
    }
    document.getElementById('step' + step).style.display = 'block';
    
    Checkout.state.currentStep = step;
    Checkout.updateStepIndicator();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

Checkout.updateStepIndicator = function() {
    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById('step' + i + 'Ind');
        if (!ind) continue;
        ind.classList.remove('active', 'completed');
        if (i < Checkout.state.currentStep) ind.classList.add('completed');
        else if (i === Checkout.state.currentStep) ind.classList.add('active');
    }
};

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

Checkout.generatePaymentId = function() {
    return 'SH-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
};

Checkout.processPayment = function() {
    if (Checkout.state.cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    let phone = document.getElementById('phone').value.trim();
    phone = phone.replace(/[^0-9]/g, '');
    
    if (!phone || phone.length !== 10) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    const paxiCode = Checkout.state.delivery === 'paxi' ? document.getElementById('paxiCode').value.trim() : 'COLLECTION';
    const paxiPoint = Checkout.state.delivery === 'paxi' ? document.getElementById('paxiPoint').value.trim() : 'Potchefstroom';
    
    Checkout.state.paymentId = Checkout.generatePaymentId();
    
    let itemDesc = Checkout.state.cart.map(i => i.productName + ' x' + i.quantity).join(', ');
    if (itemDesc.length > 250) itemDesc = itemDesc.substring(0, 247) + '...';
    
    const itemName = Checkout.state.cart.length === 1 
        ? Checkout.state.cart[0].productName 
        : Checkout.state.cart.length + ' Wig Units' + (Checkout.state.promoApplied ? ' - 3 for R1500' : '');
    
    const form = document.getElementById('payfastForm');
    form.action = Checkout.config.payfastUrl;
    
    document.getElementById('pfPaymentId').value = Checkout.state.paymentId;
    document.getElementById('pfAmount').value = Checkout.state.total.toFixed(2);
    document.getElementById('pfItemName').value = itemName;
    document.getElementById('pfItemDescription').value = itemDesc;
    document.getElementById('pfNameFirst').value = firstName;
    document.getElementById('pfNameLast').value = lastName;
    document.getElementById('pfEmail').value = email;
    document.getElementById('pfCell').value = phone;
    document.getElementById('pfCustom1').value = paxiCode;
    document.getElementById('pfCustom2').value = paxiPoint;
    document.getElementById('pfCustom3').value = Checkout.state.delivery;
    
    localStorage.setItem('sandyHairLastOrder', JSON.stringify({
        paymentId: Checkout.state.paymentId,
        customer: { firstName, lastName, email, phone },
        delivery: { method: Checkout.state.delivery, paxiCode, paxiPoint },
        cart: Checkout.state.cart,
        total: Checkout.state.total,
        promoApplied: Checkout.state.promoApplied
    }));
    
    document.getElementById('payBtn').style.display = 'none';
    document.getElementById('processingMsg').style.display = 'block';
    
    setTimeout(() => { form.submit(); }, 1000);
};

Checkout.checkReturn = function() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
        const lastOrder = localStorage.getItem('sandyHairLastOrder');
        if (lastOrder) {
            try {
                document.getElementById('orderRef').textContent = JSON.parse(lastOrder).paymentId;
            } catch(e) {}
        }
        document.getElementById('successMsg').classList.add('show');
        document.getElementById('payBtn').style.display = 'none';
        document.getElementById('processingMsg').style.display = 'none';
        localStorage.removeItem('sandyHairCart');
        localStorage.removeItem('sandyHairLastOrder');
    }
};

Checkout.init = function() {
    Checkout.loadCart();
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    Checkout.updateStepIndicator();
    Checkout.checkReturn();
    if (Checkout.state.cart.length === 0) {
        document.getElementById('payBtn').disabled = true;
    }
};

document.addEventListener('DOMContentLoaded', Checkout.init);
window.Checkout = Checkout;
