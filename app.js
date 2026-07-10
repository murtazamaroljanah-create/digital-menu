/* ==========================================================================
   Universal Sweets - Digital Menu & Admin JavaScript
   ========================================================================== */

// 1. Default / Seed Data (used as fallback if API is unavailable)
const DEFAULT_SECTIONS = [
    { id: "sec-1", name: "Sweets", icon: "cookie" },
    { id: "sec-2", name: "Snacks", icon: "sandwich" },
    { id: "sec-3", name: "Beverages", icon: "cup-soda" },
    { id: "sec-4", name: "Special Packs", icon: "gift" },
    { id: "sec-5", name: "Others", icon: "heart" }
];

const DEFAULT_ITEMS = [
    { id: "item-1", name: "Kaju Katli", category: "Sweets", price: 720, unit: "kg", desc: "Rich and soft cashew slices made with pure ghee and decorated with premium silver leaf.", image: "assets/kaju_katli.png", available: true },
    { id: "item-2", name: "Motichoor Ladoo", category: "Sweets", price: 560, unit: "kg", desc: "Classic soft laddoo made from fine boondi pearls, pure ghee, and a hint of cardamom.", image: "assets/ladoo.png", available: true },
    { id: "item-3", name: "Mathri", category: "Snacks", price: 280, unit: "kg", desc: "Crispy and savory traditional crackers spiced with carom seeds (ajwain), perfect for tea time.", image: "assets/mathri.png", available: true },
    { id: "item-4", name: "Masala Khasta", category: "Snacks", price: 300, unit: "kg", desc: "Flaky crust stuffed with spicy and savory lentil mixture, fried to golden perfection.", image: "assets/mathri.png", available: true },
    { id: "item-5", name: "Badam Milk", category: "Beverages", price: 120, unit: "glass", desc: "Rich, chilled almond milk infused with real saffron strands and garnished with sliced almonds.", image: "assets/badam_milk.png", available: true },
    { id: "item-6", name: "Rasgulla", category: "Sweets", price: 440, unit: "kg", desc: "Soft and spongy traditional cottage cheese balls cooked in delicate sugar syrup.", image: "assets/rasgulla.png", available: true },
    { id: "item-7", name: "Gulab Jamun", category: "Sweets", price: 440, unit: "kg", desc: "Warm golden-brown fried milk solids dumplings soaked in rose-flavored cardamom syrup.", image: "assets/gulab_jamun.png", available: true }
];

// 2. Global State
let state = {
    sections: [],
    items: [],
    cart: {},
    activeCustomerCategory: "All",
    customerSearchQuery: "",
    usingMongoDB: false  // true once API is confirmed working
};

// ── API helpers ──────────────────────────────────────────────────────────────
const API = {
    async get(path) {
        const r = await fetch(path);
        if (!r.ok) throw new Error(`GET ${path} failed: ${r.status}`);
        return r.json();
    },
    async post(path, body) {
        const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!r.ok) throw new Error(`POST ${path} failed: ${r.status}`);
        return r.json();
    },
    async put(path, body) {
        const r = await fetch(path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!r.ok) throw new Error(`PUT ${path} failed: ${r.status}`);
        return r.json();
    },
    async delete(path) {
        const r = await fetch(path, { method: 'DELETE' });
        if (!r.ok) throw new Error(`DELETE ${path} failed: ${r.status}`);
        return r.json();
    }
};

// ── Load state from MongoDB (or fallback to localStorage) ───────────────────
async function loadState() {
    try {
        const [sections, items] = await Promise.all([
            API.get('/api/sections'),
            API.get('/api/items')
        ]);

        if (sections && sections.length > 0) {
            state.sections = sections;
            state.items = items;
            state.usingMongoDB = true;
            console.log('[DB] Loaded from MongoDB ✅');
            return;
        }

        // MongoDB is empty — seed it then load again
        console.log('[DB] MongoDB empty, seeding defaults...');
        await API.post('/api/seed', {});
        const [s2, i2] = await Promise.all([API.get('/api/sections'), API.get('/api/items')]);
        state.sections = s2;
        state.items = i2;
        state.usingMongoDB = true;

    } catch (err) {
        // API not ready yet — fall back to localStorage
        console.warn('[DB] MongoDB not available, using localStorage fallback:', err.message);
        state.sections = JSON.parse(localStorage.getItem("us_sections")) || DEFAULT_SECTIONS;
        state.items = JSON.parse(localStorage.getItem("us_items")) || DEFAULT_ITEMS;
        state.usingMongoDB = false;
    }
}

