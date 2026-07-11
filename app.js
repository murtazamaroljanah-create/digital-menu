/* ==========================================================================
   Universal Sweets - Digital Menu & Admin JavaScript
   ========================================================================== */

// ── Supabase Configuration ─────────────────────────────────────────────────
const SUPABASE_URL      = "https://lijzpumlvbjgjbfmhdif.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpanpwdW1sdmJqZ2piZm1oZGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2Njc5MDksImV4cCI6MjA5OTI0MzkwOX0.gM7zJO3OahGq8V_qyfOtMsCdhpJ5zyi67FWPOYAAdmI";

let db = null;
function initSupabase() {
    if (!window.supabase) return null;
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCT SERVICE — single source of truth for all DB writes
// ══════════════════════════════════════════════════════════════════════════════
const ProductService = {
    // Update any fields on an item and persist to Supabase
    async updateItem(id, fields) {
        if (!db || !state.usingSupabase) return { ok: true, local: true };
        const payload = { ...fields, updated_at: new Date().toISOString() };
        const { error } = await db.from('items').update(payload).eq('id', id);
        if (error) throw new Error(error.message);
        return { ok: true };
    },

    async insertItem(item) {
        if (!db || !state.usingSupabase) return { ok: true, local: true };
        const { error } = await db.from('items').insert(item);
        if (error) throw new Error(error.message);
        return { ok: true };
    },

    async deleteItem(id) {
        if (!db || !state.usingSupabase) return { ok: true, local: true };
        const { error } = await db.from('items').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return { ok: true };
    },

    async updateSection(id, fields) {
        if (!db || !state.usingSupabase) return { ok: true, local: true };
        const { error } = await db.from('sections').update(fields).eq('id', id);
        if (error) throw new Error(error.message);
        return { ok: true };
    },

    async insertSection(section) {
        if (!db || !state.usingSupabase) return { ok: true, local: true };
        const { error } = await db.from('sections').insert(section);
        if (error) throw new Error(error.message);
        return { ok: true };
    },

    async deleteSection(id) {
        if (!db || !state.usingSupabase) return { ok: true, local: true };
        const { error } = await db.from('sections').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return { ok: true };
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATION SYSTEM
// ══════════════════════════════════════════════════════════════════════════════
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span class="toast-msg">${message}</span>
    `;
    container.appendChild(toast);
    // Animate in
    requestAnimationFrame(() => toast.classList.add('toast-show'));
    // Auto-remove
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ══════════════════════════════════════════════════════════════════════════════
// DEFAULT DATA (fallback when Supabase is not configured)
// ══════════════════════════════════════════════════════════════════════════════
const DEFAULT_SECTIONS = [
    { id: "sec-1", name: "Sweets",        icon: "cookie"   },
    { id: "sec-2", name: "Snacks",        icon: "sandwich" },
    { id: "sec-3", name: "Beverages",     icon: "cup-soda" },
    { id: "sec-4", name: "Special Packs", icon: "gift"     },
    { id: "sec-5", name: "Others",        icon: "heart"    }
];

const DEFAULT_ITEMS = [
    { id: "item-1", name: "Kaju Katli",      category: "Sweets",    price: 720, unit: "kg",    desc: "Rich and soft cashew slices made with pure ghee and decorated with premium silver leaf.",           image: "assets/kaju_katli.png",  available: true, is_available: true, is_visible: true, is_featured: false, is_best_seller: false, is_fresh_today: false },
    { id: "item-2", name: "Motichoor Ladoo", category: "Sweets",    price: 560, unit: "kg",    desc: "Classic soft laddoo made from fine boondi pearls, pure ghee, and a hint of cardamom.",              image: "assets/ladoo.png",        available: true, is_available: true, is_visible: true, is_featured: false, is_best_seller: false, is_fresh_today: false },
    { id: "item-3", name: "Mathri",          category: "Snacks",    price: 280, unit: "kg",    desc: "Crispy and savory traditional crackers spiced with carom seeds (ajwain), perfect for tea time.",    image: "assets/mathri.png",       available: true, is_available: true, is_visible: true, is_featured: false, is_best_seller: false, is_fresh_today: false },
    { id: "item-4", name: "Masala Khasta",   category: "Snacks",    price: 300, unit: "kg",    desc: "Flaky crust stuffed with spicy and savory lentil mixture, fried to golden perfection.",             image: "assets/mathri.png",       available: true, is_available: true, is_visible: true, is_featured: false, is_best_seller: false, is_fresh_today: false },
    { id: "item-5", name: "Badam Milk",      category: "Beverages", price: 120, unit: "glass", desc: "Rich, chilled almond milk infused with real saffron strands and garnished with sliced almonds.",    image: "assets/badam_milk.png",   available: true, is_available: true, is_visible: true, is_featured: false, is_best_seller: false, is_fresh_today: false },
    { id: "item-6", name: "Rasgulla",        category: "Sweets",    price: 440, unit: "kg",    desc: "Soft and spongy traditional cottage cheese balls cooked in delicate sugar syrup.",                  image: "assets/rasgulla.png",     available: true, is_available: true, is_visible: true, is_featured: false, is_best_seller: false, is_fresh_today: false },
    { id: "item-7", name: "Gulab Jamun",     category: "Sweets",    price: 440, unit: "kg",    desc: "Warm golden-brown fried milk solids dumplings soaked in rose-flavored cardamom syrup.",             image: "assets/gulab_jamun.png",  available: true, is_available: true, is_visible: true, is_featured: false, is_best_seller: false, is_fresh_today: false }
];

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL STATE
// ══════════════════════════════════════════════════════════════════════════════
let state = {
    sections: [],
    items: [],
    cart: {},
    activeCustomerCategory: "All",
    customerSearchQuery: "",
    usingSupabase: false
};

// ══════════════════════════════════════════════════════════════════════════════
// DATA LOADING — always fetch fresh from Supabase on every page load
// ══════════════════════════════════════════════════════════════════════════════
async function loadState() {
    db = initSupabase();

    // Show loading skeletons while fetching
    showLoadingSkeleton();

    if (db) {
        try {
            const [{ data: sections, error: sErr }, { data: items, error: iErr }] = await Promise.all([
                db.from('sections').select('*').order('created_at', { ascending: true }),
                db.from('items').select('*').order('created_at', { ascending: true })
            ]);

            if (sErr || iErr) throw new Error(sErr?.message || iErr?.message);

            if (sections && sections.length > 0) {
                state.sections = sections;
                // Normalise: treat both `available` and `is_available` columns
                state.items = (items || []).map(normaliseItem);
                state.usingSupabase = true;
                console.log('[Supabase] Loaded ✅', sections.length, 'sections,', state.items.length, 'items');
                return;
            }

            // Tables are empty — seed defaults
            console.log('[Supabase] Empty tables, seeding defaults...');
            await seedSupabase();
            const [{ data: s2 }, { data: i2 }] = await Promise.all([
                db.from('sections').select('*').order('created_at', { ascending: true }),
                db.from('items').select('*').order('created_at', { ascending: true })
            ]);
            state.sections   = s2 || DEFAULT_SECTIONS;
            state.items      = (i2 || DEFAULT_ITEMS).map(normaliseItem);
            state.usingSupabase = true;

        } catch (err) {
            console.warn('[Supabase] Error, using localStorage fallback:', err.message);
            loadLocalFallback();
        }
    } else {
        console.info('[Supabase] Not configured — using localStorage fallback.');
        loadLocalFallback();
    }
}

function showLoadingSkeleton() {
    const tbody = document.getElementById("admin-items-table-body");
    const secList = document.getElementById("admin-sections-list");
    const skelRow = () => `
        <div class="skeleton-row">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton-text">
                <div class="skeleton skeleton-line" style="width:60%"></div>
                <div class="skeleton skeleton-line" style="width:40%"></div>
            </div>
        </div>`;
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="padding:8px 0">${[1,2,3].map(skelRow).join('')}</td></tr>`;
    if (secList) secList.innerHTML = [1,2,3].map(() => `<li style="padding:8px 0">${skelRow()}</li>`).join('');
}

// Normalise item fields — support both old `available` and new `is_available` columns
function normaliseItem(item) {
    const isAvail = item.is_available !== undefined ? item.is_available : (item.available !== undefined ? item.available : true);
    return {
        ...item,
        available:      isAvail,
        is_available:   isAvail,
        is_visible:     item.is_visible     !== undefined ? item.is_visible     : true,
        is_featured:    item.is_featured    !== undefined ? item.is_featured    : false,
        is_best_seller: item.is_best_seller !== undefined ? item.is_best_seller : false,
        is_fresh_today: item.is_fresh_today !== undefined ? item.is_fresh_today : false,
    };
}

function loadLocalFallback() {
    state.sections      = JSON.parse(localStorage.getItem("us_sections")) || DEFAULT_SECTIONS;
    state.items         = (JSON.parse(localStorage.getItem("us_items")) || DEFAULT_ITEMS).map(normaliseItem);
    state.usingSupabase = false;
}

async function seedSupabase() {
    if (!db) return;
    const ts = (i) => new Date(Date.now() + i).toISOString();
    const sections = DEFAULT_SECTIONS.map((s, i) => ({ ...s, created_at: ts(i) }));
    const items    = DEFAULT_ITEMS.map((item, i) => ({
        ...item, created_at: ts(i),
        is_available: true, is_visible: true,
        is_featured: false, is_best_seller: false, is_fresh_today: false,
        updated_at: ts(i)
    }));
    await db.from('sections').insert(sections);
    await db.from('items').insert(items);
}

function saveStateToLocalStorage() {
    localStorage.setItem("us_sections", JSON.stringify(state.sections));
    localStorage.setItem("us_items",    JSON.stringify(state.items));
}

// ══════════════════════════════════════════════════════════════════════════════
// INITIALISATION
// ══════════════════════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", async () => {
    lucide.createIcons();

    const shareInput = document.getElementById("share-link-input");
    if (shareInput) shareInput.value = window.location.href.split('?')[0];

    await loadState();
    saveStateToLocalStorage();

    const urlParams   = new URLSearchParams(window.location.search);
    const view        = urlParams.get("view");
    const isAdminPath = window.location.pathname === "/admin" || window.location.pathname === "/admin/";
    if (view === "admin" || isAdminPath) {
        requireAdminAuth();
    } else {
        switchToCustomerView();
    }

    bindEventListeners();
    updateStats();
    renderAll();
});

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════
const ADMIN_USERNAME  = "universalsweets";
const ADMIN_PASSWORD  = "murtaza123";
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
    const overlay = document.getElementById("adminLoginOverlay");
    if (overlay) overlay.classList.add("active");
}

