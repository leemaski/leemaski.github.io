let cart = [];
let categories = [];
let products = [];
let currentCategory = null;
const API_BASE_URL = 'http://localhost:8080';

// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Get user data and log it
const initData = tg.initData || '';
const userID = tg.initDataUnsafe?.user?.id;
console.log('Telegram WebApp Data:', {
    initData,
    userID,
    user: tg.initDataUnsafe?.user,
    platform: tg.platform,
    version: tg.version
});

// Headers for API requests
const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
        'X-Telegram-User-Id': userID ? userID.toString() : '',
        'X-Telegram-Init-Data': initData
    };
    console.log('Request Headers:', headers);
    return headers;
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('WebApp Initialized');
    if (!userID) {
        console.error('No user ID available from Telegram WebApp');
        showError('Unable to get user data from Telegram');
        return;
    }
    await loadCategories();
    await loadProducts();
    updateCartCount();
    await loadUserBalance();
});

async function loadUserBalance() {
    try {
        console.log('Fetching user balance...');
        const response = await fetch(`${API_BASE_URL}/api/user/balance`, {
            headers: getHeaders()
        });
        console.log('Balance Response:', response.status);
        const data = await response.json();
        console.log('Balance Data:', data);
        
        if (data.success) {
            document.getElementById('user-balance').textContent = data.balance.toFixed(2);
        } else {
            console.error('Balance fetch failed:', data.message);
        }
    } catch (error) {
        console.error('Error loading balance:', error);
    }
}

async function loadCategories() {
    try {
        console.log('Fetching categories...');
        const response = await fetch(`${API_BASE_URL}/api/categories`, {
            headers: getHeaders()
        });
        console.log('Categories Response:', response.status);
        categories = await response.json();
        console.log('Categories Data:', categories);
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('Failed to load categories');
    }
}

async function loadProducts(categoryId = null) {
    try {
        console.log('Fetching products...');
        const url = categoryId ? 
            `${API_BASE_URL}/api/products?category=${categoryId}` : 
            `${API_BASE_URL}/api/products`;
        const response = await fetch(url, {
            headers: getHeaders()
        });
        console.log('Products Response:', response.status);
        products = await response.json();
        console.log('Products Data:', products);
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products');
    }
}

function renderCategories() {
    console.log('Rendering categories...');
    const categoriesContainer = document.querySelector('.categories');
    categoriesContainer.innerHTML = '';
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = `category-btn ${currentCategory === category.id ? 'active' : ''}`;
        button.textContent = category.name;
        button.onclick = () => {
            currentCategory = category.id;
            loadProducts(category.id);
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        };
        categoriesContainer.appendChild(button);
    });
}

function renderProducts() {
    console.log('Rendering products...');
    const productsGrid = document.querySelector('.products-grid');
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-quantity">
                <button class="quantity-btn" onclick="decrementQuantity(${product.id})">-</button>
                <span id="quantity-${product.id}">0</span>
                <button class="quantity-btn" onclick="incrementQuantity(${product.id})">+</button>
            </div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productsGrid.appendChild(productCard);
    });
}

function incrementQuantity(productId) {
    console.log('Incrementing quantity for product', productId);
    const quantityElement = document.getElementById(`quantity-${productId}`);
    let quantity = parseInt(quantityElement.textContent);
    quantityElement.textContent = quantity + 1;
}

function decrementQuantity(productId) {
    console.log('Decrementing quantity for product', productId);
    const quantityElement = document.getElementById(`quantity-${productId}`);
    let quantity = parseInt(quantityElement.textContent);
    if (quantity > 0) {
        quantityElement.textContent = quantity - 1;
    }
}

function addToCart(productId) {
    console.log('Adding product to cart', productId);
    const quantity = parseInt(document.getElementById(`quantity-${productId}`).textContent);
    if (quantity === 0) return;

    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId,
            name: product.name,
            price: product.price,
            quantity
        });
    }

    document.getElementById(`quantity-${productId}`).textContent = '0';
    updateCartCount();
    showSuccess('Added to cart');
}

function updateCartCount() {
    console.log('Updating cart count...');
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function showCart() {
    console.log('Showing cart...');
    const modal = document.getElementById('cart-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    let cartHtml = '<h2>Shopping Cart</h2>';
    let total = 0;

    if (cart.length === 0) {
        cartHtml += '<p>Your cart is empty</p>';
    } else {
        cartHtml += '<div class="cart-items">';
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            cartHtml += `
                <div class="cart-item">
                    <span>${item.name}</span>
                    <span>x${item.quantity}</span>
                    <span>$${itemTotal.toFixed(2)}</span>
                    <button onclick="removeFromCart(${item.productId})">Remove</button>
                </div>
            `;
        });
        cartHtml += `</div>
            <div class="cart-total">Total: $${total.toFixed(2)}</div>
            <button class="btn" onclick="checkout()">Checkout</button>
        `;
    }

    modalContent.innerHTML = cartHtml;
    modal.style.display = 'block';
}

function hideCart() {
    console.log('Hiding cart...');
    document.getElementById('cart-modal').style.display = 'none';
}

function removeFromCart(productId) {
    console.log('Removing product from cart', productId);
    cart = cart.filter(item => item.productId !== productId);
    updateCartCount();
    showCart();
}

async function checkout() {
    console.log('Processing checkout...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/checkout`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ items: cart })
        });

        const result = await response.json();
        
        if (result.success) {
            cart = [];
            updateCartCount();
            hideCart();
            showSuccess('Order placed successfully!');
            await loadUserBalance(); // Refresh balance after successful order
        } else {
            console.error('Checkout failed:', result.message);
            showError(result.message || 'Checkout failed');
        }
    } catch (error) {
        console.error('Error processing checkout:', error);
        showError('Failed to process checkout');
    }
}

function showError(message) {
    console.log('Showing error message:', message);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    console.log('Showing success message:', message);
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// AAIO Payment Integration
async function topUpBalance() {
    console.log('Topping up balance...');
    const amount = prompt('Enter amount to top up:');
    if (!amount || isNaN(amount) || amount <= 0) {
        console.error('Invalid amount:', amount);
        showError('Please enter a valid amount');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/topup`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ amount: parseFloat(amount) })
        });

        const result = await response.json();
        
        if (result.success && result.paymentUrl) {
            console.log('Redirecting to payment URL:', result.paymentUrl);
            window.location.href = result.paymentUrl;
        } else {
            console.error('Failed to initiate top up:', result.message);
            showError(result.message || 'Failed to initiate top up');
        }
    } catch (error) {
        console.error('Error processing top up request:', error);
        showError('Failed to process top up request');
    }
}
