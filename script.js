/* =========================================
   آموزشگاه رزونانس - JavaScript
   نسخه نمایشی با localStorage
========================================= */

// -------------------------
// داده‌های کلاس‌ها
// -------------------------
const classesData = [
  {
    id: 1,
    title: "کلاس گیتار مقدماتی",
    price: 12000000,
    icon: "fa-guitar",
    description: "شروعی استاندارد برای ورود به دنیای گیتار، مناسب هنرجویان مبتدی."
  },
  {
    id: 2,
    title: "کلاس گیتار پیشرفته",
    price: 15000000,
    icon: "fa-guitar",
    description: "تکنیک‌های پیشرفته، اجرای حرفه‌ای و درک عمیق‌تر از موسیقی و هارمونی."
  },
  {
    id: 3,
    title: "کلاس پیانو 0 تا 100",
    price: 24000000,
    icon: "fa-music",
    description: "آموزش کامل پیانو از پایه تا سطح حرفه‌ای، قدم‌به‌قدم و اصولی."
  },
  {
    id: 4,
    title: "کلاس سنتور",
    price: 95000000,
    icon: "fa-drum",
    description: "یادگیری اصولی سنتور با تمرکز بر تکنیک، ردیف و اجرای تمیز."
  },
  {
    id: 5,
    title: "کلاس ویولن",
    price: 11000000,
    icon: "fa-violin",
    description: "پرورش گوش موسیقایی، تکنیک آرشه‌کشی و اجرای قطعات زیبا با ویولن."
  },
  {
    id: 6,
    title: "کلاس سینث سایزر",
    price: 23000000,
    icon: "fa-sliders",
    description: "آموزش صدا‌سازی، طراحی صدا و کار با سینث سایزر برای سبک‌های مدرن."
  }
];

// -------------------------
// تنظیمات اصلی
// -------------------------
const OWNER_EMAIL = "chanasertuio@gmail.com";
const STORAGE_USERS_KEY = "rezonance_users";
const STORAGE_CURRENT_USER_KEY = "rezonance_current_user";

// -------------------------
// المنت‌ها
// -------------------------
const classesGrid = document.getElementById("classesGrid");
const userStatusText = document.getElementById("userStatusText");
const accessNotice = document.getElementById("accessNotice");
const ownerPanelSection = document.getElementById("ownerPanelSection");
const ownerUsersList = document.getElementById("ownerUsersList");
const cartCount = document.getElementById("cartCount");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartTotal = document.getElementById("cartTotal");

const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");
const cartToggleBtn = document.getElementById("cartToggleBtn");
const heroCartBtn = document.getElementById("heroCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

const openLoginModal = document.getElementById("openLoginModal");
const openRegisterModal = document.getElementById("openRegisterModal");
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const paymentModal = document.getElementById("paymentModal");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const logoutBtn = document.getElementById("logoutBtn");
const refreshUsersBtn = document.getElementById("refreshUsersBtn");
const toastContainer = document.getElementById("toastContainer");

// -------------------------
// ابزارهای کمکی
// -------------------------

/**
 * فرمت قیمت به تومان
 * @param {number} value
 * @returns {string}
 */
function formatPrice(value) {
  return new Intl.NumberFormat("fa-IR").format(value) + " تومان";
}

/**
 * نمایش Toast
 * @param {string} message
 * @param {"success"|"error"|"info"} type
 */
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

/**
 * تولید شماره کارت ساختگی
 * @returns {string}
 */
function generateFakeCardNumber() {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    const part = Math.floor(1000 + Math.random() * 9000);
    parts.push(part);
  }
  return parts.join("-");
}

/**
 * خواندن کاربران از localStorage
 * @returns {Array}
 */
function getUsers() {
  const users = localStorage.getItem(STORAGE_USERS_KEY);
  return users ? JSON.parse(users) : [];
}

/**
 * ذخیره کاربران
 * @param {Array} users
 */
function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

/**
 * دریافت کاربر جاری
 * @returns {Object|null}
 */
function getCurrentUser() {
  const currentUser = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
  return currentUser ? JSON.parse(currentUser) : null;
}

