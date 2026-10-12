"use strict";

const KEY = "mesbah_store_v1";

// استبدل القيم التالية ببيانات الحساب المخصص لاستقبال التحويلات.
const BANK_TRANSFER = {
  bank: "مصرف الراجحي",
  beneficiary: " أصيل عبدالعزيز بن عبدالكريم التويجري",
  iban: " SA19 8000 0192 6080 1623 2256  "
};

const demoProducts = [
  {
    id: "p1", name: "مسباح حجر العقيق", category: "مسابيح",
    price: 180, oldPrice: 220, stock: 12, featured: true,
    description: "مسباح أنيق من حجر العقيق، بتفاصيل مصقولة ولمسة كلاسيكية.",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "p2", name: "مسباح خشب الصندل", category: "مسابيح",
    price: 145, oldPrice: 0, stock: 8, featured: true,
    description: "حبات خشبية ناعمة بتصميم بسيط وأنيق.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "p3", name: "علبة هدايا فاخرة", category: "هدايا",
    price: 75, oldPrice: 95, stock: 20, featured: true,
    description: "علبة هدايا أنيقة لتقديم المسباح بطريقة مميزة.",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "p4", name: "مسباح حجر طبيعي", category: "مسابيح",
    price: 210, oldPrice: 0, stock: 6, featured: false,
    description: "تصميم متوازن وحبات مصقولة بعناية.",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "p5", name: "حامل مسباح مكتبي", category: "إكسسوارات",
    price: 55, oldPrice: 69, stock: 15, featured: false,
    description: "حامل عملي وأنيق لحفظ المسباح في المنزل أو المكتب.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "p6", name: "طقم مسباح وإهداء", category: "هدايا",
    price: 275, oldPrice: 320, stock: 5, featured: true,
    description: "طقم هدية متكامل بتغليف أنيق وتفاصيل مختارة بعناية.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85"
  }
];

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && Array.isArray(saved.products)) {
      return {
        products: saved.products,
        cart: saved.cart || [],
        orders: saved.orders || [],
        admin: saved.admin || false
      };
    }
  } catch (_) {}

  const initial = { products: demoProducts, cart: [], orders: [], admin: false };
  saveData(initial);
  return initial;
}

let db = loadData();
const app = document.getElementById("app");

function saveData(data = db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (_) {
    toast("تعذر الحفظ. قد تكون مساحة التخزين ممتلئة.");
  }
}

function money(value) {
  return `${Number(value || 0).toLocaleString("ar-SA")} ر.س`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 2500);
}

function updateCartCount() {
  document.getElementById("cart-count").textContent =
    db.cart.reduce((sum, item) => sum + item.qty, 0);
}

function route() {
  const [page, arg] = (location.hash.slice(1) || "home").split("/");
  document.querySelector(".main-nav").classList.remove("open");

  if (page === "products") renderProducts();
  else if (page === "product") renderDetail(arg);
  else if (page === "cart") renderCart();
  else if (page === "checkout") renderCheckout();
  else if (page === "tracking") renderTracking(arg);
  else if (page === "contact") renderContact();
  else if (page === "policies") renderPolicies();
  else if (page === "admin") renderAdmin();
  else renderHome();

  window.scrollTo(0, 0);
}

function productCard(product) {
  return `
    <article class="product-card">
      <a href="#product/${encodeURIComponent(product.id)}">
        <img class="product-image"
          src="${escapeHtml(product.image)}"
          alt="${escapeHtml(product.name)}"
          loading="lazy"
          onerror="this.src='https://placehold.co/800x600/f1efe8/173b30?text=Mesbah'">
      </a>
      <div class="product-info">
        <span class="badge">${escapeHtml(product.category)}</span>
        <h3><a href="#product/${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h3>
        <div class="price-row">
          <span class="price">${money(product.price)}</span>
          ${product.oldPrice > product.price
            ? `<span class="old-price">${money(product.oldPrice)}</span>` : ""}
        </div>
        <button class="button small" data-add="${escapeHtml(product.id)}"
          ${product.stock <= 0 ? "disabled" : ""}>
          ${product.stock > 0 ? "أضف إلى السلة" : "نفد المخزون"}
        </button>
      </div>
    </article>`;
}

