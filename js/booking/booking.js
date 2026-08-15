/**
 * Navratri Event Management Platform - Booking Flow Controller
 */
class BookingManager {
  constructor() {
    this.selectedPassTier = null;
    this.bookingQuantity = 1;
  }

  setupBookingForm() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".select-tier-btn");
      if (btn) {
        const tierId = btn.getAttribute("data-tier");
        this.openBookingModal(tierId);
      }
    });

    const qMinus = document.getElementById("qty-minus");
    const qPlus = document.getElementById("qty-plus");
    const qVal = document.getElementById("qty-val");

    if (qMinus && qPlus && qVal) {
      qMinus.addEventListener("click", () => {
        if (this.bookingQuantity > 1) {
          this.bookingQuantity--;
          qVal.innerText = this.bookingQuantity;
          this.updateBookingSummary();
        }
      });

      qPlus.addEventListener("click", () => {
        if (this.bookingQuantity < 10) {
          this.bookingQuantity++;
          qVal.innerText = this.bookingQuantity;
          this.updateBookingSummary();
        }
      });
    }

    const checkoutBtn = document.getElementById("proceed-razorpay-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => this.handleCheckoutSubmit());
    }
  }

  openBookingModal(tierId) {
    this.selectedPassTier = NAVRATRI_CONFIG.passTiers.find(t => t.id === tierId) || NAVRATRI_CONFIG.passTiers[0];
    this.bookingQuantity = 1;

    const qVal = document.getElementById("qty-val");
    if (qVal) qVal.innerText = "1";

    const modalTitle = document.getElementById("modal-tier-title");
    if (modalTitle) modalTitle.innerText = this.selectedPassTier.name;

    this.updateBookingSummary();

    const modal = document.getElementById("booking-modal");
    if (modal) modal.classList.add("open");
  }

  closeBookingModal() {
    const modal = document.getElementById("booking-modal");
    if (modal) modal.classList.remove("open");
  }

  updateBookingSummary() {
    if (!this.selectedPassTier) return;

    const pricePerTicket = this.selectedPassTier.price;
    const total = pricePerTicket * this.bookingQuantity;

    const unitPriceEl = document.getElementById("summary-unit-price");
    const totalEl = document.getElementById("summary-total-price");

    if (unitPriceEl) unitPriceEl.innerText = `₹${pricePerTicket.toLocaleString()}`;
    if (totalEl) totalEl.innerText = `₹${total.toLocaleString()}`;
  }

  async handleCheckoutSubmit() {
    const nameInput = document.getElementById("attendee-name");
    const emailInput = document.getElementById("attendee-email");
    const phoneInput = document.getElementById("attendee-phone");

    const valResult = ValidationEngine.validateAttendeeDetails(
      nameInput ? nameInput.value : "",
      emailInput ? emailInput.value : "",
      phoneInput ? phoneInput.value : ""
    );

    if (!valResult.isValid) {
      alert(valResult.message);
      return;
    }

    const attendeeDetails = AttendeeManager.formatAttendeeRecord(
      nameInput.value,
      emailInput.value,
      phoneInput.value
    );

    const order = RazorpayPaymentEngine.createOrder(
      this.selectedPassTier.id,
      this.bookingQuantity,
      attendeeDetails
    );

    this.closeBookingModal();
    if (window.app && window.app.showRazorpayModal) {
      window.app.showRazorpayModal(order);
    }
  }
}

const bookingManager = new BookingManager();
