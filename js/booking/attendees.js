/**
 * Navratri Event Management Platform - Attendee Data & Pass Allocation Manager
 */
class AttendeeManager {
  static formatAttendeeRecord(name, email, phone) {
    return {
      name: name ? name.trim() : "",
      email: email ? email.trim().toLowerCase() : "",
      phone: phone ? phone.trim() : ""
    };
  }

  static generatePassNames(primaryName, quantity) {
    const names = [];
    for (let i = 1; i <= quantity; i++) {
      names.push(quantity === 1 ? primaryName : `${primaryName} (Pass #${i})`);
    }
    return names;
  }
}