function renderHome() {
  const featured = db.products.filter(product => product.featured).slice(0, 4);
  const deals = db.products.filter(product => product.oldPrice > product.price).slice(0, 4);

  app.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <span class="eyebrow">تفاصيل صغيرة، فرق كبير</span>
        <h1>أناقة تليق<br>بذوقك</h1>
        <p>اكتشف تشكيلة مسباح المختارة بعناية، بتصاميم تجمع بين الأصالة والأناقة.</p>
        <a class="button gold" href="#products">تسوق المنتجات</a>
      </div>
    </section>

    <div class="section-head">
      <div><h2>الأكثر مبيعًا</h2><p>منتجات مختارة لعملائنا</p></div>
      <a href="#products">عرض الكل ←</a>
    </div>
    <div class="product-grid">
      ${featured.map(productCard).join("") || "<p>لا توجد منتجات بعد.</p>"}
    </div>

    <div class="section-head">
      <div><h2>عروض مميزة</h2><p>أسعار خاصة لفترة محدودة</p></div>
    </div>
    <div class="product-grid">
      ${deals.map(productCard).join("") || "<p>لا توجد عروض حاليًا.</p>"}
    </div>`;
}

function renderProducts() {
  const categories = [...new Set(db.products.map(product => product.category).filter(Boolean))];

  app.innerHTML = `
    <h1 class="page-title">جميع المنتجات</h1>
    <p class="muted">تصفح المجموعة واختر ما يناسبك.</p>
    <div class="filters">
      <input id="search" placeholder="ابحث عن منتج..." aria-label="بحث">
      <select id="category">
        <option value="">كل التصنيفات</option>
        ${categories.map(category => `<option>${escapeHtml(category)}</option>`).join("")}
      </select>
      <select id="sort">
        <option value="">ترتيب افتراضي</option>
        <option value="low">السعر: الأقل أولًا</option>
        <option value="high">السعر: الأعلى أولًا</option>
        <option value="name">الاسم</option>
      </select>
    </div>
    <div id="listing" class="product-grid"></div>`;

  const draw = () => {
    let products = [...db.products];
    const query = document.getElementById("search").value.trim().toLowerCase();
    const category = document.getElementById("category").value;
    const sort = document.getElementById("sort").value;

    products = products.filter(product =>
      (!query || `${product.name} ${product.description}`.toLowerCase().includes(query)) &&
      (!category || product.category === category)
    );

    if (sort === "low") products.sort((a, b) => a.price - b.price);
    if (sort === "high") products.sort((a, b) => b.price - a.price);
    if (sort === "name") products.sort((a, b) => a.name.localeCompare(b.name, "ar"));

    document.getElementById("listing").innerHTML =
      products.map(productCard).join("") || `<div class="empty">لا توجد منتجات مطابقة.</div>`;
  };

  ["search", "category", "sort"].forEach(id =>
    document.getElementById(id).addEventListener("input", draw)
  );
  draw();
}

function renderDetail(id) {
  const product = db.products.find(item => item.id === decodeURIComponent(id || ""));

  if (!product) {
    app.innerHTML = `<div class="empty">المنتج غير موجود. <a href="#products">العودة للمنتجات</a></div>`;
    return;
  }

  app.innerHTML = `
    <div class="product-detail">
      <img class="detail-image" src="${escapeHtml(product.image)}"
        alt="${escapeHtml(product.name)}">
      <div class="detail-copy">
        <span class="badge">${escapeHtml(product.category)}</span>
        <h1>${escapeHtml(product.name)}</h1>
        <div class="price-row">
          <span class="price">${money(product.price)}</span>
          ${product.oldPrice > product.price
            ? `<span class="old-price">${money(product.oldPrice)}</span>` : ""}
        </div>
        <p>${escapeHtml(product.description)}</p>
        <p>المتوفر: ${product.stock} قطعة</p>
        <button class="button" data-add="${escapeHtml(product.id)}"
          ${product.stock <= 0 ? "disabled" : ""}>أضف إلى السلة</button>
      </div>
    </div>`;
}

function addToCart(id) {
  const product = db.products.find(item => item.id === id);
  if (!product || product.stock < 1) return toast("المنتج غير متوفر.");

  const item = db.cart.find(entry => entry.id === id);
  if (item) {
    if (item.qty >= product.stock) return toast("وصلت للكمية المتوفرة.");
    item.qty++;
  } else {
    db.cart.push({ id, qty: 1 });
  }

  saveData();
  updateCartCount();
  toast("أضيف المنتج إلى السلة.");
}

function cartItems() {
  return db.cart
    .map(item => ({ ...item, product: db.products.find(p => p.id === item.id) }))
    .filter(item => item.product);
}

function totals() {
  const subtotal = cartItems().reduce(
    (sum, item) => sum + item.product.price * item.qty, 0
  );
  const shipping = subtotal === 0 || subtotal >= 300 ? 0 : 25;
  return { subtotal, shipping, total: subtotal + shipping };
}

function renderCart() {
  const items = cartItems();
  const total = totals();

  app.innerHTML = `
    <h1 class="page-title">سلة المشتريات</h1>
    ${items.length ? items.map(item => `
      <div class="cart-row">
        <img src="${escapeHtml(item.product.image)}" alt="${escapeHtml(item.product.name)}">
        <div>
          <h3>${escapeHtml(item.product.name)}</h3>
          <span class="price">${money(item.product.price)}</span>
        </div>
        <div class="quantity">
          <button data-qty="${escapeHtml(item.id)}" data-delta="-1" aria-label="تقليل">−</button>
          <span>${item.qty}</span>
          <button data-qty="${escapeHtml(item.id)}" data-delta="1" aria-label="زيادة">+</button>
        </div>
        <button class="button danger small remove" data-remove="${escapeHtml(item.id)}">حذف</button>
      </div>`).join("")
      : `<div class="empty">سلتك فارغة. <a href="#products">ابدأ التسوق</a></div>`}

    ${items.length ? `
      <div class="summary">
        <div class="summary-line"><span>المجموع</span><span>${money(total.subtotal)}</span></div>
        <div class="summary-line"><span>الشحن</span><span>${total.shipping ? money(total.shipping) : "مجاني"}</span></div>
        <div class="summary-line total"><span>الإجمالي</span><span>${money(total.total)}</span></div>
        <p class="muted">الشحن مجاني للطلبات بقيمة 300 ر.س أو أكثر.</p>
        <a href="#checkout" class="button">متابعة إتمام الطلب</a>
      </div>` : ""}`;
}

function renderCheckout() {
  if (!db.cart.length) {
    app.innerHTML = `<div class="empty">سلتك فارغة. <a href="#products">تسوق الآن</a></div>`;
    return;
  }

  const total = totals();

  app.innerHTML = `
    <h1 class="page-title">إتمام الطلب</h1>
    <div class="notice">
      طريقة الدفع الوحيدة هي التحويل البنكي إلى مصرف الراجحي.
      يجب على صاحب المتجر التحقق من وصول المبلغ يدويًا؛ لا يتم تأكيد الدفع تلقائيًا.
    </div>

    <div class="checkout-layout">
      <form id="checkout-form" class="panel">
        <h2>بيانات التوصيل</h2>
        <div class="form-grid">
          <div class="form-group">
            <label for="customer">الاسم الكامل</label>
            <input id="customer" required maxlength="100">
          </div>
          <div class="form-group">
            <label for="phone">رقم الجوال</label>
            <input id="phone" required type="tel"
              pattern="[0-9+\\s-]{8,16}" placeholder="05xxxxxxxx">
          </div>
          <div class="form-group">
            <label for="city">المدينة</label>
            <input id="city" required>
          </div>
          <div class="form-group">
            <label for="address">العنوان بالتفصيل</label>
            <input id="address" required>
          </div>
          <div class="form-group full">
            <label>طريقة الدفع</label>
            <input value="تحويل بنكي إلى مصرف الراجحي" readonly>
          </div>
          <div class="form-group full notice">
            <strong>بيانات التحويل البنكي</strong><br>
            البنك: ${escapeHtml(BANK_TRANSFER.bank)}<br>
            اسم المستفيد: ${escapeHtml(BANK_TRANSFER.beneficiary)}<br>
            الآيبان: <bdi>${escapeHtml(BANK_TRANSFER.iban)}</bdi><br>
            حوّل مبلغ الطلب الموضح بجانب النموذج، واحتفظ بإشعار التحويل.
            لا تشارك كلمة مرورك أو بيانات الدخول إلى حسابك البنكي.
          </div>
        </div>
        <button class="button" type="submit">تأكيد الطلب</button>
      </form>

      <aside class="summary">
        <h3>ملخص الطلب</h3>
        <div class="summary-line"><span>المنتجات</span><span>${money(total.subtotal)}</span></div>
        <div class="summary-line"><span>الشحن</span><span>${total.shipping ? money(total.shipping) : "مجاني"}</span></div>
        <div class="summary-line total">
          <span>الإجمالي المطلوب تحويله</span><span>${money(total.total)}</span>
        </div>
      </aside>
    </div>`;

  document.getElementById("checkout-form").onsubmit = event => {
    event.preventDefault();

    const order = {
      id: "MSB-" + Date.now().toString().slice(-8),
      date: new Date().toISOString(),
      customer: document.getElementById("customer").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      city: document.getElementById("city").value.trim(),
      address: document.getElementById("address").value.trim(),
      payment: "تحويل بنكي - الراجحي",
      paymentStatus: "بانتظار التحقق من التحويل",
      items: cartItems().map(item => ({
        id: item.id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty
      })),
      total: total.total,
      status: "جديد"
    };

    db.orders.push(order);

    order.items.forEach(item => {
      const product = db.products.find(p => p.id === item.id);
      if (product) product.stock = Math.max(0, product.stock - item.qty);
    });

    db.cart = [];
    saveData();
    updateCartCount();

    app.innerHTML = `
      <div class="panel">
        <h1>تم تسجيل طلبك، ${escapeHtml(order.customer)}!</h1>
        <p>رقم الطلب: <strong>${escapeHtml(order.id)}</strong></p>
        <p>المبلغ المطلوب تحويله: <strong>${money(order.total)}</strong></p>
        <div class="notice">
          <strong>بيانات التحويل</strong><br>
          البنك: ${escapeHtml(BANK_TRANSFER.bank)}<br>
          اسم المستفيد: ${escapeHtml(BANK_TRANSFER.beneficiary)}<br>
          الآيبان: <bdi>${escapeHtml(BANK_TRANSFER.iban)}</bdi><br><br>
          حالة الدفع: بانتظار التحقق من التحويل. لا يُعتبر الطلب مدفوعًا
          حتى يتأكد صاحب المتجر من وصول المبلغ إلى الحساب.
        </div>
        <p>احتفظ برقم الطلب لمتابعته.</p>
        <a class="button" href="#tracking/${encodeURIComponent(order.id)}">تتبع الطلب</a>
      </div>`;
  };
}

function renderTracking(id) {
  app.innerHTML = `
    <h1 class="page-title">تتبع الطلب</h1>
    <p class="muted">أدخل رقم الطلب الذي ظهر لك بعد تأكيده.</p>
    <form id="track-form" class="panel">
      <div class="form-group">
        <label for="order-id">رقم الطلب</label>
        <input id="order-id" required value="${escapeHtml(id ? decodeURIComponent(id) : "")}"
          placeholder="MSB-12345678">
      </div>
      <button class="button">بحث عن الطلب</button>
      <div id="track-result"></div>
    </form>`;

  document.getElementById("track-form").onsubmit = event => {
    event.preventDefault();
    const value = document.getElementById("order-id").value.trim();
    const order = db.orders.find(item => item.id.toLowerCase() === value.toLowerCase());
    const result = document.getElementById("track-result");

    result.innerHTML = order
      ? `<div class="summary">
          <h3>الطلب ${escapeHtml(order.id)}</h3>
          <p>حالة الطلب: <strong>${escapeHtml(order.status)}</strong></p>
          <p>حالة الدفع: <strong>${escapeHtml(order.paymentStatus || "بانتظار التحقق من التحويل")}</strong></p>
          <p>المدينة: ${escapeHtml(order.city)} — الإجمالي: ${money(order.total)}</p>
        </div>`
      : `<p class="muted">لم نعثر على طلب بهذا الرقم في بيانات هذا المتصفح.</p>`;
  };

  if (id) document.getElementById("track-form").requestSubmit();
}

function renderContact() {
  app.innerHTML = `
    <h1 class="page-title">تواصل معنا</h1>
    <p class="muted">يسعدنا استقبال رسالتك واستفساراتك.</p>
    <form id="contact-form" class="panel">
      <div class="form-grid">
        <div class="form-group"><label>الاسم</label><input required></div>
        <div class="form-group"><label>البريد الإلكتروني</label><input type="email" required></div>
        <div class="form-group full"><label>رسالتك</label><textarea required></textarea></div>
      </div>
      <button class="button">إرسال الرسالة</button>
      <p class="muted">  النموذج في مشكله.</p>
       <br><p class="muted">تواصل على ارقم: 0559750395 </p>
    </form>`;

  document.getElementById("contact-form").onsubmit = event => {
    event.preventDefault();
    event.target.reset();
    toast("شكرًا لك! النموذج تجريبي ولم تُرسل الرسالة.");
  };
}

function renderPolicies() {
  app.innerHTML = `
    <h1 class="page-title">السياسات</h1>
    <section class="panel">
      <h2>الخصوصية</h2>
      <p>في النسخة التجريبية تحفظ بيانات المنتجات والسلة والطلبات محليًا في متصفحك. لا تستخدم بيانات شخصية حقيقية؛ فالبيانات المحلية ليست قاعدة بيانات آمنة ولا تُزامن بين الأجهزة.</p>
      <h2>الاستبدال والاسترجاع</h2>
      <p>أضف سياسة نهائية واضحة تشمل المدد والشروط وآلية التواصل قبل تشغيل المتجر للعملاء.</p>
      <h2>الشحن والدفع</h2>
      <p>رسوم الشحن التجريبية 25 ر.س، ومجانية للطلبات التي تبلغ 300 ر.س أو أكثر. الدفع بتحويل بنكي يدوي، ويتطلب التحقق من وصول المبلغ للحساب.</p>
    </section>`;
}

function renderAdmin() {
  if (!db.admin) {
    app.innerHTML = `
      <h1 class="page-title">دخول الإدارة</h1>
      <form id="login" class="panel" style="max-width:480px">
        
        <div class="form-group">
          <label for="admin-pass">كلمة المرور </label>
          <input id="admin-pass" type="password" required>
        </div>
        <button class="button">دخول</button>
      </form>`;

    document.getElementById("login").onsubmit = event => {
      event.preventDefault();
      if (document.getElementById("admin-pass").value === "aseel") {
        db.admin = true;
        saveData();
        renderAdmin();
      } else {
        toast("كلمة المرور غير صحيحة.");
      }
    };
    return;
  }

  const sales = db.orders.reduce((sum, order) => sum + order.total, 0);

  app.innerHTML = `
    <h1 class="page-title">لوحة الإدارة</h1>
    <p class="notice">لوحة تجريبية محفوظة على هذا الجهاز. يلزم خادم لتأمين الحساب وإدارة طلبات العملاء فعليًا.</p>
    <div class="stats">
      <div class="stat">إجمالي المبيعات<strong>${money(sales)}</strong></div>
      <div class="stat">الطلبات<strong>${db.orders.length}</strong></div>
      <div class="stat">المنتجات<strong>${db.products.length}</strong></div>
    </div>
    <div class="admin-tabs">
      <button class="button small" id="show-products">إدارة المنتجات</button>
      <button class="button outline small" id="show-orders">الطلبات</button>
      <button class="button danger small" id="logout">تسجيل الخروج</button>
    </div>
    <div id="admin-content"></div>`;

  document.getElementById("show-products").onclick = renderAdminProducts;
  document.getElementById("show-orders").onclick = renderAdminOrders;
  document.getElementById("logout").onclick = () => {
    db.admin = false;
    saveData();
    renderAdmin();
  };

  renderAdminProducts();
}

function renderAdminProducts() {
  const content = document.getElementById("admin-content");
  content.innerHTML = `
    <div class="section-head"><div><h2>إدارة المنتجات</h2></div></div>
    <form id="product-form" class="panel">
      <input type="hidden" id="edit-id">
      <div class="form-grid">
        <div class="form-group"><label>اسم المنتج</label><input id="p-name" required></div>
        <div class="form-group"><label>التصنيف</label><input id="p-category" required></div>
        <div class="form-group"><label>السعر (ر.س)</label><input id="p-price" type="number" min="0" step=".01" required></div>
        <div class="form-group"><label>السعر قبل الخصم</label><input id="p-old" type="number" min="0" step=".01"></div>
        <div class="form-group"><label>الكمية المتوفرة</label><input id="p-stock" type="number" min="0" required></div>
        <div class="form-group">
          <label>صورة المنتج</label>
          <input id="p-image-file" type="file" accept="image/*">
          <input id="p-image-url" placeholder="أو ضع رابط الصورة">
        </div>
        <div class="form-group full"><label>الوصف</label><textarea id="p-desc" required></textarea></div>
      </div>
      <button class="button">حفظ المنتج</button>
      <button class="button outline" type="reset" id="cancel-edit">إلغاء التعديل</button>
    </form>
    <div class="table-wrap">
      <table>
        <thead><tr><th>المنتج</th><th>السعر</th><th>المخزون</th><th>إجراءات</th></tr></thead>
        <tbody>
          ${db.products.map(product => `
            <tr>
              <td>${escapeHtml(product.name)}</td>
              <td>${money(product.price)}</td>
              <td>${product.stock}</td>
              <td>
                <button class="button small" data-edit="${escapeHtml(product.id)}">تعديل</button>
                <button class="button danger small" data-delete="${escapeHtml(product.id)}">حذف</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;

  document.getElementById("cancel-edit").onclick = () => {
    setTimeout(() => { document.getElementById("edit-id").value = ""; }, 0);
  };

  document.getElementById("product-form").onsubmit = async event => {
    event.preventDefault();

    const id = document.getElementById("edit-id").value;
    const existing = db.products.find(product => product.id === id);
    let image = document.getElementById("p-image-url").value.trim();
    const file = document.getElementById("p-image-file").files[0];

    if (file) {
      if (file.size > 700000) {
        toast("اختر صورة أقل من 700 كيلوبايت للتخزين المحلي.");
        return;
      }
      image = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    const product = {
      id: id || "p" + Date.now(),
      name: document.getElementById("p-name").value.trim(),
      category: document.getElementById("p-category").value.trim(),
      price: Number(document.getElementById("p-price").value),
      oldPrice: Number(document.getElementById("p-old").value) || 0,
      stock: Number(document.getElementById("p-stock").value),
      description: document.getElementById("p-desc").value.trim(),
      image: image || (existing && existing.image) ||
        "https://placehold.co/800x600/f1efe8/173b30?text=Mesbah",
      featured: existing ? existing.featured : false
    };

    if (id) {
      db.products = db.products.map(item => item.id === id ? product : item);
    } else {
      db.products.unshift(product);
    }

    saveData();
    toast("تم حفظ المنتج.");
    renderAdmin();
  };

  document.querySelectorAll("[data-edit]").forEach(button => {
    button.onclick = () => {
      const product = db.products.find(item => item.id === button.dataset.edit);
      if (!product) return;

      document.getElementById("edit-id").value = product.id;
      document.getElementById("p-name").value = product.name;
      document.getElementById("p-category").value = product.category;
      document.getElementById("p-price").value = product.price;
      document.getElementById("p-old").value = product.oldPrice || "";
      document.getElementById("p-stock").value = product.stock;
      document.getElementById("p-desc").value = product.description;
      document.getElementById("p-image-url").value =
        product.image.startsWith("data:") ? "" : product.image;

      document.getElementById("product-form").scrollIntoView({ behavior: "smooth" });
    };
  });

  document.querySelectorAll("[data-delete]").forEach(button => {
    button.onclick = () => {
      if (!confirm("هل تريد حذف هذا المنتج؟")) return;

      db.products = db.products.filter(item => item.id !== button.dataset.delete);
      db.cart = db.cart.filter(item => item.id !== button.dataset.delete);
      saveData();
      updateCartCount();
      renderAdmin();
      toast("تم حذف المنتج.");
    };
  });
}

function renderAdminOrders() {
  const content = document.getElementById("admin-content");

  content.innerHTML = `
    <h2>الطلبات</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>رقم الطلب</th>
            <th>العميل</th>
            <th>الإجمالي</th>
            <th>حالة الطلب</th>
            <th>حالة الدفع</th>
            <th>تحديث الطلب</th>
            <th>تأكيد التحويل</th>
          </tr>
        </thead>
        <tbody>
          ${db.orders.map(order => `
            <tr>
              <td>${escapeHtml(order.id)}</td>
              <td>${escapeHtml(order.customer)}<br>${escapeHtml(order.phone)}</td>
              <td>${money(order.total)}</td>
              <td>${escapeHtml(order.status)}</td>
              <td>${escapeHtml(order.paymentStatus || "بانتظار التحقق من التحويل")}</td>
              <td>
                <select data-status="${escapeHtml(order.id)}">
                  ${["جديد", "قيد التجهيز", "تم الشحن", "مكتمل"].map(status =>
                    `<option ${order.status === status ? "selected" : ""}>${status}</option>`
                  ).join("")}
                </select>
              </td>
              <td>
                <button class="button small" data-payment="${escapeHtml(order.id)}">
                  تأكيد وصول التحويل
                </button>
              </td>
            </tr>`).join("") ||
            `<tr><td colspan="7">لا توجد طلبات حتى الآن.</td></tr>`}
        </tbody>
      </table>
    </div>
    <p class="notice">اضغط «تأكيد وصول التحويل» بعد التحقق من حسابك البنكي بنفسك.</p>`;

  document.querySelectorAll("[data-status]").forEach(select => {
    select.onchange = () => {
      const order = db.orders.find(item => item.id === select.dataset.status);
      if (order) order.status = select.value;
      saveData();
      toast("تم تحديث حالة الطلب.");
    };
  });

  document.querySelectorAll("[data-payment]").forEach(button => {
    button.onclick = () => {
      const order = db.orders.find(item => item.id === button.dataset.payment);
      if (!order) return;

      if (!confirm("هل تحققت من وصول مبلغ هذا الطلب إلى حسابك البنكي؟")) return;

      order.paymentStatus = "تم التحقق من التحويل يدويًا";
      saveData();
      renderAdminOrders();
      toast("تم تحديث حالة الدفع.");
    };
  });
}

document.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) addToCart(addButton.dataset.add);

  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    db.cart = db.cart.filter(item => item.id !== removeButton.dataset.remove);
    saveData();
    updateCartCount();
    renderCart();
  }

  const quantityButton = event.target.closest("[data-qty]");
  if (quantityButton) {
    const item = db.cart.find(entry => entry.id === quantityButton.dataset.qty);
    const product = db.products.find(entry => entry.id === quantityButton.dataset.qty);

    if (item && product) {
      item.qty += Number(quantityButton.dataset.delta);

      if (item.qty < 1) {
        db.cart = db.cart.filter(entry => entry.id !== item.id);
      } else if (item.qty > product.stock) {
        item.qty = product.stock;
        toast("لا توجد كمية إضافية في المخزون.");
      }
    }

    saveData();
    updateCartCount();
    renderCart();
  }
});

document.getElementById("menu-button").onclick = () => {
  document.querySelector(".main-nav").classList.toggle("open");
};

window.addEventListener("hashchange", route);
document.getElementById("year").textContent = new Date().getFullYear();
updateCartCount();
route();
