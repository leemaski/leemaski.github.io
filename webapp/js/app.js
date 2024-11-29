let tg = window.Telegram.WebApp;
tg.expand();

// Initialize variables
let currentCategory = null;
let userBalance = 0;
const API_BASE_URL = window.location.origin;

// Test data for local development
const TEST_DATA = {
    balance: 1000,
    categories: [
        { id: 1, name: 'Games ', },
        { id: 2, name: 'Software ' },
        { id: 3, name: 'Design ' },
        { id: 4, name: 'Music ' }
    ],
    products: {
        1: [
            { id: 1, name: 'Minecraft', price: 1500, quantity: 5 },
            { id: 2, name: 'GTA V', price: 2000, quantity: 3 },
            { id: 3, name: 'Cyberpunk 2077', price: 3000, quantity: 8 }
        ],
        2: [
            { id: 4, name: 'Windows 11 Pro', price: 8000, quantity: 10 },
            { id: 5, name: 'Adobe Photoshop', price: 3000, quantity: 15 },
            { id: 6, name: 'Microsoft Office', price: 5000, quantity: 7 }
        ],
        3: [
            { id: 7, name: 'UI Kit Bundle', price: 2000, quantity: 20 },
            { id: 8, name: 'Icon Pack Pro', price: 1000, quantity: 30 },
            { id: 9, name: '3D Models Pack', price: 4000, quantity: 5 }
        ],
        4: [
            { id: 10, name: 'FL Studio', price: 12000, quantity: 4 },
            { id: 11, name: 'Spotify Premium', price: 500, quantity: 100 },
            { id: 12, name: 'Sound Effects Pack', price: 1500, quantity: 25 }
        ]
    }
};

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
        // Get user ID safely
        const userId = tg.initDataUnsafe?.user?.id || 'test_user';

        // Try to fetch from server
        let data = TEST_DATA;
        try {
            const response = await fetch(`${API_BASE_URL}/api/init`, {
                ...fetchOptions,
                method: 'POST',
                body: JSON.stringify({
                    user_id: userId
                })
            });

            if (response.ok) {
                data = await response.json();
            }
        } catch (error) {
            console.log('Using test data due to server connection error');
        }
        
        userBalance = data.balance;
        balanceElement.textContent = userBalance;
        
        renderCategories(data.categories);
        if (data.categories.length > 0) {
            loadProducts(data.categories[0].id);
        }
    } catch (error) {
        console.error('Initialization failed:', error);
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
        // Try to fetch from server
        let products = TEST_DATA.products[categoryId];
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${categoryId}`, {
                ...fetchOptions,
                method: 'GET'
            });

            if (response.ok) {
                const serverProducts = await response.json();
                if (serverProducts && serverProducts.length > 0) {
                    products = serverProducts;
                }
            }
        } catch (error) {
            console.log('Using test products due to server connection error');
        }
        
        renderProducts(products);
    } catch (error) {
        console.error('Failed to load products:', error);
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
        const userId = tg.initDataUnsafe?.user?.id || 'test_user';
        
        // Simulate purchase for test mode
        if (!tg.initDataUnsafe?.user?.id) {
            userBalance -= 100; // Simulate price deduction
            balanceElement.textContent = userBalance;
            alert('Test purchase successful!');
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/buy`, {
            ...fetchOptions,
            method: 'POST',
            body: JSON.stringify({
                user_id: userId,
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
        if (tg.initDataUnsafe?.user?.id) {
            tg.showAlert('Purchase failed. Please try again.');
        } else {
            alert('Purchase failed. Please try again.');
        }
    }
}

// Top up balance
async function initiatePayment(method) {
    const amount = parseFloat(amountInput.value);
    if (!amount || amount <= 0) {
        if (tg.initDataUnsafe?.user?.id) {
            tg.showAlert('Please enter a valid amount');
        } else {
            alert('Please enter a valid amount');
        }
        return;
    }
    
    // Simulate payment for test mode
    if (!tg.initDataUnsafe?.user?.id) {
        userBalance += amount;
        balanceElement.textContent = userBalance;
        topupModal.style.display = 'none';
        alert('Test payment successful!');
        return;
    }
    
    try {
        const userId = tg.initDataUnsafe?.user?.id;
        
        const response = await fetch(`${API_BASE_URL}/api/payment/create`, {
            ...fetchOptions,
            method: 'POST',
            body: JSON.stringify({
                user_id: userId,
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
