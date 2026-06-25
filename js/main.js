// ===== DARK/LIGHT MODE TOGGLE =====
(function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    function updateIcon(theme) {
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.className = 'fas fa-sun';
                themeIcon.style.color = '#f59e0b';
            } else {
                themeIcon.className = 'fas fa-moon';
                themeIcon.style.color = 'white';
            }
        }
    }
    
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateIcon(theme);
    }
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        updateIcon('light');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            
            const msg = newTheme === 'dark' ? '🌙 Dark mode activated' : '☀️ Light mode activated';
            showNotification(msg);
        });
    }
})();

// ===== NOTIFICATION FUNCTION =====
function showNotification(message) {
    const notification = document.createElement('div');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    notification.style.cssText = `
        position: fixed; 
        bottom: 20px; 
        right: 20px; 
        background: ${isDark ? '#1e293b' : '#0b1a33'}; 
        color: white; 
        padding: 12px 20px; 
        border-radius: 10px; 
        z-index: 9999; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => notification.remove(), 300);
        }
    }, 2000);
}

// ===== CART FUNCTIONS =====
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = totalItems;
    }
    renderCartDropdown();
}

function renderCartDropdown() {
    const cart = getCart();
    const body = document.getElementById('cartDropdownBody');
    const footer = document.getElementById('cartDropdownFooter');
    const totalSpan = document.getElementById('cartDropdownTotal');
    
    if (!body) return;
    
    if (cart.length === 0) {
        body.innerHTML = `
            <div class="cart-empty-msg">
                <i class="fas fa-shopping-bag"></i>
                <p>Your cart is empty</p>
                <small>Start adding some books!</small>
            </div>
        `;
        if (footer) footer.style.display = 'none';
        return;
    }

    if (footer) footer.style.display = 'block';
    
    let html = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="dropdown-item-cart">
                <img src="${item.image || 'https://via.placeholder.com/45x60/0b1a33/ffffff?text=Book'}" alt="${item.title}">
                <div class="cart-item-info">
                    <h6>${item.title}</h6>
                    <small>Qty: ${item.quantity}</small>
                    <div class="item-price">KSH ${(item.price * item.quantity).toLocaleString()}</div>
                </div>
                <div style="display:flex;gap:4px;flex-direction:column;">
                    <button onclick="updateQuantity(${index}, 1)" style="background:#2563eb;color:white;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;">+</button>
                    <button onclick="updateQuantity(${index}, -1)" style="background:#ef4444;color:white;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;">-</button>
                    <button onclick="removeFromCart(${index})" style="background:#dc3545;color:white;border:none;border-radius:4px;font-size:0.6rem;padding:2px 4px;cursor:pointer;">✕</button>
                </div>
            </div>
        `;
    });
    
    body.innerHTML = html;
    if (totalSpan) totalSpan.textContent = `KSH ${total.toLocaleString()}`;
}

function updateQuantity(index, change) {
    let cart = getCart();
    if (!cart[index]) return;
    
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    saveCart(cart);
    renderCartDropdown();
}

function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCartDropdown();
}

function addToCart(book) {
    let cart = getCart();
    const existing = cart.find(item => item.id === book.id);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: book.id,
            title: book.title,
            price: book.price,
            quantity: 1,
            image: book.image
        });
    }
    
    saveCart(cart);
    showNotification(`✅ "${book.title}" added to cart!`);
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
    
    // Update cart when dropdown is shown
    const container = document.getElementById('cartDropdownContainer');
    if (container) {
        container.addEventListener('shown.bs.dropdown', function() {
            renderCartDropdown();
        });
    }
});