/**
 * ذخیره کاربر جاری
 * @param {Object|null} user
 */
function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  }
}

/**
 * بروزرسانی اطلاعات کاربر جاری در storage
 * @param {Object} updatedUser
 */
function syncCurrentUser(updatedUser) {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.email === updatedUser.email) {
    setCurrentUser(updatedUser);
  }
}

/**
 * پیدا کردن کاربر با ایمیل
 * @param {string} email
 * @returns {Object|undefined}
 */
function findUserByEmail(email) {
  return getUsers().find(user => user.email.toLowerCase() === email.toLowerCase());
}

/**
 * بررسی مالک بودن
 * @param {Object|null} user
 * @returns {boolean}
 */
function isOwner(user) {
  return !!user && user.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

/**
 * ساخت کاربر جدید
 * @param {string} email
 * @returns {Object}
 */
function createUser(email) {
  return {
    email,
    cart: [],
    banned: false,
    isLoggedIn: true,
    createdAt: new Date().toISOString()
  };
}

// -------------------------
// رندر کارت‌های کلاس
// -------------------------
function renderClasses() {
  classesGrid.innerHTML = "";

  classesData.forEach(item => {
    const card = document.createElement("article");
    card.className = "class-card fade-in";

    card.innerHTML = `
      <div class="class-card-top">
        <div class="class-icon">
          <i class="fa-solid ${item.icon}"></i>
        </div>
        <div class="class-price-badge">${formatPrice(item.price)}</div>
      </div>

      <h4>${item.title}</h4>
      <p>${item.description}</p>

      <div class="class-card-footer">
        <span class="class-cost">${formatPrice(item.price)}</span>
        <button class="primary-btn add-to-cart-btn" data-id="${item.id}">
          <i class="fa-solid fa-cart-plus"></i>
          افزودن به سبد خرید
        </button>
      </div>
    `;

    classesGrid.appendChild(card);
  });

  document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const classId = Number(btn.dataset.id);
      addToCart(classId);
    });
  });
}

// -------------------------
// مدیریت وضعیت کاربر
// -------------------------
function updateUserStatusUI() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    userStatusText.textContent = "در حال حاضر وارد حسابی نشده‌اید.";
    accessNotice.textContent = "فقط حساب لاگین شده امکان خرید کلاس‌ها را دارد.";
    ownerPanelSection.style.display = "none";
    return;
  }

  if (currentUser.banned) {
    userStatusText.textContent = `حساب ${currentUser.email} بن شده است و دسترسی ندارد.`;
    accessNotice.textContent = "این حساب بن شده است و امکان استفاده از سایت را ندارد.";
    ownerPanelSection.style.display = "none";
    return;
  }

  if (isOwner(currentUser)) {
    userStatusText.textContent = `شما با ایمیل ${currentUser.email} وارد شده‌اید و OWNER سایت هستید.`;
    accessNotice.textContent = "شما به‌عنوان OWNER می‌توانید سبد خرید کاربران را ببینید، آن‌ها را لاگ‌اوت یا بن کنید.";
    ownerPanelSection.style.display = "block";
    renderOwnerPanel();
  } else {
    userStatusText.textContent = `شما با ایمیل ${currentUser.email} وارد شده‌اید. امکان خرید کلاس‌ها برای شما فعال است.`;
    accessNotice.textContent = "شما وارد حساب شده‌اید و می‌توانید کلاس‌ها را به سبد خرید اضافه کنید.";
    ownerPanelSection.style.display = "none";
  }
}

// -------------------------
// سبد خرید
// -------------------------
function getCurrentUserCart() {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  return currentUser.cart || [];
}

function updateCartCount() {
  const cart = getCurrentUserCart();
  cartCount.textContent = cart.length;
}

