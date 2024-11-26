document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });

    // Cart functionality
    const cartCount = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    let itemsInCart = 0;

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            itemsInCart++;
            cartCount.textContent = itemsInCart;
            
            // Animation effect
            button.textContent = 'Added!';
            button.style.backgroundColor = '#27ae60';
            
            setTimeout(() => {
                button.textContent = 'Add to Cart';
                button.style.backgroundColor = '#3498db';
            }, 1000);
        });
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu after clicking a link
                navLinks.classList.remove('active');
            }
        });
    });
});