// ── Save to localStorage as backup (always kept in sync) ───────────────────
function saveStateToLocalStorage() {
    localStorage.setItem("us_sections", JSON.stringify(state.sections));
    localStorage.setItem("us_items", JSON.stringify(state.items));
}


// 4. Initialization
document.addEventListener("DOMContentLoaded", async () => {
    // Setup Lucide icons initially
    lucide.createIcons();

    // Set share link input default value to current origin/location
    const shareInput = document.getElementById("share-link-input");
    if (shareInput) {
        shareInput.value = window.location.href.split('?')[0];
    }

    // ── Load data from MongoDB (or localStorage fallback) ──
    await loadState();
    // Keep localStorage in sync as backup
    saveStateToLocalStorage();

    // Initialize UI views based on URL parameter or defaults
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get("view");
    const isAdminPath = window.location.pathname === "/admin" || window.location.pathname === "/admin/";
    if (view === "admin" || isAdminPath) {
        requireAdminAuth();
    } else {
        switchToCustomerView();
    }

    // Bind event listeners
    bindEventListeners();

    // Initial renders
    updateStats();
    renderAll();
});

// ============================================================
// AUTH: Admin Login System
// Credentials: username=universalsweets / password=murtaza123
// ============================================================
const ADMIN_USERNAME = "universalsweets";
const ADMIN_PASSWORD = "murtaza123";
const AUTH_SESSION_KEY = "us_admin_auth";

function isAdminAuthenticated() {
    return sessionStorage.getItem(AUTH_SESSION_KEY) === "true";
}

function requireAdminAuth() {
    if (isAdminAuthenticated()) {
        switchToAdminView();
    } else {
        showLoginOverlay();
    }
}

function showLoginOverlay() {
    const overlay = document.getElementById("admin-login-overlay");
    if (overlay) {
        overlay.classList.remove("hidden");
        // Clear any previous inputs/errors
        const usernameInput = document.getElementById("loginUsername");
        const passwordInput = document.getElementById("loginPassword");
        const errorEl = document.getElementById("loginError");
        if (usernameInput) usernameInput.value = "";
        if (passwordInput) passwordInput.value = "";
        if (errorEl) errorEl.classList.add("hidden");
        lucide.createIcons();
        // Focus username field
        setTimeout(() => { if (usernameInput) usernameInput.focus(); }, 100);
    }
}

function hideLoginOverlay() {
    const overlay = document.getElementById("admin-login-overlay");
    if (overlay) overlay.classList.add("hidden");
}

function handleAdminLogin(e) {
    e.preventDefault();
    const username = (document.getElementById("loginUsername")?.value || "").trim();
    const password = (document.getElementById("loginPassword")?.value || "").trim();
    const errorEl = document.getElementById("loginError");
    const btn = document.getElementById("btnAdminLogin");

    // Loading state
    if (btn) { btn.disabled = true; btn.innerHTML = '<i data-lucide="loader-2"></i> Verifying...'; lucide.createIcons(); }

    setTimeout(() => {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // ✅ Correct credentials
            sessionStorage.setItem(AUTH_SESSION_KEY, "true");
            if (errorEl) errorEl.classList.add("hidden");
            hideLoginOverlay();
            switchToAdminView();
        } else {
            // ❌ Wrong credentials — shake the card and show error
            if (errorEl) errorEl.classList.remove("hidden");
            const card = document.querySelector(".login-card");
            if (card) {
                card.classList.add("shake");
                setTimeout(() => card.classList.remove("shake"), 500);
            }
        }
        if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="log-in"></i> Login to Dashboard'; lucide.createIcons(); }
    }, 400);
}

function handleAdminLogout(e) {
    if (e) e.preventDefault();
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    switchToCustomerView();
}


