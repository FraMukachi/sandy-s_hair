/* ============================================
   Sandy Hair - Paystack Production Checkout
   ============================================ */

const Checkout = {};

// Step 2: Configure your Paystack details here
Checkout.config = {
    publicKey: 'pk_test_6426c78652762f83cd461215baa1722e5bcbeaa4', // REPLACE WITH YOUR LIVE PUBLIC KEY [citation:10]
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

// Load cart
Checkout.loadCart = function() {
    var saved = localStorage.getItem('sandyHairCart');
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

// Update order summary
Checkout.updateSummary = function() {
    var container = document.getElementById('orderItems');
    var originalSubtotal = 0;
    var html = '';
    
    var totalItems = Checkout.state.cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
    Checkout.state.promoApplied = totalItems >= Checkout.promo.requiredItems;
    
    if (Checkout.state.promoApplied) {
        html += '<div class="cart-promo-indicator">🎉 <strong>3-for-R1500 Promo Applied!</strong></div>';
    } else if (totalItems === 2) {
        html += '<div class="cart-promo-indicator" style="background:#fff3e0;color:#e65100;">🔥 Add 1 more wig to get <strong>3 for R1500!</strong></div>';
    }
    
    Checkout.state.cart.forEach(function(item, index) {
        var itemTotal = item.price * item.quantity;
        originalSubtotal += itemTotal;
        
        var priceDisplay = `R${itemTotal.toFixed(2)}`;
        
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
        var groupsOf3 = Math.floor(totalItems / Checkout.promo.requiredItems);
        var remainder = totalItems % Checkout.promo.requiredItems;
        var remainderSubtotal = 0;
        if (remainder > 0) {
            var sortedByPrice = [...Checkout.state.cart].sort(function(a, b) { return a.price - b.price; });
            var remaining = remainder;
            for (var i = 0; i < sortedByPrice.length && remaining > 0; i++) {
                var take = Math.min(sortedByPrice[i].quantity, remaining);
                remainderSubtotal += sortedByPrice[i].price * take;
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

// Remove item
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

// Step Navigation
Checkout.goToStep = function(step) {
    if (Checkout.state.currentStep === 1 && step > 1) {
        var first = document.getElementById('firstName').value.trim();
        var last = document.getElementById('lastName').value.trim();
        var email = document.getElementById('email').value.trim();
        var phone = document.getElementById('phone').value.trim();
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
            var code = document.getElementById('paxiCode').value.trim();
            var point = document.getElementById('paxiPoint').value.trim();
            if (!code) { alert('Please enter your Paxi point code'); return; }
            if (!point) { alert('Please enter your Paxi point name'); return; }
        }
    }
    
    for (var i = 1; i <= 3; i++) {
        document.getElementById('step' + i).style.display = 'none';
    }
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

// Step 3: Create the function to open the Paystack payment window
Checkout.payWithPaystack = function() {
    if (Checkout.state.cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Collect final customer details
    var firstName = document.getElementById('firstName').value.trim();
    var lastName = document.getElementById('lastName').value.trim();
    var email = document.getElementById('email').value.trim();
    var phone = document.getElementById('phone').value.trim();
    
    // Show processing state
    document.getElementById('payBtn').style.display = 'none';
    document.getElementById('processingMsg').style.display = 'block';
    
    // Generate a unique reference for the transaction
    var reference = 'SH-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Configure and open the Paystack Inline window [citation:10]
    var handler = window.PaystackPop.setup({
        key: Checkout.config.publicKey, // Your Paystack public key
        email: email,
        amount: Math.round(Checkout.state.total * 100), // Paystack expects amount in cents [citation:7]
        currency: 'ZAR', // South African Rand [citation:5]
        ref: reference,
        label: 'Sandy Hair', // This will appear on the customer's bank statement
        metadata: {
            custom_fields: [
                { display_name: "First Name", variable_name: "first_name", value: firstName },
                { display_name: "Last Name", variable_name: "last_name", value: lastName },
                { display_name: "Phone", variable_name: "phone", value: phone },
                { display_name: "Delivery", variable_name: "delivery", value: Checkout.state.delivery },
                { display_name: "Paxi Code", variable_name: "paxi_code", value: document.getElementById('paxiCode')?.value || 'N/A' },
                { display_name: "Cart Items", variable_name: "cart_items", value: Checkout.state.cart.map(function(i) { return i.productName + ' x' + i.quantity; }).join(', ') }
            ]
        },
        onSuccess: function(transaction) {
            // This runs when payment is verified by Paystack [citation:10]
            document.getElementById('processingMsg').style.display = 'none';
            document.getElementById('successMsg').classList.add('show');
            document.getElementById('orderRef').textContent = transaction.reference;
            
            // Clear the cart
            localStorage.removeItem('sandyHairCart');
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        },
        onCancel: function() {
            // User closed the payment window without paying
            document.getElementById('payBtn').style.display = 'block';
            document.getElementById('processingMsg').style.display = 'none';
        },
        onError: function(error) {
            // An error occurred during the transaction
            alert('An error occurred: ' + error.message);
            document.getElementById('payBtn').style.display = 'block';
            document.getElementById('processingMsg').style.display = 'none';
        }
    });
    
    handler.openIframe(); // Open the payment window
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
};

document.addEventListener('DOMContentLoaded', Checkout.init);
window.Checkout = Checkout;
