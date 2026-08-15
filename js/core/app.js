/**
 * Navratri Event Management Platform - Main Application Controller
 * Strict Authentication Wall Implementation.
 */
class NavratriApp {
  constructor() {
    this.currentView = "home";
    this.pendingView = null;
    this.protectedViews = ["booking", "admin", "scanner", "my-bookings"];
    this.activePassesModal = [];
  }

  init() {
    this.setupNavigation();
    this.startCountdown();
    if (typeof bookingManager !== 'undefined') {
      bookingManager.setupBookingForm();
    }
    this.setupGalleryFilters();
    this.setupScannerUI();
    this.setupBlueprintTools();
    this.setupScrollListeners();
    this.updateAuthUI();

    const hash = window.location.hash.replace("#", "");
    this.switchView(hash || "home");

    // ☁️ Sync latest pass data from Supabase cloud on every page load
    db.syncFromCloud().catch(e => console.warn("Cloud sync skipped:", e));
  }

  setupScrollListeners() {
    window.addEventListener("scroll", () => {
      // 1. Top Scroll Progress Bar
      const progressBar = document.getElementById("scroll-progress-bar");
      if (progressBar) {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progressBar.style.width = `${progress}%`;
      }

      // 2. Back to Top Button
      const backToTopBtn = document.getElementById("back-to-top");
      if (backToTopBtn) {
        if (window.scrollY > 400) {
          backToTopBtn.classList.add("visible");
        } else {
          backToTopBtn.classList.remove("visible");
        }
      }

      // 3. Mobile Floating Booking Button
      const mobileFloatingBtn = document.getElementById("mobile-floating-booking-btn");
      if (mobileFloatingBtn) {
        if (window.scrollY > 300) {
          mobileFloatingBtn.classList.add("visible");
        } else {
          mobileFloatingBtn.classList.remove("visible");
        }
      }
    });
  }