function renderCart() {
  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.banned) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fa-solid fa-lock"></i>
        <p>برای مشاهده و استفاده از سبد خرید ابتدا وارد حساب شوید.</p>
      </div>
    `;
    cartTotal.textContent = "0 تومان";
    cartCount.textContent = "0";
    return;
  }

  const cart = currentUser.cart || [];

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fa-solid fa-cart-flatbed-suitcase"></i>
        <p>سبد خرید شما هنوز خالی است.</p>
      </div>
    `;
    cartTotal.textContent = "0 تومان";
    cartCount.textContent = "0";
    return;
  }

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <div class="cart-item-top">
        <div>
          <h4>${item.title}</h4>
          <p>${formatPrice(item.price)}</p>
        </div>
        <button class="remove-btn" data-index="${index}" title="حذف">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    cartItemsContainer.appendChild(cartItem);
  });

  cartTotal.textContent = formatPrice(total);
  cartCount.textContent = cart.length;

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFromCart(Number(btn.dataset.index));
    });
  });
}

function addToCart(classId) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    showToast("ابتدا باید وارد حساب کاربری شوید.", "error");
    return;
  }

  if (currentUser.banned) {
    showToast("حساب شما بن شده است و امکان خرید ندارید.", "error");
    return;
  }

  const selectedClass = classesData.find(item => item.id === classId);
  if (!selectedClass) return;

  const users = getUsers();
  const userIndex = users.findIndex(user => user.email === currentUser.email);

  if (userIndex === -1) return;

  users[userIndex].cart.push(selectedClass);

  saveUsers(users);
  syncCurrentUser(users[userIndex]);

  renderCart();
  updateUserStatusUI();
  showToast(`«${selectedClass.title}» به سبد خرید اضافه شد.`, "success");
}

function removeFromCart(index) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const users = getUsers();
  const userIndex = users.findIndex(user => user.email === currentUser.email);
  if (userIndex === -1) return;

  users[userIndex].cart.splice(index, 1);

  saveUsers(users);
  syncCurrentUser(users[userIndex]);

  renderCart();
  showToast("آیتم از سبد خرید حذف شد.", "info");
}

// -------------------------
// Owner Panel
// -------------------------
function renderOwnerPanel() {
  const currentUser = getCurrentUser();

  if (!isOwner(currentUser)) {
    ownerUsersList.innerHTML = "";
    return;
  }

  const users = getUsers();

  if (users.length === 0) {
    ownerUsersList.innerHTML = `<p>هیچ کاربری ثبت نشده است.</p>`;
    return;
  }

  ownerUsersList.innerHTML = "";

  users.forEach(user => {
    const userCard = document.createElement("div");
    userCard.className = "owner-user-card";

    const cartSummary = user.cart && user.cart.length
      ? user.cart.map(item => `• ${item.title} — ${formatPrice(item.price)}`).join("<br>")
      : "سبد خرید خالی است.";

    userCard.innerHTML = `
      <div class="owner-user-top">
        <div>
          <div class="owner-user-email">${user.email}</div>
        </div>

        <div class="owner-user-status">
          ${user.email === OWNER_EMAIL ? '<span class="owner-badge badge-owner">OWNER</span>' : ""}
          ${user.isLoggedIn ? '<span class="owner-badge badge-online">آنلاین</span>' : '<span class="owner-badge">آفلاین</span>'}
          ${user.banned ? '<span class="owner-badge badge-banned">بن‌شده</span>' : ""}
        </div>
      </div>

      <div class="owner-user-cart">
        <strong>سبد خرید:</strong><br>
        ${cartSummary}
      </div>

      <div class="owner-user-actions">
        ${
          user.email !== OWNER_EMAIL
            ? `
              <button class="secondary-btn force-logout-btn" data-email="${user.email}">
                <i class="fa-solid fa-right-from-bracket"></i>
                لاگ‌اوت کاربر
              </button>

              <button class="secondary-btn warning-btn toggle-ban-btn" data-email="${user.email}">
                <i class="fa-solid fa-ban"></i>
                ${user.banned ? "رفع بن" : "بن‌کردن"}
              </button>
            `
            : `
              <button class="secondary-btn" disabled>
                <i class="fa-solid fa-crown"></i>
                حساب مالک
              </button>
            `
        }
      </div>
    `;

    ownerUsersList.appendChild(userCard);
  });

  document.querySelectorAll(".force-logout-btn").forEach(btn => {
    btn.addEventListener("click", () => forceLogoutUser(btn.dataset.email));
  });

  document.querySelectorAll(".toggle-ban-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleBanUser(btn.dataset.email));
  });
}

