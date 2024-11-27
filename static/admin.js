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
            productCard.className = 'product-card admin-card';
            productCard.innerHTML = `
                <div class="product-info">
                    <div class="product-title">${product.name}</div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-stock">Stock: ${product.stock}</div>
                </div>
                <div class="admin-actions">
                    <button class="btn-secondary" onclick="editProduct(${JSON.stringify(product)})">Edit</button>
                    <button class="btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
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
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        
        categories.forEach(category => {
            // Add to categories list
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card admin-card';
            categoryCard.innerHTML = `
                <div class="category-info">
                    <div class="category-name">${category.name}</div>
                </div>
                <div class="admin-actions">
                    <button class="btn-secondary" onclick="editCategory(${JSON.stringify(category)})">Edit</button>
                    <button class="btn-danger" onclick="deleteCategory(${category.id})">Delete</button>
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
            userCard.className = 'user-card admin-card';
            userCard.innerHTML = `
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-id">ID: ${user.id}</div>
                </div>
                <div class="admin-actions">
                    <button class="btn-${user.is_blocked ? 'secondary' : 'danger'}" 
                            onclick="toggleUserBlock(${user.id}, ${!user.is_blocked})">
                        ${user.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                </div>
            `;
            usersList.appendChild(userCard);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        tg.showAlert('Error loading users');
    }
}

// Product management
let currentProductId = null;
const productModal = document.getElementById('productModal');
const addProductBtn = document.getElementById('addProductBtn');

addProductBtn.onclick = () => {
    currentProductId = null;
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('productCategory').value = '';
    productModal.style.display = 'block';
};

function editProduct(product) {
    currentProductId = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productCategory').value = product.category_id;
    productModal.style.display = 'block';
}

document.getElementById('saveProduct').onclick = async () => {
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        category_id: parseInt(document.getElementById('productCategory').value)
    };
    
    try {
        const response = await fetch('/api/products' + (currentProductId ? `/${currentProductId}` : ''), {
            method: currentProductId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            productModal.style.display = 'none';
            loadProducts();
            tg.showAlert(currentProductId ? 'Product updated!' : 'Product added!');
        } else {
            const error = await response.json();
            tg.showAlert('Error: ' + error.detail);
        }
    } catch (error) {
        console.error('Error saving product:', error);
        tg.showAlert('Error saving product');
    }
};

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadProducts();
            tg.showAlert('Product deleted!');
        } else {
            const error = await response.json();
            tg.showAlert('Error: ' + error.detail);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        tg.showAlert('Error deleting product');
    }
}

// Category management
let currentCategoryId = null;
const categoryModal = document.getElementById('categoryModal');
const addCategoryBtn = document.getElementById('addCategoryBtn');

addCategoryBtn.onclick = () => {
    currentCategoryId = null;
    document.getElementById('categoryName').value = '';
    categoryModal.style.display = 'block';
};

function editCategory(category) {
    currentCategoryId = category.id;
    document.getElementById('categoryName').value = category.name;
    categoryModal.style.display = 'block';
}

document.getElementById('saveCategory').onclick = async () => {
    const categoryData = {
        name: document.getElementById('categoryName').value
    };
    
    try {
        const response = await fetch('/api/categories' + (currentCategoryId ? `/${currentCategoryId}` : ''), {
            method: currentCategoryId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
        });
        
        if (response.ok) {
            categoryModal.style.display = 'none';
            loadCategories();
            tg.showAlert(currentCategoryId ? 'Category updated!' : 'Category added!');
        } else {
            const error = await response.json();
            tg.showAlert('Error: ' + error.detail);
        }
    } catch (error) {
        console.error('Error saving category:', error);
        tg.showAlert('Error saving category');
    }
};

async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
        const response = await fetch(`/api/categories/${categoryId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadCategories();
            tg.showAlert('Category deleted!');
        } else {
            const error = await response.json();
            tg.showAlert('Error: ' + error.detail);
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        tg.showAlert('Error deleting category');
    }
}

// User management
async function toggleUserBlock(userId, blockStatus) {
    try {
        const response = await fetch('/api/admin/block_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                block_status: blockStatus
            })
        });
        
        if (response.ok) {
            loadUsers();
            tg.showAlert(`User ${blockStatus ? 'blocked' : 'unblocked'}!`);
        } else {
            const error = await response.json();
            tg.showAlert('Error: ' + error.detail);
        }
    } catch (error) {
        console.error('Error toggling user block:', error);
        tg.showAlert('Error updating user status');
    }
}

// Modal close buttons
document.querySelectorAll('.close-modal').forEach(button => {
    button.onclick = () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    };
});

// Initialize
loadProducts();
loadCategories();
loadUsers();