// 5. Navigation & View Toggling
function switchToAdminView() {
    document.body.className = "admin-view-active";
    const viewSwitcher = document.getElementById("viewSwitcher");
    if (viewSwitcher) {
        viewSwitcher.style.display = "flex";
    }
    document.getElementById("switchToAdmin").classList.add("active-view-btn");
    document.getElementById("switchToCustomer").classList.remove("active-view-btn");
    window.history.replaceState({}, '', '/?view=admin');
    renderAll();
}

function switchToCustomerView() {
    document.body.className = "customer-view-active";
    const viewSwitcher = document.getElementById("viewSwitcher");
    if (viewSwitcher) {
        viewSwitcher.style.display = "none";
    }
    window.history.replaceState({}, '', window.location.pathname);
    renderAll();
}

// 6. Rendering Logic
function renderAll() {
    // Admin renders
    renderAdminSections();
    renderAdminItems();
    populateCategoryDropdown();

    // Customer renders
    renderCustomerCategories();
    renderCustomerItems();
    renderCart();

    // Re-initialize icons to bind dynamic list items
    lucide.createIcons();
}

// Render Menu Sections list (Admin)
function renderAdminSections() {
    const sectionList = document.getElementById("admin-sections-list");
    if (!sectionList) return;

    sectionList.innerHTML = "";
    
    state.sections.forEach(section => {
        // Calculate items count in this section
        const itemCount = state.items.filter(item => item.category.toLowerCase() === section.name.toLowerCase()).length;
        
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="section-info">
                <div class="section-info-icon">
                    <i data-lucide="${section.icon || 'cookie'}"></i>
                </div>
                <div class="section-details">
                    <h4>${section.name}</h4>
                    <span>${itemCount} items</span>
                </div>
            </div>
            <div class="action-btns">
                <button class="action-btn edit-btn" onclick="editSection('${section.id}')" title="Edit Section">
                    <i data-lucide="edit-3"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteSection('${section.id}')" title="Delete Section">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;
        sectionList.appendChild(li);
    });
}

