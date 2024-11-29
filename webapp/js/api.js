class Api {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async getProducts() {
        try {
            const response = await fetch(`${this.baseUrl}/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    async getProduct(id) {
        try {
            const response = await fetch(`${this.baseUrl}/products/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }

    async addToCart(productId, quantity) {
        try {
            const response = await fetch(`${this.baseUrl}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_id: productId, quantity }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    }

    async getCart() {
        try {
            const response = await fetch(`${this.baseUrl}/cart`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching cart:', error);
            throw error;
        }
    }

    async removeFromCart(productId) {
        try {
            const response = await fetch(`${this.baseUrl}/cart/remove/${productId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    }
}

const api = new Api(CONFIG.API_URL);