  setupNavigation() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".nav-link, .route-btn");
      if (btn) {
        const targetView = btn.getAttribute("data-view");
        if (targetView) {
          e.preventDefault();
          this.switchView(targetView);
        }
      }
    });

    const navToggle = document.getElementById("mobile-nav-toggle");
    const navLinks = document.getElementById("nav-links-wrapper");
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");
      });
    }
  }

  switchView(viewId) {
    const validViews = ["home", "schedule", "past-events", "booking", "scanner", "contact", "admin", "blueprint", "login", "my-bookings"];
    if (!validViews.includes(viewId)) viewId = "home";

    // Guard protected views for unauthenticated users
    if (this.protectedViews.includes(viewId) && !auth.isAuthenticated()) {
      this.pendingView = viewId;
      viewId = "login";
    }

    this.currentView = viewId;
    window.location.hash = viewId;

    // Update active section visibility
    document.querySelectorAll(".page-view").forEach(sec => {
      sec.classList.remove("active");
    });
    const targetSec = document.getElementById(`view-${viewId}`);
    if (targetSec) {
      targetSec.classList.add("active");
    }

    // Update navigation active class
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("data-view") === viewId) {
        link.classList.add("active");
      }
    });

    const navLinks = document.getElementById("nav-links-wrapper");
    if (navLinks) navLinks.classList.remove("open");

    if (viewId === "admin" && typeof adminDashboard !== 'undefined') {
      adminDashboard.init();
    }
    if (viewId === "past-events") {
      this.renderPastEventsGallery();
    }

    this.updateLiveAvailabilityStats();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  updateLiveAvailabilityStats() {
    const totalPassesCap = (typeof NAVRATRI_CONSTANTS !== 'undefined') ? NAVRATRI_CONSTANTS.TOTAL_VENUE_CAPACITY : 1200;
    const metrics = db.getMetrics ? db.getMetrics() : { totalPassesSold: 0 };
    const booked = metrics.totalPassesSold || 0;
    const remaining = Math.max(0, totalPassesCap - booked);
    const percentBooked = Math.min(100, Math.round((booked / totalPassesCap) * 100));

    const capEl = document.getElementById("avail-total-cap");
    const bookedEl = document.getElementById("avail-booked-count");
    const remEl = document.getElementById("avail-remaining-count");
    const ringEl = document.getElementById("avail-progress-ring");
    const ringText = document.getElementById("avail-ring-percentage");

    if (capEl) capEl.innerText = totalPassesCap.toLocaleString();
    if (bookedEl) bookedEl.innerText = booked.toLocaleString();
    if (remEl) remEl.innerText = remaining.toLocaleString();
    if (ringText) ringText.innerText = `${percentBooked}%`;

    if (ringEl) {
      const radius = 54;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = circumference - (percentBooked / 100) * circumference;
      ringEl.style.strokeDasharray = `${circumference}`;
      ringEl.style.strokeDashoffset = `${strokeDashoffset}`;
    }
  }

  // --- Auth UI & Navigation Lock ---
  updateAuthUI() {
    const navLinksWrapper = document.getElementById("nav-links-wrapper");
    const logoutBtnContainer = document.getElementById("auth-nav-action-container");

    const isAuth = auth.isAuthenticated();

    if (navLinksWrapper) {
      navLinksWrapper.style.display = "flex";
    }

    if (logoutBtnContainer) {
      if (isAuth) {
        const roleColors = {
          super_admin: "#ffd700",
          admin: "#a78bfa",
          gate_scanner: "#34d399",
          visitor: "#60a5fa"
        };
        const roleColor = roleColors[auth.currentUser.role] || "#60a5fa";
        const roleLabel = auth.currentUser.role.replace(/_/g, " ").toUpperCase();
        const initials = auth.currentUser.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();

        logoutBtnContainer.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="display:flex; flex-direction:column; align-items:flex-end; line-height:1.2;">
              <span style="font-size:13px; font-weight:600; color:#fff;">${auth.currentUser.name}</span>
              <span style="font-size:10px; font-weight:700; color:${roleColor}; letter-spacing:0.5px;">${roleLabel}</span>
            </div>
            <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,${roleColor}33,${roleColor}66); border:2px solid ${roleColor}; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:${roleColor};">
              ${initials}
            </div>
            <button class="btn btn-secondary btn-sm" onclick="auth.logout()" style="display:flex; align-items:center; gap:5px; padding: 6px 12px;">
              🚪 Logout
            </button>
          </div>
        `;
      } else {
        logoutBtnContainer.innerHTML = `
          <a href="#login" class="btn btn-secondary btn-sm route-btn" data-view="login" style="display:flex; align-items:center; gap:5px; padding: 6px 12px; text-decoration:none;">
            🔑 Sign In
          </a>
        `;
      }
    }

    const adminTab = document.querySelector('.nav-link[data-view="admin"]');
    const scannerTab = document.querySelector('.nav-link[data-view="scanner"]');

    if (adminTab) {
      adminTab.style.display = isAuth && auth.hasPermission("VIEW_ANALYTICS") ? "" : "none";
    }
    if (scannerTab) {
      scannerTab.style.display = isAuth && auth.hasPermission("GATE_SCANNER") ? "" : "none";
    }
  }

  // --- Countdown Timer ---
  startCountdown() {
    const daysEl = document.getElementById("cd-days");
    const hoursEl = document.getElementById("cd-hours");
    const minsEl = document.getElementById("cd-mins");
    const secsEl = document.getElementById("cd-secs");

    if (!daysEl) return;

    const targetDate = new Date(NAVRATRI_CONFIG.startDate).getTime();

    const update = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        daysEl.innerText = "00";
        hoursEl.innerText = "00";
        minsEl.innerText = "00";
        secsEl.innerText = "00";
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      daysEl.innerText = d.toString().padStart(2, '0');
      hoursEl.innerText = h.toString().padStart(2, '0');
      minsEl.innerText = m.toString().padStart(2, '0');
      secsEl.innerText = s.toString().padStart(2, '0');
    };

    update();
    setInterval(update, 1000);
  }

  // --- Festive Synthesized Garba Beat Audio Engine ---
  toggleGarbaMusic() {
    const btn = document.getElementById("audio-toggle-btn");
    if (typeof audioSynthesizer !== 'undefined') {
      audioSynthesizer.toggleGarbaMusic(btn);
    }
  }

  // --- Booking Delegates ---
  openBookingModal(tierId) {
    if (typeof bookingManager !== 'undefined') {
      bookingManager.openBookingModal(tierId);
    }
  }

  closeBookingModal() {
    if (typeof bookingManager !== 'undefined') {
      bookingManager.closeBookingModal();
    }
  }

  showRazorpayModal(order) {
    const rzpModal = document.getElementById("razorpay-simulator-modal");
    if (!rzpModal) return;

    document.getElementById("rzp-order-id").innerText = order.orderId;
    document.getElementById("rzp-amount").innerText = `₹${order.amount.toLocaleString()}`;
    document.getElementById("rzp-attendee").innerText = `${order.attendeeDetails.name} (${order.attendeeDetails.email})`;

    rzpModal.classList.add("open");

    const payBtn = document.getElementById("rzp-pay-confirm-btn");
    payBtn.onclick = async () => {
      payBtn.disabled = true;
      payBtn.innerText = "⏳ Verifying Webhook HMAC Signature...";

      const result = await RazorpayPaymentEngine.processPayment(order);

      payBtn.disabled = false;
      payBtn.innerText = "🔒 Pay Now & Verify Signature";
      rzpModal.classList.remove("open");

      if (result.success) {
        this.showPassIssuedSuccess(result);
      } else {
        alert("Payment Verification Failed: " + result.error);
      }
    };
  }

  showPassIssuedSuccess(result) {
    this.activePassesModal = result.passes;
    const successModal = document.getElementById("pass-issued-modal");
    if (!successModal) return;

    const listContainer = document.getElementById("modal-passes-list");
    listContainer.innerHTML = result.passes.map(p => DigitalPassRenderer.renderPassHTML(p)).join('<hr class="ticket-divider"/>');

    document.getElementById("modal-reg-ref").innerText = result.registration.id;
    document.getElementById("modal-payment-id").innerText = result.payment.payment_id;

    successModal.classList.add("open");
  }

  closePassModal() {
    const successModal = document.getElementById("pass-issued-modal");
    if (successModal) successModal.classList.remove("open");
  }

  openDispatchedEmailDrawer() {
    const emailData = EmailService.lastDispatchedEmail;
    if (!emailData) {
      alert("No email has been dispatched in this session yet.");
      return;
    }

    const drawer = document.getElementById("email-preview-drawer");
    if (!drawer) return;

    document.getElementById("email-to-val").innerText = emailData.to;
    document.getElementById("email-subject-val").innerText = emailData.subject;
    document.getElementById("email-time-val").innerText = emailData.sentAt;
    document.getElementById("email-body-content").innerHTML = emailData.htmlContent;

    drawer.classList.add("open");
  }

  closeEmailDrawer() {
    const drawer = document.getElementById("email-preview-drawer");
    if (drawer) drawer.classList.remove("open");
  }

  // --- Gate Scanner UI Setup ---
  setupScannerUI() {
    const scanBtn = document.getElementById("scanner-manual-submit-btn");
    const scanInput = document.getElementById("scanner-input-code");

    if (scanBtn && scanInput) {
      scanBtn.addEventListener("click", async () => {
        const val = scanInput.value;
        if (!val) return;

        const outcome = await gateScanner.processScanInput(val);
        this.displayScanResult(outcome);
      });
    }

    document.querySelectorAll(".quick-scan-sample-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const sampleCode = e.currentTarget.getAttribute("data-code");
        if (sampleCode && scanInput) {
          scanInput.value = sampleCode;
          const outcome = await gateScanner.processScanInput(sampleCode);
          this.displayScanResult(outcome);
        }
      });
    });
  }

  async handleScanVerify(code) {
    const outcome = await gateScanner.processScanInput(code);
    this.displayScanResult(outcome);
  }

  displayScanResult(outcome) {
    const resultBox = document.getElementById("scanner-result-box");
    if (!resultBox) return;

    let bgClass = "valid";
    if (outcome.status === "DUPLICATE") bgClass = "duplicate";
    if (outcome.status === "INVALID") bgClass = "invalid";

    resultBox.className = `scan-result-card ${bgClass}`;
    resultBox.innerHTML = `
      <div class="result-header">
        <h3>${outcome.title}</h3>
        <span class="status-chip">${outcome.status}</span>
      </div>
      <p class="result-msg">${outcome.message}</p>
      ${outcome.details ? `<div class="result-details"><strong>Alert Details:</strong> ${outcome.details}</div>` : ''}
      ${outcome.pass ? `
        <div class="scanned-pass-meta">
          <div><strong>Pass ID:</strong> <code>${outcome.pass.pass_id}</code></div>
          <div><strong>Attendee:</strong> ${outcome.pass.user_name}</div>
          <div><strong>Tier:</strong> ${outcome.pass.tier_title}</div>
          <div><strong>Phone:</strong> ${outcome.pass.user_phone || 'N/A'}</div>
          <div><strong>Security Hash:</strong> <code>${outcome.pass.security_hash ? outcome.pass.security_hash.substring(0, 16) : ''}...</code></div>
        </div>
      ` : ''}
    `;

    if (this.currentView === "admin" && typeof adminDashboard !== 'undefined') {
      adminDashboard.init();
    }
  }

  // --- Gallery Filters ---
  setupGalleryFilters() {
    document.querySelectorAll(".gallery-filter-chip").forEach(chip => {
      chip.addEventListener("click", (e) => {
        document.querySelectorAll(".gallery-filter-chip").forEach(c => c.classList.remove("active"));
        e.currentTarget.classList.add("active");

        const category = e.currentTarget.getAttribute("data-category");
        this.renderPastEventsGallery(category);
      });
    });
  }

  renderPastEventsGallery(filterCategory = "All") {
    const grid = document.getElementById("past-events-gallery-grid");
    if (!grid) return;

    const items = db.getGallery();
    const filtered = filterCategory === "All" ? items : items.filter(i => i.category === filterCategory);

    grid.innerHTML = filtered.map(item => `
      <div class="gallery-card">
        <div class="gallery-img-wrapper">
          <img src="${item.media_url}" alt="${item.title}" loading="lazy"/>
          <span class="gallery-badge">${item.badge}</span>
        </div>
        <div class="gallery-info">
          <h4>${item.title}</h4>
          <p><small class="text-muted">Navratri ${item.year} • ${item.category}</small></p>
        </div>
      </div>
    `).join('');
  }

  // --- Blueprint Tools ---
  setupBlueprintTools() {
    const hmacTestBtn = document.getElementById("btn-test-hmac");
    if (hmacTestBtn) {
      hmacTestBtn.addEventListener("click", async () => {
        const orderId = document.getElementById("hmac-order-id").value || "order_NVRTR_881921";
        const payId = document.getElementById("hmac-pay-id").value || "pay_NVRTR_7719283";
        const secret = document.getElementById("hmac-secret-id").value || NAVRATRI_CONFIG.security.razorpayKeySecret;

        const res = await CryptoEngine.verifyRazorpayHMAC(orderId, payId, "", secret);
        document.getElementById("hmac-output-hash").value = res.computedSignature;
      });
    }

    const jwtInspectBtn = document.getElementById("btn-inspect-jwt");
    if (jwtInspectBtn) {
      jwtInspectBtn.addEventListener("click", () => {
        const tokenStr = auth.jwtToken;
        const decoded = CryptoEngine.decodeJWT(tokenStr);
        document.getElementById("jwt-json-output").innerText = JSON.stringify(decoded, null, 2);
      });
    }
  }

  // --- Contact Form ---
  handleContactSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("contact-name").value;
    const email = document.getElementById("contact-email").value;
    const subject = document.getElementById("contact-subject").value;
    const message = document.getElementById("contact-message").value;

    db.addContactMessage({ name, email, subject, message });

    alert("Thank you! Your message has been sent successfully. Our team will contact you within 2 hours.");
    document.getElementById("contact-form-element").reset();
  }

  // --- Login / Register Handlers ---
  switchAuthTab(tab) {
    const loginForm = document.getElementById("auth-login-form");
    const regForm = document.getElementById("auth-register-form");
    const loginBtn = document.getElementById("auth-tab-login");
    const regBtn = document.getElementById("auth-tab-register");

    if (!loginForm || !regForm) return;

    if (tab === "login") {
      loginForm.style.display = "block";
      regForm.style.display = "none";
      loginBtn.classList.add("active");
      loginBtn.style.borderBottom = "2px solid var(--primary-gold)";
      regBtn.classList.remove("active");
      regBtn.style.borderBottom = "none";
    } else {
      loginForm.style.display = "none";
      regForm.style.display = "block";
      regBtn.classList.add("active");
      regBtn.style.borderBottom = "2px solid var(--festive-pink)";
      loginBtn.classList.remove("active");
      loginBtn.style.borderBottom = "none";
    }
  }

  redirectAfterAuth() {
    if (this.pendingView) {
      const target = this.pendingView;
      this.pendingView = null;
      this.switchView(target);
    } else {
      this.switchView("home");
    }
  }

  async handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const res = await auth.login(email, password);

    if (res.success) {
      const roleLabel = res.user.role.replace("_", " ").toUpperCase();
      alert(`🎉 Welcome back, ${res.user.name}! Signed in as ${roleLabel}.`);
      this.redirectAfterAuth();
    } else {
      alert("Login failed: " + res.message);
    }
  }

  async handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const phone = document.getElementById("reg-phone").value;
    const password = document.getElementById("reg-password").value;

    const res = await auth.register(name, email, phone, password, "visitor");

    if (res.success) {
      alert(`✨ Account created successfully! Welcome, ${res.user.name}. Access unlocked!`);
      this.redirectAfterAuth();
    } else {
      alert("Registration Error: " + res.message);
    }
  }

  async quickDemoLogin(role) {
    await auth.setRole(role);
    const roleTitle = role.toUpperCase().replace("_", " ");
    alert(`⚡ Authenticated as: ${roleTitle}. Platform Unlocked!`);
    this.redirectAfterAuth();
  }
}

// Instantiate Global App
document.addEventListener("DOMContentLoaded", () => {
  window.app = new NavratriApp();
  window.app.init();
});