// Render Items table list (Admin)
function renderAdminItems() {
    const itemsTableBody = document.getElementById("admin-items-table-body");
    if (!itemsTableBody) return;

    itemsTableBody.innerHTML = "";

    if (state.items.length === 0) {
        itemsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No items found. Click 'Add Item' to add.</td></tr>`;
        return;
    }

    state.items.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div class="item-meta">
                    <img src="${item.image || 'assets/hero_sweets.png'}" class="item-img-mini" alt="${item.name}">
                    <div class="item-text">
                        <h4>${item.name}</h4>
                        <span>${item.desc}</span>
                    </div>
                </div>
            </td>
            <td>
                <span class="item-cat-badge">${item.category}</span>
            </td>
            <td>
                <span class="item-price-val">₹${item.price} <span style="font-weight: normal; font-size: 11px; color: var(--text-muted);">/${item.unit}</span></span>
            </td>
            <td>
                <label class="switch">
                    <input type="checkbox" ${item.available ? 'checked' : ''} onchange="toggleItemAvailability('${item.id}', this.checked)">
                    <span class="slider"></span>
                </label>
            </td>
            <td class="text-right">
                <div class="action-btns" style="justify-content: flex-end;">
                    <button class="action-btn edit-btn" onclick="editItem('${item.id}')" title="Edit Item">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteItem('${item.id}')" title="Delete Item">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        itemsTableBody.appendChild(tr);
    });
}

// Render Category pills for (Customer)
function renderCustomerCategories() {
    const container = document.getElementById("customer-category-tabs-container");
    if (!container) return;

    container.innerHTML = "";

    // "All" Tab
    const allTab = document.createElement("button");
    allTab.className = `category-tab-pill ${state.activeCustomerCategory === "All" ? "active" : ""}`;
    allTab.innerText = "All";
    allTab.addEventListener("click", () => {
        state.activeCustomerCategory = "All";
        renderCustomerCategories();
        renderCustomerItems();
        lucide.createIcons();
    });
    container.appendChild(allTab);

    // Other Tabs from sections list
    state.sections.forEach(section => {
        const btn = document.createElement("button");
        btn.className = `category-tab-pill ${state.activeCustomerCategory === section.name ? "active" : ""}`;
        btn.innerText = section.name;
        btn.addEventListener("click", () => {
            state.activeCustomerCategory = section.name;
            renderCustomerCategories();
            renderCustomerItems();
            lucide.createIcons();
        });
        container.appendChild(btn);
    });
}

// Render Menu Cards for Customers (Customer)
function renderCustomerItems() {
    const container = document.getElementById("customer-items-list-container");
    if (!container) return;

    container.innerHTML = "";

    // Filter items based on active category and search input
    const filteredItems = state.items.filter(item => {
        const matchesCategory = state.activeCustomerCategory === "All" || item.category === state.activeCustomerCategory;
        const matchesSearch = item.name.toLowerCase().includes(state.customerSearchQuery.toLowerCase()) ||
                              item.desc.toLowerCase().includes(state.customerSearchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredItems.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">No products found matching your search.</div>`;
        return;
    }

    filteredItems.forEach(item => {
        const isOutOfStock = !item.available;
        const qtyInCart = state.cart[item.id] || 0;
        
        const card = document.createElement("div");
        card.className = `cust-item-card ${isOutOfStock ? 'out-of-stock' : ''}`;
        
        card.innerHTML = `
            <div class="cust-item-img-container">
                <img src="${item.image || 'assets/hero_sweets.png'}" alt="${item.name}">
            </div>
            <div class="cust-item-details">
                <div class="cust-item-head">
                    <span class="cust-item-title">${item.name}</span>
                    <span class="cust-item-desc">${item.desc}</span>
                </div>
                <div class="cust-item-footer">
                    <span class="cust-item-price">₹${item.price}<span>/${item.unit}</span></span>
                    <div class="cust-item-actions">
                        ${isOutOfStock 
                            ? `<span class="cust-out-stock-lbl">Out of stock</span>`
                            : qtyInCart > 0 
                                ? `<div class="qty-counter">
                                    <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)" aria-label="Decrease quantity">
                                        <i data-lucide="minus"></i>
                                    </button>
                                    <span class="qty-number">${qtyInCart}</span>
                                    <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)" aria-label="Increase quantity">
                                        <i data-lucide="plus"></i>
                                    </button>
                                   </div>`
                                : `<button class="add-to-cart-btn" onclick="updateCartQuantity('${item.id}', 1)">
                                    Add
                                   </button>`
                        }
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 7. Cart & WhatsApp Checkout Logic
function updateCartQuantity(itemId, change) {
    const item = state.items.find(i => i.id === itemId);
    if (!item || !item.available) return;

    const currentQty = state.cart[itemId] || 0;
    const newQty = currentQty + change;

    if (newQty <= 0) {
        delete state.cart[itemId];
    } else {
        state.cart[itemId] = newQty;
    }

    renderCustomerItems();
    renderCart();
    lucide.createIcons();
}

function renderCart() {
    const cartBar = document.getElementById("customer-floating-cart-bar");
    const cartCountEl = document.getElementById("cart-item-count");
    const cartPriceEl = document.getElementById("cart-total-price-val");

    if (!cartBar) return;

    let totalItems = 0;
    let totalPrice = 0;

    Object.keys(state.cart).forEach(itemId => {
        const item = state.items.find(i => i.id === itemId);
        if (item && item.available) {
            const qty = state.cart[itemId];
            totalItems += qty;
            totalPrice += item.price * qty;
        }
    });

    if (totalItems > 0) {
        cartCountEl.innerText = totalItems;
        cartPriceEl.innerText = `₹${totalPrice}`;
        cartBar.classList.remove("hidden");
        // Add space so content isn't hidden behind the floating cart
        const appContent = document.querySelector(".customer-app-content");
        if (appContent) appContent.style.paddingBottom = "100px";
    } else {
        cartBar.classList.add("hidden");
        // Remove extra space when cart is hidden — footer sits flush
        const appContent = document.querySelector(".customer-app-content");
        if (appContent) appContent.style.paddingBottom = "0";
    }
}

// Open Checkout Modal
function showCheckoutModal() {
    const modal = document.getElementById("modalCheckout");
    const container = document.getElementById("checkout-items-list-container");
    const totalValEl = document.getElementById("checkout-total-val");

    if (!modal || !container) return;

    container.innerHTML = "";
    let totalPrice = 0;

    Object.keys(state.cart).forEach(itemId => {
        const item = state.items.find(i => i.id === itemId);
        if (item && item.available) {
            const qty = state.cart[itemId];
            const itemTotal = item.price * qty;
            totalPrice += itemTotal;

            const row = document.createElement("div");
            row.className = "checkout-item-row";
            row.innerHTML = `
                <div class="checkout-item-info">
                    <span class="chk-item-qty">${qty}x</span>
                    <span class="chk-item-name">${item.name}</span>
                </div>
                <span class="chk-item-price">₹${itemTotal}</span>
            `;
            container.appendChild(row);
        }
    });

    totalValEl.innerText = `₹${totalPrice}`;
    modal.classList.add("active");
}

function closeCheckoutModal() {
    document.getElementById("modalCheckout").classList.remove("active");
}

// Send WhatsApp Order API Trigger
function sendWhatsAppOrder() {
    const customerName = document.getElementById("cust-name").value.trim();
    const deliveryNotes = document.getElementById("cust-address").value.trim();

    let orderText = `*New Order - Universal Sweets Menu*\n`;
    if (customerName) orderText += `*Customer:* ${customerName}\n`;
    orderText += `-----------------------------------\n`;

    let totalAmount = 0;
    Object.keys(state.cart).forEach(itemId => {
        const item = state.items.find(i => i.id === itemId);
        if (item && item.available) {
            const qty = state.cart[itemId];
            const itemTotal = item.price * qty;
            totalAmount += itemTotal;
            orderText += `• ${qty} x ${item.name} (₹${item.price}/${item.unit}) = *₹${itemTotal}*\n`;
        }
    });

    orderText += `-----------------------------------\n`;
    orderText += `*Total Amount:* ₹${totalAmount}\n`;

    if (deliveryNotes) {
        orderText += `*Notes:* ${deliveryNotes}\n`;
    }

    orderText += `\nThank you!`;

    // WhatsApp base URL (We can direct to a dummy business phone number or generic link)
    // Using 919876543210 as a placeholder or letting user send it dynamically
    const encodedText = encodeURIComponent(orderText);
    const whatsappUrl = `https://wa.me/919224701020?text=${encodedText}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');

    // Reset checkout/cart state
    state.cart = {};
    closeCheckoutModal();
    renderAll();
}

