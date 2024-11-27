const tg = window.Telegram.WebApp;
let cart = [];

// Initialize Telegram WebApp
tg.expand();
tg.MainButton.text = "Checkout";
tg.MainButton.hide();

// Load categories and products
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        const categoryList = document.getElementById('categoryList');
        
        categories.forEach(category => {
            const categoryBtn = document.createElement('button');
            categoryBtn.className = 'btn-secondary category-item';
            categoryBtn.textContent = category.name;
            categoryBtn.onclick = () => loadProducts(category.id);
            categoryList.appendChild(categoryBtn);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadProducts(categoryId = null) {
    try {
        const response = await fetch('/api/products');
        let products = await response.json();
        
        if (categoryId) {
            products = products.filter(p => p.category_id === categoryId);
        }
        
        const productList = document.getElementById('productList');
        productList.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-info">
                    <div class="product-title">${product.name}</div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                </div>
                <button class="btn-primary" onclick="addToCart(${JSON.stringify(product)})">Add to Cart</button>
            `;
            productList.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    cartItems.innerHTML = '';
    
    let total = 0;
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'product-card';
        itemElement.innerHTML = `
            <div class="product-info">
                <div class="product-title">${item.name} x${item.quantity}</div>
                <div class="product-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
            <button class="btn-secondary" onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItems.appendChild(itemElement);
        total += item.price * item.quantity;
    });
    
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    if (cart.length > 0) {
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Payment Modal
const modal = document.getElementById('paymentModal');
const closeModal = document.getElementById('closeModal');
const processPayment = document.getElementById('processPayment');

document.getElementById('checkoutBtn').onclick = () => {
    modal.style.display = 'block';
};

closeModal.onclick = () => {
    modal.style.display = 'none';
};

processPayment.onclick = async () => {
    const amount = document.getElementById('amount').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    try {
        const response = await fetch('/api/process_payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount,
                payment_method: paymentMethod
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            tg.showAlert('Payment processed successfully!');
            modal.style.display = 'none';
            cart = [];
            updateCart();
        } else {
            tg.showAlert('Payment failed: ' + result.detail);
        }
    } catch (error) {
        tg.showAlert('Error processing payment');
        console.error('Payment error:', error);
    }
};

// Initialize
loadCategories();
loadProducts();
