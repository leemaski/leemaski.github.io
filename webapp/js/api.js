class Api {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async getProducts() {
        const response = await fetch(`${this.baseUrl}/products`);
        return await response.json();
    }

    async getProduct(id) {
        const response = await fetch(`${this.baseUrl}/products/${id}`);
        return await response.json();
    }

    async addToCart(productId, quantity) {
        const response = await fetch(`${this.baseUrl}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: productId, quantity }),
        });
        return await response.json();
    }

    async getCart() {
        const response = await fetch(`${this.baseUrl}/cart`);
        return await response.json();
    }

    async removeFromCart(productId) {
        const response = await fetch(`${this.baseUrl}/cart/remove/${productId}`, {
            method: 'DELETE',
        });
        return await response.json();
    }
}

const api = new Api(CONFIG.API_URL);