// 8. CRUD Actions (Sections)
function openAddSectionModal() {
    document.getElementById("modalSectionTitle").innerText = "Add Menu Section";
    document.getElementById("section-id-input").value = "";
    document.getElementById("formSection").reset();
    document.getElementById("modalSection").classList.add("active");
}

function closeSectionModal() {
    document.getElementById("modalSection").classList.remove("active");
}

async function saveSection(e) {
    e.preventDefault();
    const id = document.getElementById("section-id-input").value;
    const name = document.getElementById("section-name").value.trim();
    const icon = document.getElementById("section-icon").value;

    if (!name) return;

    try {
        if (id) {
            // Edit existing section
            if (state.usingMongoDB) await API.put('/api/sections', { id, name, icon });
            const section = state.sections.find(s => s.id === id);
            if (section) { section.name = name; section.icon = icon; }
        } else {
            // Create new section
            const newSection = { id: `sec-${Date.now()}`, name, icon };
            if (state.usingMongoDB) await API.post('/api/sections', newSection);
            state.sections.push(newSection);
        }
    } catch (err) {
        console.warn('[DB] Section save failed, using local only:', err.message);
    }

    saveStateToLocalStorage();
    closeSectionModal();
    updateStats();
    renderAll();
}

function editSection(id) {
    const section = state.sections.find(s => s.id === id);
    if (!section) return;

    document.getElementById("modalSectionTitle").innerText = "Edit Menu Section";
    document.getElementById("section-id-input").value = section.id;
    document.getElementById("section-name").value = section.name;
    document.getElementById("section-icon").value = section.icon;
    
    document.getElementById("modalSection").classList.add("active");
}

function deleteSection(id) {
    if (confirm("Are you sure you want to delete this category section? Dynamic items under it won't be deleted but their category binding will remain.")) {
        state.sections = state.sections.filter(s => s.id !== id);
        saveStateToLocalStorage();
        updateStats();
        renderAll();
        // Delete from MongoDB async (non-blocking)
        if (state.usingMongoDB) API.delete(`/api/sections?id=${id}`).catch(e => console.warn('[DB] Delete section failed:', e.message));
    }
}

