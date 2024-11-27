let tg = window.Telegram.WebApp;
tg.expand();

// Sample products data (in a real app, this would come from a backend)
const products = [
    {
        id: 1,
        name: "Laptop",
        price: 999.99,
        image: "https://via.placeholder.com/200x150",
        description: "High-performance laptop"
    },
    {
        id: 2,
        name: "Smartphone",
        price: 499.99,
        image: "https://via.placeholder.com/200x150",
        description: "Latest smartphone"
    },
    {
        id: 3,
        name: "Headphones",
        price: 99.99,
        image: "https://via.placeholder.com/200x150",
        description: "Wireless headphones"
    }
];

let cart = [];

// Initialize the store
function initStore() {
    const productsContainer = document.getElementById('products');
    products.forEach(product => {
        const productElement = createProductElement(product);
        productsContainer.appendChild(productElement);
    });
}

// Create product card element
function createProductElement(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <button class="primary-btn" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `;
    return div;
}

// Cart functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartUI();
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const totalAmount = document.getElementById('total-amount');
    
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = itemCount;
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = `$${total.toFixed(2)}`;
}

// Toggle cart panel
document.getElementById('cart-icon').addEventListener('click', () => {
    const cartPanel = document.getElementById('cart-panel');
    cartPanel.classList.toggle('visible');
});

// Checkout handler
document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const orderData = {
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    tg.sendData(JSON.stringify(orderData));
    tg.close();
});

// Initialize the store when the page loads
document.addEventListener('DOMContentLoaded', initStore);