function hideLoginOverlay() {
    const overlay = document.getElementById("adminLoginOverlay");
    if (overlay) overlay.classList.remove("active");
}

function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById("admin-username")?.value.trim();
    const password = document.getElementById("admin-password")?.value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem(AUTH_SESSION_KEY, "true");
        hideLoginOverlay();
        switchToAdminView();
        showToast("Welcome back, Admin! 👋", "success");
    } else {
        showToast("Invalid credentials. Please try again.", "error");
        const errEl = document.getElementById("login-error-msg");
        if (errEl) { errEl.innerText = "Incorrect username or password."; errEl.style.display = "block"; }
    }
}

function handleAdminLogout() {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    switchToCustomerView();
    showToast("Logged out successfully.", "success");
}

// ══════════════════════════════════════════════════════════════════════════════
// VIEW SWITCHING
// ══════════════════════════════════════════════════════════════════════════════
function switchToAdminView() {
    document.body.classList.remove("customer-view-active");
    document.body.classList.add("admin-view-active");
    const btn1 = document.getElementById("switchToAdmin");
    const btn2 = document.getElementById("switchToCustomer");
    if (btn1) btn1.classList.add("active-view-btn");
    if (btn2) btn2.classList.remove("active-view-btn");
    lucide.createIcons();
}