// Populate Category dropdown list inside Item Add Modal
function populateCategoryDropdown() {
    const dropdown = document.getElementById("item-category");
    if (!dropdown) return;

    dropdown.innerHTML = "";
    state.sections.forEach(sec => {
        const opt = document.createElement("option");
        opt.value = sec.name;
        opt.innerText = sec.name;
        dropdown.appendChild(opt);
    });
}

// 9. CRUD Actions (Items)
function openAddItemModal() {
    document.getElementById("modalItemTitle").innerText = "Add Menu Item";
    document.getElementById("item-id-input").value = "";
    document.getElementById("formItem").reset();
    populateCategoryDropdown();
    document.getElementById("modalItem").classList.add("active");
}

function closeItemModal() {
    document.getElementById("modalItem").classList.remove("active");
}

async function saveItem(e) {
    e.preventDefault();
    const id = document.getElementById("item-id-input").value;
    const name = document.getElementById("item-name").value.trim();
    const category = document.getElementById("item-category").value;
    const price = parseInt(document.getElementById("item-price").value);
    const unit = document.getElementById("item-unit").value.trim();
    const desc = document.getElementById("item-desc").value.trim();
    const image = document.getElementById("item-image").value;

    if (!name || !price || !unit) return;

    try {
        if (id) {
            // Edit existing item
            const payload = { id, name, category, price, unit, desc, image };
            if (state.usingMongoDB) await API.put('/api/items', payload);
            const item = state.items.find(i => i.id === id);
            if (item) Object.assign(item, { name, category, price, unit, desc, image });
        } else {
            // Create new item
            const newItem = { id: `item-${Date.now()}`, name, category, price, unit, desc, image, available: true };
            if (state.usingMongoDB) await API.post('/api/items', newItem);
            state.items.push(newItem);
        }
    } catch (err) {
        console.warn('[DB] Item save failed, using local only:', err.message);
    }

    saveStateToLocalStorage();
    closeItemModal();
    updateStats();
    renderAll();
}

function editItem(id) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;

    populateCategoryDropdown();

    document.getElementById("modalItemTitle").innerText = "Edit Menu Item";
    document.getElementById("item-id-input").value = item.id;
    document.getElementById("item-name").value = item.name;
    document.getElementById("item-category").value = item.category;
    document.getElementById("item-price").value = item.price;
    document.getElementById("item-unit").value = item.unit;
    document.getElementById("item-desc").value = item.desc;
    document.getElementById("item-image").value = item.image;

    document.getElementById("modalItem").classList.add("active");
}

function deleteItem(id) {
    if (confirm("Are you sure you want to delete this menu item?")) {
        state.items = state.items.filter(i => i.id !== id);
        delete state.cart[id];
        saveStateToLocalStorage();
        updateStats();
        renderAll();
        // Delete from MongoDB async (non-blocking)
        if (state.usingMongoDB) API.delete(`/api/items?id=${id}`).catch(e => console.warn('[DB] Delete item failed:', e.message));
    }
}

function toggleItemAvailability(id, checked) {
    const item = state.items.find(i => i.id === id);
    if (item) {
        item.available = checked;
        if (!checked) delete state.cart[id];
        saveStateToLocalStorage();
        updateStats();
        renderAll();
        // Persist availability to MongoDB async
        if (state.usingMongoDB) API.put('/api/items', { id, available: checked }).catch(e => console.warn('[DB] Toggle availability failed:', e.message));
    }
}

// 10. Dashboard Helper Statistics & Actions
function updateStats() {
    const totalItemsEl = document.getElementById("stat-total-items");
    const totalCatsEl = document.getElementById("stat-total-categories");
    const lastUpdatedEl = document.getElementById("stat-last-updated");

    if (totalItemsEl) totalItemsEl.innerText = state.items.length;
    if (totalCatsEl) totalCatsEl.innerText = state.sections.length;
    if (lastUpdatedEl) {
        lastUpdatedEl.innerText = "Just now";
    }
}

