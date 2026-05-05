const Checkout = {};

Checkout.config = {
    merchantId: '14200440',
    merchantKey: 'n6nehnkkafqcp',
    payfastUrl: 'https://www.payfast.co.za/eng/process',
    returnUrl: 'https://sandyhair.co.za/success.html',
    cancelUrl: 'https://sandyhair.co.za/cancel.html',
    notifyUrl: 'https://sandyhair.co.za/notify.php'
};

Checkout.promo = { requiredItems: 3, promoPrice: 1500, pricePerUnit: 500 };

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
    var saved = localStorage.getItem('sandyHairCart');
    if (saved) { try { Checkout.state.cart = JSON.parse(saved); } catch (e) { Checkout.state.cart = []; } }
    
    if (Checkout.state.cart.length === 0) {
        document.getElementById('orderItems').innerHTML = '<p class="empty-cart">Your cart is empty. <a href="index.html">Continue shopping</a></p>';
        document.getElementById('grandTotal').textContent = 'R0.00';
        document.getElementById('payBtn').disabled = true;
        return;
    }
    Checkout.updateSummary();
};

Checkout.updateSummary = function() {
    var container = document.getElementById('orderItems');
    var originalSubtotal = 0;
    var html = '';
    var totalItems = Checkout.state.cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
    Checkout.state.promoApplied = totalItems >= Checkout.promo.requiredItems;
    
    if (Checkout.state.promoApplied) {
        html += '<div class="cart-promo-indicator">3-for-R1500 Promo Applied!</div>';
    } else if (totalItems === 2) {
        html += '<div class="cart-promo-indicator" style="background:#fff3e0;color:#e65100;">Add 1 more wig to get 3 for R1500!</div>';
    }
    
    Checkout.state.cart.forEach(function(item, index) {
        var itemTotal = item.price * item.quantity;
        originalSubtotal += itemTotal;
        var priceDisplay = 'R' + itemTotal.toFixed(2);
        if (Checkout.state.promoApplied) {
            priceDisplay = '<span style="text-decoration:line-through;color:#999;">R' + itemTotal.toFixed(2) + '</span> <span style="color:#4caf50;font-weight:bold;">R' + (Checkout.promo.pricePerUnit * item.quantity).toFixed(2) + '</span>';
        }
        html += '<div class="order-item"><span class="order-item-name">' + item.productName + '</span><span class="order-item-qty">x' + item.quantity + '</span><span class="order-item-price">' + priceDisplay + '</span><button class="remove-btn" onclick="Checkout.removeItem(' + index + ')">x</button></div>';
    });
    
    if (Checkout.state.promoApplied) {
        var groupsOf3 = Math.floor(totalItems / Checkout.promo.requiredItems);
        var remainder = totalItems % Checkout.promo.requiredItems;
        var remainderSubtotal = 0;
        if (remainder > 0) {
            var sortedByPrice = Checkout.state.cart.slice().sort(function(a, b) { return a.price - b.price; });
            var remaining = remainder;
            sortedByPrice.forEach(function(item) {
                if (remaining <= 0) return;
                var take = Math.min(item.quantity, remaining);
                remainderSubtotal += item.price * take;
                remaining -= take;
            });
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
            html += '<div class="order-item"><span>Paxi Delivery</span><span class="order-item-price free">FREE</span></div>';
        } else {
            Checkout.state.deliveryFee = totalItems <= 2 ? 60.00 : 80.00;
            html += '<div class="order-item"><span>Paxi Delivery</span><span class="order-item-price">R' + Checkout.state.deliveryFee.toFixed(2) + '</span></div>';
        }
    } else {
        Checkout.state.deliveryFee = 0;
        html += '<div class="order-item"><span>Collection (Potchefstroom)</span><span class="order-item-price free">FREE</span></div>';
    }
    
    if (Checkout.state.promoSavings > 0) {
        html += '<div class="order-item savings-row"><span>Promo Savings</span><span class="order-item-price" style="color:#4caf50;">-R' + Checkout.state.promoSavings.toFixed(2) + '</span></div>';
    }
    
    Checkout.state.total = Checkout.state.subtotal + Checkout.state.deliveryFee;
    container.innerHTML = html;
    document.getElementById('grandTotal').textContent = 'R' + Checkout.state.total.toFixed(2);
};

