const tg = window.Telegram.WebApp;
tg.expand();

// Initialize state
let categories = [];
let products = [];
let cart = [];
let selectedCategory = null;
let userBalance = 0;

// DOM Elements
const categoryList = document.getElementById('categoryList');
const productList = document.getElementById('productList');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const userBalanceEl = document.getElementById('userBalance');
const topupModal = document.getElementById('topupModal');
const topupBtn = document.getElementById('topupBtn');
const closeTopup = document.getElementById('closeTopup');
const confirmTopup = document.getElementById('confirmTopup');
const topupAmount = document.getElementById('topupAmount');
const paymentMethods = document.querySelectorAll('.payment-method');

// Fetch initial data
async function fetchData() {
    try {
        const response = await fetch('/api/init-data', {
            headers: {
                'Telegram-Data': tg.initData
            }
        });
        const data = await response.json();
        categories = data.categories;
        products = data.products;
        userBalance = data.balance;
        
        renderCategories();
        renderProducts();
        updateBalance();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Render functions
function renderCategories() {
    categoryList.innerHTML = categories.map(category => `
        <div class="category-item" data-id="${category.id}">
            ${category.name}
        </div>
    `).join('');

    // Add click handlers
    categoryList.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            selectedCategory = item.dataset.id;
            renderProducts();
        });
    });
}

function renderProducts() {
    const filteredProducts = selectedCategory
        ? products.filter(p => p.category_id === parseInt(selectedCategory))
        : products;

    productList.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <button class="btn-primary add-to-cart" data-id="${product.id}">
                Add to Cart
            </button>
        </div>
    `).join('');

    // Add click handlers
    productList.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            addToCart(parseInt(button.dataset.id));
        });
    });
}

function updateCart() {
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name}</span>
            <span>$${item.price.toFixed(2)} x ${item.quantity}</span>
            <button class="btn-secondary remove-item" data-id="${item.id}">Remove</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;

    // Add remove handlers
    cartItems.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            removeFromCart(parseInt(button.dataset.id));
        });
    });
}

function updateBalance() {
    userBalanceEl.textContent = `$${userBalance.toFixed(2)}`;
}

// Cart functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    updateCart();
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCart();
    }
}

// Payment handling
let selectedPaymentMethod = null;

paymentMethods.forEach(method => {
    method.addEventListener('click', () => {
        paymentMethods.forEach(m => m.classList.remove('selected'));
        method.classList.add('selected');
        selectedPaymentMethod = method.dataset.method;
    });
});

topupBtn.addEventListener('click', () => {
    topupModal.style.display = 'block';
});

closeTopup.addEventListener('click', () => {
    topupModal.style.display = 'none';
});

confirmTopup.addEventListener('click', async () => {
    const amount = parseFloat(topupAmount.value);
    if (!amount || !selectedPaymentMethod) return;

    try {
        const response = await fetch('/api/topup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Telegram-Data': tg.initData
            },
            body: JSON.stringify({
                amount,
                paymentMethod: selectedPaymentMethod
            })
        });

        const data = await response.json();
        if (data.success) {
            userBalance = data.newBalance;
            updateBalance();
            topupModal.style.display = 'none';
        }
    } catch (error) {
        console.error('Error processing payment:', error);
    }
});

// Checkout handling
document.getElementById('checkoutBtn').addEventListener('click', async () => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (total > userBalance) {
        alert('Insufficient balance. Please top up your account.');
        return;
    }

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Telegram-Data': tg.initData
            },
            body: JSON.stringify({ cart })
        });

        const data = await response.json();
        if (data.success) {
            userBalance = data.newBalance;
            cart = [];
            updateCart();
            updateBalance();
            tg.showAlert('Order placed successfully!');
        }
    } catch (error) {
        console.error('Error processing order:', error);
    }
});

// Initialize
fetchData();