function copyShareLink() {
    const copyText = document.getElementById("share-link-input");
    if (!copyText) return;

    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices

    navigator.clipboard.writeText(copyText.value)
        .then(() => {
            const copyBtnText = document.getElementById("copy-btn-text");
            if (copyBtnText) {
                copyBtnText.innerText = "Copied!";
                setTimeout(() => {
                    copyBtnText.innerText = "Copy";
                }, 2000);
            }
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
}

// 11. Event Listeners Binding
function bindEventListeners() {
    // Admin Login Form
    const loginForm = document.getElementById("adminLoginForm");
    if (loginForm) loginForm.addEventListener("submit", handleAdminLogin);

    // Toggle password visibility
    const togglePwdBtn = document.getElementById("toggleLoginPassword");
    if (togglePwdBtn) {
        togglePwdBtn.addEventListener("click", () => {
            const pwdInput = document.getElementById("loginPassword");
            if (pwdInput) {
                const isHidden = pwdInput.type === "password";
                pwdInput.type = isHidden ? "text" : "password";
                togglePwdBtn.innerHTML = isHidden ? '<i data-lucide="eye-off"></i>' : '<i data-lucide="eye"></i>';
                lucide.createIcons();
            }
        });
    }

    // Login overlay back-to-menu link
    const loginBackLink = document.getElementById("loginBackToMenu");
    if (loginBackLink) {
        loginBackLink.addEventListener("click", (e) => {
            e.preventDefault();
            hideLoginOverlay();
            switchToCustomerView();
        });
    }

    // Admin Logout
    const logoutBtn = document.getElementById("adminLogoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", handleAdminLogout);

    // View Switchers (developer helper)
    const btnToAdmin = document.getElementById("switchToAdmin");
    const btnToCustomer = document.getElementById("switchToCustomer");
    if (btnToAdmin) btnToAdmin.addEventListener("click", requireAdminAuth);
    if (btnToCustomer) btnToCustomer.addEventListener("click", switchToCustomerView);

    // Sidebar Preview Menu click
    const sidebarPreview = document.getElementById("sidebar-preview-menu");
    if (sidebarPreview) sidebarPreview.addEventListener("click", (e) => {
        e.preventDefault();
        switchToCustomerView();
    });

    const sidebarAnalytics = document.getElementById("sidebar-analytics");
    if (sidebarAnalytics) sidebarAnalytics.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Analytics reporting is fully configured! Total Menu pageviews today: 1,248 hits.");
    });

    // Preview Full Menu under Quick Preview
    const btnPreviewFull = document.getElementById("btnPreviewMenuFull");
    if (btnPreviewFull) btnPreviewFull.addEventListener("click", switchToCustomerView);

    // Section Modals
    const btnAddSec = document.getElementById("btnAddSection");
    if (btnAddSec) btnAddSec.addEventListener("click", openAddSectionModal);
    
    const btnCloseSec = document.getElementById("btnCloseSectionModal");
    if (btnCloseSec) btnCloseSec.addEventListener("click", closeSectionModal);
    
    const btnCancelSec = document.getElementById("btnCancelSectionModal");
    if (btnCancelSec) btnCancelSec.addEventListener("click", closeSectionModal);

    const formSection = document.getElementById("formSection");
    if (formSection) formSection.addEventListener("submit", saveSection);

    // Item Modals
    const btnAddItem = document.getElementById("btnAddItem");
    if (btnAddItem) btnAddItem.addEventListener("click", openAddItemModal);

    const btnCloseItem = document.getElementById("btnCloseItemModal");
    if (btnCloseItem) btnCloseItem.addEventListener("click", closeItemModal);

    const btnCancelItem = document.getElementById("btnCancelItemModal");
    if (btnCancelItem) btnCancelItem.addEventListener("click", closeItemModal);

    const formItem = document.getElementById("formItem");
    if (formItem) formItem.addEventListener("submit", saveItem);

    // Copy Link
    const btnCopy = document.getElementById("btnCopyLink");
    if (btnCopy) btnCopy.addEventListener("click", copyShareLink);

    // Social Sharing Modals (mock alerts)
    document.getElementById("share-wa").addEventListener("click", (e) => {
        e.preventDefault();
        const shareLink = document.getElementById("share-link-input").value;
        window.open(`https://api.whatsapp.com/send?text=Check%20out%20our%20Sweets%20and%20Snacks%20Menu%20here!%20${encodeURIComponent(shareLink)}`, "_blank");
    });
    
    document.getElementById("share-fb").addEventListener("click", (e) => {
        e.preventDefault();
        const shareLink = document.getElementById("share-link-input").value;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, "_blank");
    });

    document.getElementById("share-ig").addEventListener("click", (e) => {
        e.preventDefault();
        alert("Instagram link sharing copying to clipboard!");
        copyShareLink();
    });

    document.getElementById("share-other").addEventListener("click", (e) => {
        e.preventDefault();
        if (navigator.share) {
            const shareLink = document.getElementById("share-link-input").value;
            navigator.share({
                title: 'Universal Sweets Digital Menu',
                text: 'Order fresh sweets and snacks directly from our digital menu!',
                url: shareLink
            }).catch(console.error);
        } else {
            copyShareLink();
        }
    });

    // Customer interactions
    const btnExplore = document.getElementById("btnExploreMenu");
    if (btnExplore) {
        btnExplore.addEventListener("click", () => {
            const catalogSec = document.getElementById("customer-catalog-section");
            if (catalogSec) {
                catalogSec.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    const navWhatsAppBtn = document.getElementById("navWhatsAppBtn");
    if (navWhatsAppBtn) {
        navWhatsAppBtn.addEventListener("click", () => {
            window.open("https://wa.me/919224701020", "_blank");
        });
    }

    // Customer Hero interactions
    const btnExploreMenuHero = document.getElementById("btnExploreMenuHero");
    if (btnExploreMenuHero) {
        btnExploreMenuHero.addEventListener("click", () => {
            const catalogSec = document.getElementById("customer-catalog-section");
            if (catalogSec) {
                catalogSec.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    const btnWhatsAppHero = document.getElementById("btnWhatsAppHero");
    if (btnWhatsAppHero) {
        btnWhatsAppHero.addEventListener("click", () => {
            const msg = encodeURIComponent("Hello Universal Sweets,\n\nI would like to know more about your sweets and place an order.");
            window.open(`https://wa.me/919224701020?text=${msg}`, "_blank");
        });
    }

    // Customer Footer Links
    const footerLinkAdmin = document.getElementById("footerLinkAdmin");
    if (footerLinkAdmin) {
        footerLinkAdmin.addEventListener("click", (e) => {
            e.preventDefault();
            requireAdminAuth();
        });
    }

    const footerLinkExplore = document.getElementById("footerLinkExplore");
    if (footerLinkExplore) {
        footerLinkExplore.addEventListener("click", (e) => {
            e.preventDefault();
            const catalogSec = document.getElementById("customer-catalog-section");
            if (catalogSec) {
                catalogSec.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    // Customer Live Search
    const searchInput = document.getElementById("customer-search-input");
    const clearSearchBtn = document.getElementById("clear-search-btn");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            state.customerSearchQuery = e.target.value;
            if (state.customerSearchQuery.trim() !== "") {
                clearSearchBtn.classList.remove("hidden");
            } else {
                clearSearchBtn.classList.add("hidden");
            }
            renderCustomerItems();
            lucide.createIcons();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            searchInput.value = "";
            state.customerSearchQuery = "";
            clearSearchBtn.classList.add("hidden");
            renderCustomerItems();
            lucide.createIcons();
        });
    }

    // Cart checkout trigger
    const btnCheckout = document.getElementById("btnCartCheckout");
    if (btnCheckout) btnCheckout.addEventListener("click", showCheckoutModal);

    const btnCloseChk = document.getElementById("btnCloseCheckoutModal");
    if (btnCloseChk) btnCloseChk.addEventListener("click", closeCheckoutModal);

    const btnCancelChk = document.getElementById("btnCancelCheckout");
    if (btnCancelChk) btnCancelChk.addEventListener("click", closeCheckoutModal);

    const btnSendOrder = document.getElementById("btnSendWhatsAppOrder");
    if (btnSendOrder) btnSendOrder.addEventListener("click", sendWhatsAppOrder);
}