function forceLogoutUser(email) {
  const currentUser = getCurrentUser();
  if (!isOwner(currentUser)) return;

  const users = getUsers();
  const userIndex = users.findIndex(user => user.email === email);
  if (userIndex === -1) return;

  users[userIndex].isLoggedIn = false;
  saveUsers(users);

  // اگر همان کاربر در این مرورگر فعال باشد، از current user حذف شود
  const active = getCurrentUser();
  if (active && active.email === email) {
    setCurrentUser(null);
  }

  renderOwnerPanel();
  updateUserStatusUI();
  renderCart();
  showToast(`کاربر ${email} لاگ‌اوت شد.`, "info");
}

function toggleBanUser(email) {
  const currentUser = getCurrentUser();
  if (!isOwner(currentUser)) return;

  const users = getUsers();
  const userIndex = users.findIndex(user => user.email === email);
  if (userIndex === -1) return;

  users[userIndex].banned = !users[userIndex].banned;

  if (users[userIndex].banned) {
    users[userIndex].isLoggedIn = false;
  }

  saveUsers(users);

  const active = getCurrentUser();
  if (active && active.email === email && users[userIndex].banned) {
    setCurrentUser(null);
  }

  renderOwnerPanel();
  updateUserStatusUI();
  renderCart();

  showToast(
    users[userIndex].banned
      ? `کاربر ${email} بن شد.`
      : `بن کاربر ${email} برداشته شد.`,
    users[userIndex].banned ? "error" : "success"
  );
}

// -------------------------
// احراز هویت نمایشی
// -------------------------
function registerUser(email) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return;

  let users = getUsers();
  const existingUser = users.find(user => user.email.toLowerCase() === normalizedEmail);

  if (existingUser) {
    showToast("این ایمیل قبلاً ثبت شده است. لطفاً وارد شوید.", "error");
    return;
  }

  const newUser = createUser(normalizedEmail);
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  updateUserStatusUI();
  renderCart();
  closeAllModals();

  showToast("ثبت‌نام با موفقیت انجام شد.", "success");
}

function loginUser(email) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return;

  const users = getUsers();
  const user = users.find(item => item.email.toLowerCase() === normalizedEmail);

  if (!user) {
    showToast("حسابی با این ایمیل پیدا نشد. اول ثبت‌نام کن!", "error");
    return;
  }

  if (user.banned) {
    showToast("این حساب بن شده است و اجازه ورود ندارد.", "error");
    return;
  }

  user.isLoggedIn = true;
  saveUsers(users);
  setCurrentUser(user);

  updateUserStatusUI();
  renderCart();
  closeAllModals();

  showToast(
    isOwner(user)
      ? "خوش آمدی OWNER عزیز! کل سایت زیر ذره‌بین توئه 😎"
      : "ورود با موفقیت انجام شد.",
    "success"
  );
}

function logoutCurrentUser() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    showToast("هیچ کاربری وارد نشده است.", "info");
    return;
  }

  const users = getUsers();
  const userIndex = users.findIndex(user => user.email === currentUser.email);

  if (userIndex !== -1) {
    users[userIndex].isLoggedIn = false;
    saveUsers(users);
  }

  setCurrentUser(null);

  updateUserStatusUI();
  renderCart();
  showToast("از حساب کاربری خارج شدید.", "info");
}

// -------------------------
// مودال‌ها
// -------------------------
function openModal(modal) {
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.classList.remove("active");

  const isAnyModalOpen = document.querySelector(".modal.active");
  if (!isAnyModalOpen) {
    document.body.style.overflow = "";
  }
}

function closeAllModals() {
  document.querySelectorAll(".modal").forEach(modal => {
    modal.classList.remove("active");
  });
  document.body.style.overflow = "";
}

