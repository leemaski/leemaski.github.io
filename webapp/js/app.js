let tg = window.Telegram.WebApp;
tg.expand();

// Initialize variables
let currentCategory = null;
let userBalance = 0;
const API_BASE_URL = 'http://localhost:8080';

// DOM Elements
const categoriesContainer = document.getElementById('categories');
const productsContainer = document.getElementById('products');
const balanceElement = document.getElementById('userBalance');
const topupButton = document.getElementById('topupButton');
const topupModal = document.getElementById('topupModal');
const closeModal = document.querySelector('.close');
const paymentButtons = document.querySelectorAll('.payment-button');
const amountInput = document.getElementById('amount');

// Common fetch options
const fetchOptions = {
    mode: 'cors',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
};

// Load initial data
async function initialize() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/init`, {
            ...fetchOptions,
            method: 'POST',
            body: JSON.stringify({
                user_id: tg.initDataUnsafe.user.id
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        userBalance = data.balance;
        balanceElement.textContent = userBalance;
        
        renderCategories(data.categories);
        if (data.categories.length > 0) {
            loadProducts(data.categories[0].id);
        }
    } catch (error) {
        console.error('Initialization failed:', error);
        tg.showAlert('Failed to connect to the server. Please try again later.');
    }
}

// Render categories
function renderCategories(categories) {
    categoriesContainer.innerHTML = '';
    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item';
        categoryElement.textContent = category.name;
        categoryElement.dataset.id = category.id;
        
        categoryElement.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
            categoryElement.classList.add('active');
            loadProducts(category.id);
        });
        
        categoriesContainer.appendChild(categoryElement);
    });
    
    // Activate first category
    if (categories.length > 0) {
        categoriesContainer.firstChild.classList.add('active');
    }
}

// Load products for category
async function loadProducts(categoryId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${categoryId}`, {
            ...fetchOptions,
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Failed to load products:', error);
        tg.showAlert('Failed to load products. Please try again.');
    }
}

// Render products
function renderProducts(products) {
    productsContainer.innerHTML = '';
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.price} ₽</div>
            <div class="product-quantity">Available: ${product.quantity}</div>
            <button class="button" onclick="buyProduct(${product.id})">Buy</button>
        `;
        productsContainer.appendChild(productElement);
    });
}

// Buy product
async function buyProduct(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/buy`, {
            ...fetchOptions,
            method: 'POST',
            body: JSON.stringify({
                user_id: tg.initDataUnsafe.user.id,
                product_id: productId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            userBalance = result.new_balance;
            balanceElement.textContent = userBalance;
            
            // Refresh products in current category
            const activeCategory = document.querySelector('.category-item.active');
            if (activeCategory) {
                loadProducts(activeCategory.dataset.id);
            }
            
            tg.showAlert('Purchase successful! Check the bot chat for your item.');
        } else {
            tg.showAlert(result.error || 'Purchase failed. Please try again.');
        }
    } catch (error) {
        console.error('Purchase failed:', error);
        tg.showAlert('Purchase failed. Please try again.');
    }
}

// Top up balance
async function initiatePayment(method) {
    const amount = parseFloat(amountInput.value);
    if (!amount || amount <= 0) {
        tg.showAlert('Please enter a valid amount');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/payment/create`, {
            ...fetchOptions,
            method: 'POST',
            body: JSON.stringify({
                user_id: tg.initDataUnsafe.user.id,
                amount: amount,
                method: method
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            window.open(result.payment_url, '_blank');
            topupModal.style.display = 'none';
        } else {
            tg.showAlert(result.error || 'Failed to create payment. Please try again.');
        }
    } catch (error) {
        console.error('Payment creation failed:', error);
        tg.showAlert('Failed to create payment. Please try again.');
    }
}

// Event Listeners
topupButton.addEventListener('click', () => {
    topupModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    topupModal.style.display = 'none';
});

paymentButtons.forEach(button => {
    button.addEventListener('click', () => {
        initiatePayment(button.dataset.method);
    });
});

window.addEventListener('click', (event) => {
    if (event.target === topupModal) {
        topupModal.style.display = 'none';
    }
});

// Initialize the app
initialize();
