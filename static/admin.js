const tg = window.Telegram.WebApp;
tg.expand();

// Load and display products
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'item-card';
            productCard.innerHTML = `
                <div class="header">
                    <div class="title">${product.name}</div>
                    <div class="actions">
                        <button class="btn-secondary" onclick="editProduct(${product.id})">Edit</button>
                        <button class="btn-secondary" onclick="deleteProduct(${product.id})">Delete</button>
                    </div>
                </div>
                <div class="details">
                    <div>Price: $${product.price}</div>
                    <div>Stock: ${product.stock}</div>
                    <div>Description: ${product.description}</div>
                </div>
            `;
            productsList.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        tg.showAlert('Error loading products');
    }
}

// Load and display categories
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        const categoriesList = document.getElementById('categoriesList');
        const categorySelect = document.getElementById('productCategory');
        
        categoriesList.innerHTML = '';
        categorySelect.innerHTML = '';
        
        categories.forEach(category => {
            // Add to categories list
            const categoryCard = document.createElement('div');
            categoryCard.className = 'item-card';
            categoryCard.innerHTML = `
                <div class="header">
                    <div class="title">${category.name}</div>
                    <div class="actions">
                        <button class="btn-secondary" onclick="editCategory(${category.id})">Edit</button>
                        <button class="btn-secondary" onclick="deleteCategory(${category.id})">Delete</button>
                    </div>
                </div>
            `;
            categoriesList.appendChild(categoryCard);
            
            // Add to product category select
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        tg.showAlert('Error loading categories');
    }
}

// Load and display users
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        const users = await response.json();
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';
        
        users.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'item-card';
            userCard.innerHTML = `
                <div class="header">
                    <div class="title">
                        ID: ${user.telegram_id}
                        ${user.is_admin ? '<span class="admin-badge">Admin</span>' : ''}
                        <span class="user-status ${user.is_blocked ? 'blocked' : 'active'}">
                            ${user.is_blocked ? 'Blocked' : 'Active'}
                        </span>
                    </div>
                    <div class="actions">
                        <button class="btn-secondary" onclick="toggleUserBlock(${user.telegram_id}, ${!user.is_blocked})">
                            ${user.is_blocked ? 'Unblock' : 'Block'}
                        </button>
                    </div>
                </div>
                <div class="details">
                    <div>Balance: $${user.balance.toFixed(2)}</div>
                </div>
            `;
            usersList.appendChild(userCard);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        tg.showAlert('Error loading users');
    }
}

// Modal handling
const productModal = document.getElementById('productModal');
const categoryModal = document.getElementById('categoryModal');
const closeButtons = document.querySelectorAll('.close-modal');

document.getElementById('addProductBtn').onclick = () => {
    productModal.style.display = 'block';
};

document.getElementById('addCategoryBtn').onclick = () => {
    categoryModal.style.display = 'block';
};

closeButtons.forEach(button => {
    button.onclick = () => {
        productModal.style.display = 'none';
        categoryModal.style.display = 'none';
    };
});

// User management
async function toggleUserBlock(userId, blockStatus) {
    try {
        const response = await fetch('/api/admin/block_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId
            })
        });
        
        if (response.ok) {
            loadUsers();
            tg.showAlert(`User ${blockStatus ? 'blocked' : 'unblocked'} successfully`);
        } else {
            tg.showAlert('Error updating user status');
        }
    } catch (error) {
        console.error('Error toggling user block status:', error);
        tg.showAlert('Error updating user status');
    }
}

// Initialize
loadProducts();
loadCategories();
loadUsers();