// -------------------------
// سبد خرید سایدبار
// -------------------------
function openCart() {
  cartSidebar.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartSidebar.classList.remove("active");
  const isAnyModalOpen = document.querySelector(".modal.active");
  if (!isAnyModalOpen) {
    document.body.style.overflow = "";
  }
}

// -------------------------
// رویدادها
// -------------------------
openLoginModal.addEventListener("click", () => openModal(loginModal));
openRegisterModal.addEventListener("click", () => openModal(registerModal));

document.querySelectorAll(".close-modal").forEach(element => {
  element.addEventListener("click", () => closeAllModals());
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  loginUser(email);
  loginForm.reset();
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  registerUser(email);
  registerForm.reset();
});

logoutBtn.addEventListener("click", logoutCurrentUser);

refreshUsersBtn.addEventListener("click", () => {
  renderOwnerPanel();
  showToast("لیست کاربران بروزرسانی شد.", "info");
});

cartToggleBtn.addEventListener("click", openCart);
heroCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

checkoutBtn.addEventListener("click", () => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    showToast("برای پرداخت ابتدا باید وارد حساب شوید.", "error");
    return;
  }

  if (currentUser.banned) {
    showToast("حساب شما بن شده است.", "error");
    return;
  }

  if (!currentUser.cart || currentUser.cart.length === 0) {
    showToast("سبد خرید شما خالی است.", "error");
    return;
  }

  document.getElementById("fakeCardNumber").textContent = generateFakeCardNumber();
  openModal(paymentModal);
});

// بستن مودال با کلید ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAllModals();
    closeCart();
  }
});

// همگام‌سازی بین تب‌ها
window.addEventListener("storage", () => {
  updateUserStatusUI();
  renderCart();
  updateCartCount();
  renderOwnerPanel();
});

// -------------------------
// راه‌اندازی اولیه
// -------------------------
function initializeDefaultOwner() {
  const users = getUsers();
  const ownerExists = users.some(user => user.email.toLowerCase() === OWNER_EMAIL.toLowerCase());

  if (!ownerExists) {
    users.push({
      email: OWNER_EMAIL,
      cart: [],
      banned: false,
      isLoggedIn: false,
      createdAt: new Date().toISOString()
    });
    saveUsers(users);
  }
}

function initApp() {
  initializeDefaultOwner();
  renderClasses();
  updateUserStatusUI();
  renderCart();
  updateCartCount();
}

initApp();
// =========================
// Scroll Background Animation
// =========================

const bgGlow1 = document.querySelector(".bg-glow-1");
const bgGlow2 = document.querySelector(".bg-glow-2");

let backgroundAnimationTicking = false;

function updateBackgroundOnScroll() {
  if (!bgGlow1 || !bgGlow2) return;

  const scrollY = window.scrollY;

  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress =
    docHeight > 0
      ? Math.min(Math.max(scrollY / docHeight, 0), 1)
      : 0;

  // حرکت خیلی نرم glowها
  const x1 = 15 + progress * 60;
  const y1 = -10 + progress * 35;

  const x2 = -20 + progress * 50;
  const y2 = 25 + progress * 20;

  bgGlow1.style.transform =
    `translate3d(${x1}px, ${y1}px, 0) scale(${1 + progress * 0.15})`;

  bgGlow2.style.transform =
    `translate3d(${x2}px, ${y2}px, 0) scale(${1 + progress * 0.12})`;

  // تغییر خیلی ملایم رنگ
  const greenAlpha = 0.32 - progress * 0.1;
  const blueAlpha = 0.28 + progress * 0.08;

  bgGlow1.style.background =
    `rgba(105, 170, 130, ${greenAlpha})`;

  bgGlow2.style.background =
    `rgba(75, 105, 165, ${blueAlpha})`;

  backgroundAnimationTicking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!backgroundAnimationTicking) {
      window.requestAnimationFrame(updateBackgroundOnScroll);
      backgroundAnimationTicking = true;
    }
  },
  { passive: true }
);

// اعمال حالت اولیه بدون نیاز به اسکرول
updateBackgroundOnScroll();
