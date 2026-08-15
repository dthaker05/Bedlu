/**
 * Navratri Event Management Platform - Booking & Form Validation Utilities
 */
class ValidationEngine {
  static validateEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

  static validatePhone(phone) {
    if (!phone) return false;
    const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
    return cleaned.length >= 10 && /^\d+$/.test(cleaned);
  }

  static validateAttendeeDetails(name, email, phone) {
    if (!name || !name.trim()) return { isValid: false, message: "Full Name is required." };
    if (!this.validateEmail(email)) return { isValid: false, message: "A valid Email Address is required." };
    if (!this.validatePhone(phone)) return { isValid: false, message: "A valid 10-digit Phone Number is required." };
    return { isValid: true };
  }

  static validateLoginForm(email, password) {
    if (!email || !email.trim()) return { isValid: false, message: "Email is required." };
    if (!password) return { isValid: false, message: "Password is required." };
    return { isValid: true };
  }

  static validateRegistrationForm(name, email, phone, password) {
    const detailsVal = this.validateAttendeeDetails(name, email, phone);
    if (!detailsVal.isValid) return detailsVal;
    if (!password || password.length < 4) return { isValid: false, message: "Password must be at least 4 characters long." };
    return { isValid: true };
  }
}