function switchToCustomerView() {
    document.body.classList.remove("admin-view-active");
    document.body.classList.add("customer-view-active");
    const btn1 = document.getElementById("switchToAdmin");
    const btn2 = document.getElementById("switchToCustomer");
    if (btn1) btn1.classList.remove("active-view-btn");
    if (btn2) btn2.classList.add("active-view-btn");
    lucide.createIcons();
}

// ══════════════════════════════════════════════════════════════════════════════
// EVENT BINDING
// ══════════════════════════════════════════════════════════════════════════════
function bindEventListeners() {
    // ── View Switcher ────────────────────────────────────────
    document.getElementById("switchToAdmin")?.addEventListener("click", () => {
        if (isAdminAuthenticated()) { switchToAdminView(); } else { requireAdminAuth(); }
    });
    document.getElementById("switchToCustomer")?.addEventListener("click", switchToCustomerView);

    // ── Admin Login & Auth ───────────────────────────────────
    document.getElementById("formLogin")?.addEventListener("submit", handleAdminLogin);
    document.getElementById("loginBackToMenu")?.addEventListener("click", (e) => {
        e.preventDefault(); hideLoginOverlay(); switchToCustomerView();
    });
    document.getElementById("toggleLoginPassword")?.addEventListener("click", () => {
        const pw = document.getElementById("admin-password");
        if (!pw) return;
        pw.type = pw.type === "password" ? "text" : "password";
        const icon = document.querySelector("#toggleLoginPassword i[data-lucide]");
        if (icon) { icon.setAttribute("data-lucide", pw.type === "text" ? "eye-off" : "eye"); lucide.createIcons(); }
    });
    document.getElementById("admin-logout-btn")?.addEventListener("click", (e) => {
        e.preventDefault(); handleAdminLogout();
    });

    // ── Sidebar Navigation ───────────────────────────────────
    document.querySelectorAll(".sidebar-menu li[data-tab]").forEach(li => {
        li.addEventListener("click", (e) => {
            e.preventDefault();
            document.querySelectorAll(".sidebar-menu li").forEach(el => el.classList.remove("active"));
            li.classList.add("active");
            const labels = {
                "dashboard":     ["Dashboard",      "Manage your digital menu easily"],
                "menu-sections": ["Menu Sections",  "Organise your menu categories"],
                "items":         ["Menu Items",     "Add, edit and manage products"],
                "categories":    ["Categories",     "Manage item categories"],
                "banners":       ["Banners",        "Manage promotional banners"],
                "info-blocks":   ["Info Blocks",    "Manage store info and details"],
                "settings":      ["Settings",       "Configure your menu settings"],
            };
            const tab = li.dataset.tab;
            const h1 = document.querySelector(".main-header h1");
            const sub = document.querySelector(".main-header p");
            if (h1 && labels[tab]) h1.innerText = labels[tab][0];
            if (sub && labels[tab]) sub.innerText = labels[tab][1];
        });
    });
    document.getElementById("sidebar-preview-menu")?.addEventListener("click", (e) => {
        e.preventDefault(); switchToCustomerView();
    });

    // ── Section CRUD ─────────────────────────────────────────
    document.getElementById("btnAddSection")?.addEventListener("click", openAddSectionModal);
    document.getElementById("btnCloseSectionModal")?.addEventListener("click", closeSectionModal);
    document.getElementById("btnCancelSectionModal")?.addEventListener("click", closeSectionModal);
    document.getElementById("formSection")?.addEventListener("submit", saveSection);

    // ── Item CRUD ────────────────────────────────────────────
    document.getElementById("btnAddItem")?.addEventListener("click", openAddItemModal);
    document.getElementById("btnCloseItemModal")?.addEventListener("click", closeItemModal);
    document.getElementById("btnCancelItemModal")?.addEventListener("click", closeItemModal);
    document.getElementById("formItem")?.addEventListener("submit", saveItem);

    // ── Share & Preview ──────────────────────────────────────
    document.getElementById("btnCopyLink")?.addEventListener("click", copyShareLink);
    document.getElementById("btnPreviewMenuFull")?.addEventListener("click", switchToCustomerView);

    const menuUrl = encodeURIComponent(window.location.origin + "/menu");
    document.getElementById("share-wa")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.open(`https://wa.me/?text=Check%20out%20Universal%20Sweets!%20${menuUrl}`, "_blank");
    });
    document.getElementById("share-fb")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${menuUrl}`, "_blank");
    });
    document.getElementById("share-ig")?.addEventListener("click", (e) => {
        e.preventDefault();
        showToast("Copy the link and share it on Instagram Stories!", "info");
    });
    document.getElementById("share-other")?.addEventListener("click", (e) => {
        e.preventDefault();
        if (navigator.share) {
            navigator.share({ title: "Universal Sweets Menu", url: window.location.origin + "/menu" });
        } else {
            copyShareLink();
            showToast("Link copied! Share it anywhere.", "success");
        }
    });

    // ── Customer Hero Buttons ────────────────────────────────
    document.getElementById("btnExploreMenuHero")?.addEventListener("click", () => {
        document.getElementById("customer-catalog-section")?.scrollIntoView({ behavior: "smooth" });
    });
    document.getElementById("btnWhatsAppHero")?.addEventListener("click", () => {
        window.open("https://wa.me/919224701020", "_blank");
    });
    document.getElementById("navWhatsAppBtn")?.addEventListener("click", () => {
        window.open("https://wa.me/919224701020", "_blank");
    });

    // ── Footer Links ─────────────────────────────────────────
    document.getElementById("footerLinkAdmin")?.addEventListener("click", (e) => {
        e.preventDefault(); requireAdminAuth();
    });
    document.getElementById("footerLinkExplore")?.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("customer-catalog-section")?.scrollIntoView({ behavior: "smooth" });
    });

    // ── Customer Search ──────────────────────────────────────
    const searchInput = document.getElementById("customer-search-input");
    const clearBtn    = document.getElementById("clear-search-btn");
    searchInput?.addEventListener("input", (e) => {
        state.customerSearchQuery = e.target.value;
        if (clearBtn) clearBtn.classList.toggle("hidden", !e.target.value);
        renderCustomerItems();
        lucide.createIcons();
    });
    clearBtn?.addEventListener("click", () => {
        state.customerSearchQuery = "";
        if (searchInput) searchInput.value = "";
        clearBtn.classList.add("hidden");
        renderCustomerItems();
        lucide.createIcons();
    });

    // ── Cart / Checkout ──────────────────────────────────────
    document.getElementById("customer-view-cart-btn")?.addEventListener("click", showCheckoutModal);
    document.getElementById("btn-checkout-send-wa")?.addEventListener("click", sendWhatsAppOrder);
    document.getElementById("btn-close-checkout")?.addEventListener("click", closeCheckoutModal);
    document.getElementById("btnCloseCheckoutModal")?.addEventListener("click", closeCheckoutModal);
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDER ALL
// ══════════════════════════════════════════════════════════════════════════════
function renderAll() {
    renderAdminSections();
    renderAdminItems();
    renderCustomerCategories();
    renderCustomerItems();
    lucide.createIcons();
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN — SECTIONS RENDER
// ══════════════════════════════════════════════════════════════════════════════
function renderAdminSections() {
    const sectionList = document.getElementById("admin-sections-list");
    if (!sectionList) return;
    sectionList.innerHTML = "";

    state.sections.forEach(section => {
        const itemCount = state.items.filter(item => item.category.toLowerCase() === section.name.toLowerCase()).length;
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="section-info">
                <div class="section-info-icon"><i data-lucide="${section.icon || 'cookie'}"></i></div>
                <div class="section-details">
                    <h4>${section.name}</h4>
                    <span>${itemCount} items</span>
                </div>
            </div>
            <div class="action-btns">
                <button class="action-btn edit-btn" onclick="editSection('${section.id}')" title="Edit Section"><i data-lucide="edit-3"></i></button>
                <button class="action-btn delete-btn" onclick="deleteSection('${section.id}')" title="Delete Section"><i data-lucide="trash-2"></i></button>
            </div>
        `;
        sectionList.appendChild(li);
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN — ITEMS TABLE RENDER (with all toggles)
// ══════════════════════════════════════════════════════════════════════════════
function renderAdminItems() {
    const tbody = document.getElementById("admin-items-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (state.items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px;">No items found. Click 'Add Item' to add.</td></tr>`;
        return;
    }

    state.items.forEach(item => {
        const tr = document.createElement("tr");
        tr.id = `row-${item.id}`;
        tr.innerHTML = `
            <td>
                <div class="item-meta">
                    <img src="${item.image || 'assets/hero_sweets.png'}" class="item-img-mini" alt="${item.name}">
                    <div class="item-text">
                        <h4>${item.name}</h4>
                        <span>${item.desc}</span>
                        <div class="item-badges" style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;">
                            ${item.is_best_seller ? '<span class="badge-mini badge-bestseller">⭐ Bestseller</span>' : ''}
                            ${item.is_fresh_today ? '<span class="badge-mini badge-fresh">🌿 Fresh Today</span>' : ''}
                            ${item.is_featured    ? '<span class="badge-mini badge-featured">🔥 Featured</span>'   : ''}
                            ${!item.is_visible    ? '<span class="badge-mini badge-hidden">👁️ Hidden</span>'       : ''}
                        </div>
                    </div>
                </div>
            </td>
            <td><span class="item-cat-badge">${item.category}</span></td>
            <td><span class="item-price-val">₹${item.price} <span style="font-weight:normal;font-size:11px;color:var(--text-muted);">/${item.unit}</span></span></td>
            <td>
                <div class="toggle-col" style="display:flex;flex-direction:column;gap:6px;min-width:120px;">
                    <label class="toggle-row" title="In Stock / Out of Stock">
                        <span class="toggle-lbl">In Stock</span>
                        <label class="switch">
                            <input type="checkbox" id="avail-${item.id}" ${item.is_available ? 'checked' : ''}
                                onchange="adminToggle('${item.id}', 'is_available', this)">
                            <span class="slider"></span>
                        </label>
                    </label>
                    <label class="toggle-row" title="Show / Hide on customer menu">
                        <span class="toggle-lbl">Visible</span>
                        <label class="switch">
                            <input type="checkbox" id="vis-${item.id}" ${item.is_visible ? 'checked' : ''}
                                onchange="adminToggle('${item.id}', 'is_visible', this)">
                            <span class="slider"></span>
                        </label>
                    </label>
                    <label class="toggle-row" title="Mark as Bestseller">
                        <span class="toggle-lbl">Bestseller</span>
                        <label class="switch">
                            <input type="checkbox" id="bs-${item.id}" ${item.is_best_seller ? 'checked' : ''}
                                onchange="adminToggle('${item.id}', 'is_best_seller', this)">
                            <span class="slider"></span>
                        </label>
                    </label>
                    <label class="toggle-row" title="Fresh Today">
                        <span class="toggle-lbl">Fresh Today</span>
                        <label class="switch">
                            <input type="checkbox" id="ft-${item.id}" ${item.is_fresh_today ? 'checked' : ''}
                                onchange="adminToggle('${item.id}', 'is_fresh_today', this)">
                            <span class="slider"></span>
                        </label>
                    </label>
                </div>
            </td>
            <td class="text-right">
                <div class="action-btns" style="justify-content:flex-end;">
                    <button class="action-btn edit-btn" onclick="editItem('${item.id}')" title="Edit Item"><i data-lucide="edit-3"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteItem('${item.id}')" title="Delete Item"><i data-lucide="trash-2"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN TOGGLE — Optimistic UI + DB write + rollback on failure
// ══════════════════════════════════════════════════════════════════════════════
async function adminToggle(id, field, checkboxEl) {
    const newValue    = checkboxEl.checked;
    const item        = state.items.find(i => i.id === id);
    if (!item) return;

    const previousValue = item[field];

    // 1. Optimistic UI — update immediately
    item[field] = newValue;
    // Keep legacy `available` field in sync with `is_available`
    if (field === 'is_available') {
        item.available = newValue;
        if (!newValue) delete state.cart[id]; // remove from cart if out of stock
    }

    // Disable the toggle during the write
    checkboxEl.disabled = true;

    try {
        // 2. Write to Supabase — AWAIT (blocking)
        await ProductService.updateItem(id, { [field]: newValue });

        // 3. Update local storage backup
        saveStateToLocalStorage();

        // 4. Success feedback
        const label = {
            is_available:   newValue ? 'marked In Stock'    : 'marked Out of Stock',
            is_visible:     newValue ? 'set to Visible'     : 'set to Hidden',
            is_best_seller: newValue ? 'marked Bestseller'  : 'unmarked Bestseller',
            is_fresh_today: newValue ? 'marked Fresh Today' : 'unmarked Fresh Today',
        }[field] || 'updated';
        showToast(`${item.name} ${label}.`, 'success');

        // Re-render badges in this row without full re-render
        updateAdminRowBadges(item);
        // Refresh stats (updates Last Updated timestamp)
        updateStats();

    } catch (err) {
        // 5. ROLLBACK on failure
        item[field] = previousValue;
        if (field === 'is_available') item.available = previousValue;
        checkboxEl.checked = previousValue;
        showToast(`Failed to update ${item.name}. Please try again.`, 'error');
        console.error('[Supabase] Toggle failed:', err.message);
    } finally {
        checkboxEl.disabled = false;
    }

    renderCustomerItems(); // keep customer menu in sync
    lucide.createIcons();
}

// Update only the badge row for a single item (avoids full re-render flicker)
function updateAdminRowBadges(item) {
    const row = document.getElementById(`row-${item.id}`);
    if (!row) return;
    const badgeContainer = row.querySelector('.item-badges');
    if (!badgeContainer) return;
    badgeContainer.innerHTML = `
        ${item.is_best_seller ? '<span class="badge-mini badge-bestseller">⭐ Bestseller</span>' : ''}
        ${item.is_fresh_today ? '<span class="badge-mini badge-fresh">🌿 Fresh Today</span>' : ''}
        ${item.is_featured    ? '<span class="badge-mini badge-featured">🔥 Featured</span>'  : ''}
        ${!item.is_visible    ? '<span class="badge-mini badge-hidden">👁️ Hidden</span>'      : ''}
    `;
}

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMER — CATEGORY PILLS
// ══════════════════════════════════════════════════════════════════════════════
function renderCustomerCategories() {
    const container = document.getElementById("customer-category-tabs-container");
    if (!container) return;
    container.innerHTML = "";

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

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMER — MENU ITEMS (respects is_visible and is_available)
// ══════════════════════════════════════════════════════════════════════════════
function renderCustomerItems() {
    const container = document.getElementById("customer-items-list-container");
    if (!container) return;
    container.innerHTML = "";

    const filteredItems = state.items.filter(item => {
        if (!item.is_visible) return false; // hidden items never shown
        const matchesCategory = state.activeCustomerCategory === "All" || item.category === state.activeCustomerCategory;
        const matchesSearch   = item.name.toLowerCase().includes(state.customerSearchQuery.toLowerCase()) ||
                                item.desc.toLowerCase().includes(state.customerSearchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredItems.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--text-muted);">No products found matching your search.</div>`;
        return;
    }

    filteredItems.forEach(item => {
        const isOutOfStock = !item.is_available;
        const qtyInCart    = state.cart[item.id] || 0;
        const card = document.createElement("div");
        card.className = `cust-item-card ${isOutOfStock ? 'out-of-stock' : ''}`;
        card.innerHTML = `
            <div class="cust-item-img-container">
                <img src="${item.image || 'assets/hero_sweets.png'}" alt="${item.name}">
                ${item.is_best_seller ? '<span class="cust-badge badge-bs">⭐ Bestseller</span>' : ''}
                ${item.is_fresh_today ? '<span class="cust-badge badge-ft">🌿 Fresh Today</span>' : ''}
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
                                    <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)" aria-label="Decrease"><i data-lucide="minus"></i></button>
                                    <span class="qty-number">${qtyInCart}</span>
                                    <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)" aria-label="Increase"><i data-lucide="plus"></i></button>
                                   </div>`
                                : `<button class="add-to-cart-btn" onclick="updateCartQuantity('${item.id}', 1)">Add</button>`
                        }
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// CART
// ══════════════════════════════════════════════════════════════════════════════
function updateCartQuantity(itemId, change) {
    const item = state.items.find(i => i.id === itemId);
    if (!item || !item.is_available) return;
    const currentQty = state.cart[itemId] || 0;
    const newQty     = currentQty + change;
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
    const cartBar    = document.getElementById("customer-floating-cart-bar");
    const cartCountEl = document.getElementById("cart-item-count");
    const cartPriceEl = document.getElementById("cart-total-price-val");
    if (!cartBar) return;

    let totalItems = 0, totalPrice = 0;
    Object.keys(state.cart).forEach(itemId => {
        const item = state.items.find(i => i.id === itemId);
        if (item && item.is_available) {
            const qty = state.cart[itemId];
            totalItems += qty;
            totalPrice += item.price * qty;
        }
    });

    const appContent = document.querySelector(".customer-app-content");
    if (totalItems > 0) {
        cartCountEl.innerText = totalItems;
        cartPriceEl.innerText = `₹${totalPrice}`;
        cartBar.classList.remove("hidden");
        if (appContent) appContent.style.paddingBottom = "100px";
    } else {
        cartBar.classList.add("hidden");
        if (appContent) appContent.style.paddingBottom = "0";
    }
}

function showCheckoutModal() {
    const modal     = document.getElementById("modalCheckout");
    const container = document.getElementById("checkout-items-list-container");
    const totalValEl = document.getElementById("checkout-total-val");
    if (!modal || !container) return;

    container.innerHTML = "";
    let totalPrice = 0;
    Object.keys(state.cart).forEach(itemId => {
        const item = state.items.find(i => i.id === itemId);
        if (item && item.is_available) {
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
    document.getElementById("modalCheckout")?.classList.remove("active");
}

function sendWhatsAppOrder() {
    const customerName  = document.getElementById("cust-name")?.value.trim();
    const deliveryNotes = document.getElementById("cust-address")?.value.trim();
    let orderText = `*New Order - Universal Sweets Menu*\n`;
    if (customerName) orderText += `*Customer:* ${customerName}\n`;
    orderText += `-----------------------------------\n`;
    let totalAmount = 0;
    Object.keys(state.cart).forEach(itemId => {
        const item = state.items.find(i => i.id === itemId);
        if (item && item.is_available) {
            const qty = state.cart[itemId];
            const itemTotal = item.price * qty;
            totalAmount += itemTotal;
            orderText += `• ${qty} x ${item.name} (₹${item.price}/${item.unit}) = *₹${itemTotal}*\n`;
        }
    });
    orderText += `-----------------------------------\n*Total Amount:* ₹${totalAmount}\n`;
    if (deliveryNotes) orderText += `*Notes:* ${deliveryNotes}\n`;
    orderText += `\nThank you!`;
    window.open(`https://wa.me/919224701020?text=${encodeURIComponent(orderText)}`, '_blank');
    state.cart = {};
    closeCheckoutModal();
    renderAll();
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTIONS CRUD
// ══════════════════════════════════════════════════════════════════════════════
function openAddSectionModal() {
    document.getElementById("modalSectionTitle").innerText = "Add Menu Section";
    document.getElementById("section-id-input").value = "";
    document.getElementById("formSection").reset();
    document.getElementById("modalSection").classList.add("active");
}
function closeSectionModal() { document.getElementById("modalSection").classList.remove("active"); }

async function saveSection(e) {
    e.preventDefault();
    const id   = document.getElementById("section-id-input").value;
    const name = document.getElementById("section-name").value.trim();
    const icon = document.getElementById("section-icon").value;
    if (!name) return;

    try {
        if (id) {
            await ProductService.updateSection(id, { name, icon });
            const sec = state.sections.find(s => s.id === id);
            if (sec) { sec.name = name; sec.icon = icon; }
            showToast(`Section "${name}" updated.`, 'success');
        } else {
            const newSection = { id: `sec-${Date.now()}`, name, icon, created_at: new Date().toISOString() };
            await ProductService.insertSection(newSection);
            state.sections.push(newSection);
            showToast(`Section "${name}" added.`, 'success');
        }
    } catch (err) {
        showToast('Failed to save section. Please try again.', 'error');
        console.error('[Supabase] Section save failed:', err.message);
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
    document.getElementById("section-name").value     = section.name;
    document.getElementById("section-icon").value     = section.icon;
    document.getElementById("modalSection").classList.add("active");
}

async function deleteSection(id) {
    if (!confirm("Delete this section? Items won't be deleted but their category link remains.")) return;

    // Optimistic remove
    const removed = state.sections.find(s => s.id === id);
    state.sections = state.sections.filter(s => s.id !== id);
    saveStateToLocalStorage();
    updateStats();
    renderAll();

    try {
        await ProductService.deleteSection(id);
        showToast(`Section "${removed?.name || ''}" deleted.`, 'success');
    } catch (err) {
        // ROLLBACK — put it back
        if (removed) state.sections.push(removed);
        saveStateToLocalStorage();
        updateStats();
        renderAll();
        showToast('Failed to delete section. Please try again.', 'error');
        console.error('[Supabase] Delete section failed:', err.message);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// ITEMS CRUD
// ══════════════════════════════════════════════════════════════════════════════
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

function openAddItemModal() {
    document.getElementById("modalItemTitle").innerText = "Add Menu Item";
    document.getElementById("item-id-input").value = "";
    document.getElementById("formItem").reset();
    populateCategoryDropdown();
    document.getElementById("modalItem").classList.add("active");
}
function closeItemModal() { document.getElementById("modalItem").classList.remove("active"); }

async function saveItem(e) {
    e.preventDefault();
    const id       = document.getElementById("item-id-input").value;
    const name     = document.getElementById("item-name").value.trim();
    const category = document.getElementById("item-category").value;
    const price    = parseInt(document.getElementById("item-price").value);
    const unit     = document.getElementById("item-unit").value.trim();
    const desc     = document.getElementById("item-desc").value.trim();
    const image    = document.getElementById("item-image").value;
    if (!name || !price || !unit) return;

    try {
        if (id) {
            const payload = { name, category, price, unit, desc, image, updated_at: new Date().toISOString() };
            await ProductService.updateItem(id, payload);
            const item = state.items.find(i => i.id === id);
            if (item) Object.assign(item, { name, category, price, unit, desc, image });
            showToast(`"${name}" updated successfully.`, 'success');
        } else {
            const newItem = normaliseItem({
                id: `item-${Date.now()}`, name, category, price, unit, desc, image,
                available: true, is_available: true, is_visible: true,
                is_featured: false, is_best_seller: false, is_fresh_today: false,
                created_at: new Date().toISOString(), updated_at: new Date().toISOString()
            });
            await ProductService.insertItem(newItem);
            state.items.push(newItem);
            showToast(`"${name}" added to menu.`, 'success');
        }
    } catch (err) {
        showToast('Failed to save item. Please try again.', 'error');
        console.error('[Supabase] Item save failed:', err.message);
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
    document.getElementById("item-id-input").value  = item.id;
    document.getElementById("item-name").value      = item.name;
    document.getElementById("item-category").value  = item.category;
    document.getElementById("item-price").value     = item.price;
    document.getElementById("item-unit").value      = item.unit;
    document.getElementById("item-desc").value      = item.desc;
    document.getElementById("item-image").value     = item.image;
    document.getElementById("modalItem").classList.add("active");
}

async function deleteItem(id) {
    if (!confirm("Delete this menu item?")) return;

    // Optimistic remove
    const removedItem    = state.items.find(i => i.id === id);
    const removedCartQty = state.cart[id];
    state.items = state.items.filter(i => i.id !== id);
    delete state.cart[id];
    saveStateToLocalStorage();
    updateStats();
    renderAll();

    try {
        await ProductService.deleteItem(id);
        showToast(`"${removedItem?.name || 'Item'}" deleted.`, 'success');
    } catch (err) {
        // ROLLBACK — put it back
        if (removedItem)    state.items.push(removedItem);
        if (removedCartQty) state.cart[id] = removedCartQty;
        saveStateToLocalStorage();
        updateStats();
        renderAll();
        showToast('Failed to delete item. Please try again.', 'error');
        console.error('[Supabase] Delete item failed:', err.message);
    }
}

// LEGACY: kept for backward compatibility — new code calls adminToggle()
function toggleItemAvailability(id, checked) {
    const el = document.getElementById(`avail-${id}`);
    if (el) { el.checked = checked; adminToggle(id, 'is_available', el); }
}

// ══════════════════════════════════════════════════════════════════════════════
// STATS + SHARE
// ══════════════════════════════════════════════════════════════════════════════
function updateStats() {
    const totalItemsEl  = document.getElementById("stat-total-items");
    const totalCatsEl   = document.getElementById("stat-total-categories");
    const lastUpdatedEl = document.getElementById("stat-last-updated");
    if (totalItemsEl)  totalItemsEl.innerText  = state.items.length;
    if (totalCatsEl)   totalCatsEl.innerText   = state.sections.length;
    if (lastUpdatedEl) {
        const timestamps = state.items
            .filter(i => i.updated_at)
            .map(i => new Date(i.updated_at).getTime());
        lastUpdatedEl.innerText = timestamps.length > 0
            ? formatRelativeTime(new Date(Math.max(...timestamps)))
            : "Just now";
    }
}

function formatRelativeTime(date) {
    const diffMs  = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr  = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1)  return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr  < 24) return `${diffHr}h ago`;
    return `${diffDay}d ago`;
}

function copyShareLink() {
    const copyText = document.getElementById("share-link-input");
    if (!copyText) return;
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value)
        .then(() => {
            const copyBtnText = document.getElementById("copy-btn-text");
            if (copyBtnText) {
                copyBtnText.innerText = "Copied!";
                setTimeout(() => { copyBtnText.innerText = "Copy Link"; }, 2500);
            }
        });
}