Checkout.removeItem = function(index) {
    Checkout.state.cart.splice(index, 1);
    localStorage.setItem('sandyHairCart', JSON.stringify(Checkout.state.cart));
    if (Checkout.state.cart.length === 0) {
        document.getElementById('orderItems').innerHTML = '<p class="empty-cart">Your cart is empty. <a href="index.html">Continue shopping</a></p>';
        document.getElementById('grandTotal').textContent = 'R0.00';
        document.getElementById('payBtn').disabled = true;
        return;
    }
    Checkout.updateSummary();
};

Checkout.goToStep = function(step) {
    if (Checkout.state.currentStep === 1 && step > 1) {
        var first = document.getElementById('firstName').value.trim();
        var last = document.getElementById('lastName').value.trim();
        var email = document.getElementById('email').value.trim();
        var phone = document.getElementById('phone').value.trim();
        if (!first) { alert('Please enter your first name'); return; }
        if (!last) { alert('Please enter your last name'); return; }
        if (!email) { alert('Please enter your email address'); return; }
        if (!phone || phone.length !== 10 || !/^[0-9]+$/.test(phone)) { alert('Please enter a valid 10-digit phone number'); return; }
    }
    if (Checkout.state.currentStep === 2 && step === 3 && Checkout.state.delivery === 'paxi') {
        if (!document.getElementById('paxiCode').value.trim()) { alert('Please enter your Paxi point code'); return; }
        if (!document.getElementById('paxiPoint').value.trim()) { alert('Please enter your Paxi point name'); return; }
    }
    for (var i = 1; i <= 3; i++) { document.getElementById('step' + i).style.display = 'none'; }
    document.getElementById('step' + step).style.display = 'block';
    Checkout.state.currentStep = step;
    Checkout.updateStepIndicator();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

Checkout.updateStepIndicator = function() {
    for (var i = 1; i <= 3; i++) {
        var ind = document.getElementById('step' + i + 'Ind');
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
    Checkout.updateSummary();
};

Checkout.processPayment = function() {
    if (Checkout.state.cart.length === 0) { alert('Your cart is empty'); return; }
    var firstName = document.getElementById('firstName').value.trim();
    var lastName = document.getElementById('lastName').value.trim();
    var email = document.getElementById('email').value.trim();
    var phone = document.getElementById('phone').value.trim().replace(/[^0-9]/g, '');
    if (!phone || phone.length !== 10) { alert('Please enter a valid 10-digit phone number'); return; }
    
    Checkout.state.paymentId = 'SH-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    var paxiCode = Checkout.state.delivery === 'paxi' ? document.getElementById('paxiCode').value.trim() : 'COLLECTION';
    var paxiPoint = Checkout.state.delivery === 'paxi' ? document.getElementById('paxiPoint').value.trim() : 'Potchefstroom';
    var itemDesc = Checkout.state.cart.map(function(i) { return i.productName + ' x' + i.quantity; }).join(', ');
    var itemName = Checkout.state.cart.length === 1 ? Checkout.state.cart[0].productName : Checkout.state.cart.length + ' Wig Units';
    
    document.getElementById('pfPaymentId').value = Checkout.state.paymentId;
    document.getElementById('pfAmount').value = Checkout.state.total.toFixed(2);
    document.getElementById('pfItemName').value = itemName;
    document.getElementById('pfItemDescription').value = itemDesc.substring(0, 250);
    document.getElementById('pfNameFirst').value = firstName;
    document.getElementById('pfNameLast').value = lastName;
    document.getElementById('pfEmail').value = email;
    document.getElementById('pfCell').value = phone;
    document.getElementById('pfCustom1').value = paxiCode;
    document.getElementById('pfCustom2').value = paxiPoint;
    
    localStorage.setItem('sandyHairLastOrder', JSON.stringify({ paymentId: Checkout.state.paymentId, cart: Checkout.state.cart, total: Checkout.state.total }));
    document.getElementById('payBtn').style.display = 'none';
    document.getElementById('processingMsg').style.display = 'block';
    setTimeout(function() { document.getElementById('payfastForm').submit(); }, 1000);
};

Checkout.init = function() {
    Checkout.loadCart();
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    Checkout.updateStepIndicator();
};

window.onload = Checkout.init;
