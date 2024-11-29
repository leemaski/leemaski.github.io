// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Текущая страница
let currentPage = 'catalog';

// Рендер продуктов
async function renderProducts() {
    const container = document.getElementById('products-container');
    try {
        const products = await api.getProducts();
        container.innerHTML = `
            <div class="products-grid">
                ${products.map(product => `
                    <div class="product-card">
                        <img src="${product.image_url}" alt="${product.name}" class="product-image">
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p class="price">${product.price} ₽</p>
                            <button class="button" onclick="showProduct(${product.id})">Подробнее</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<p class="error">Ошибка загрузки товаров</p>';
    }
}

// Показать детали продукта
async function showProduct(id) {
    const container = document.getElementById('products-container');
    try {
        const product = await api.getProduct(id);
        container.innerHTML = `
            <div class="product-detail">
                <img src="${product.image_url}" alt="${product.name}" class="product-image-large">
                <div class="product-info-detail">
                    <h2>${product.name}</h2>
                    <p class="description">${product.description}</p>
                    <p class="price-large">${product.price} ₽</p>
                    <div class="quantity-selector">
                        <button class="quantity-btn minus">-</button>
                        <input type="number" value="1" min="1" max="99" id="quantity">
                        <button class="quantity-btn plus">+</button>
                    </div>
                    <button class="button button-primary" onclick="addToCart(${product.id})">
                        Добавить в корзину
                    </button>
                </div>
            </div>
        `;
        
        // Добавляем обработчики кнопок количества
        setupQuantityButtons();
    } catch (error) {
        container.innerHTML = '<p class="error">Ошибка загрузки товара</p>';
    }
}

// Показать корзину
async function showCart() {
    const container = document.getElementById('products-container');
    try {
        const cart = await api.getCart();
        if (cart.items && cart.items.length > 0) {
            container.innerHTML = `
                <div class="cart-container">
                    <div class="cart-items">
                        ${cart.items.map(item => `
                            <div class="cart-item" data-id="${item.product.id}">
                                <img src="${item.product.image_url}" alt="${item.product.name}" class="cart-item-image">
                                <div class="cart-item-info">
                                    <h3>${item.product.name}</h3>
                                    <p class="price">${item.product.price} ₽</p>
                                    <div class="quantity-selector">
                                        <button class="quantity-btn minus">-</button>
                                        <input type="number" value="${item.quantity}" min="1" max="99">
                                        <button class="quantity-btn plus">+</button>
                                    </div>
                                </div>
                                <button class="remove-item" onclick="removeFromCart(${item.product.id})">×</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="cart-summary">
                        <div class="total">
                            <span>Итого:</span>
                            <span class="total-price">${cart.total} ₽</span>
                        </div>
                        <button class="button button-primary checkout-btn" onclick="checkout()">
                            Оформить заказ
                        </button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-cart">
                    <p>Ваша корзина пуста</p>
                    <button class="button" onclick="showCatalog()">Перейти к покупкам</button>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = '<p class="error">Ошибка загрузки корзины</p>';
    }
}

// Добавление в корзину
async function addToCart(productId) {
    const quantity = parseInt(document.getElementById('quantity').value);
    try {
        await api.addToCart(productId, quantity);
        tg.showPopup({
            title: 'Успех',
            message: 'Товар добавлен в корзину',
            buttons: [{type: 'ok'}]
        });
    } catch (error) {
        tg.showPopup({
            title: 'Ошибка',
            message: 'Не удалось добавить товар в корзину',
            buttons: [{type: 'ok'}]
        });
    }
}

// Удаление из корзины
async function removeFromCart(productId) {
    try {
        await api.removeFromCart(productId);
        showCart(); // Обновляем корзину
    } catch (error) {
        tg.showPopup({
            title: 'Ошибка',
            message: 'Не удалось удалить товар из корзины',
            buttons: [{type: 'ok'}]
        });
    }
}

// Оформление заказа
function checkout() {
    tg.showPopup({
        title: 'Оформление заказа',
        message: 'Заказ успешно оформлен!',
        buttons: [{type: 'ok'}]
    });
}

// Настройка кнопок количества
function setupQuantityButtons() {
    document.querySelectorAll('.quantity-selector').forEach(selector => {
        const input = selector.querySelector('input');
        const minusBtn = selector.querySelector('.minus');
        const plusBtn = selector.querySelector('.plus');

        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(input.value);
            if (currentValue > 1) {
                input.value = currentValue - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(input.value);
            if (currentValue < 99) {
                input.value = currentValue + 1;
            }
        });
    });
}

// Навигация
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        if (page === 'catalog') {
            renderProducts();
        } else if (page === 'cart') {
            showCart();
        }
        currentPage = page;
    });
});

// Инициализация
renderProducts();
