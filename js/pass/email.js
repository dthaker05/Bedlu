/**
 * Navratri Event Management Platform - Digital Pass Email Dispatch Simulator
 */
class EmailService {
  static lastDispatchedEmail = null;

  static sendPassEmail(registration, passes, payment) {
    const passHtmlList = passes.map(p => `
      <div style="background: #1e0f35; border: 1px solid #ffd700; padding: 15px; margin-bottom: 12px; border-radius: 8px; color: #fff;">
        <h4 style="color: #ffd700; margin: 0 0 5px 0;">🎫 ${p.tier_title}</h4>
        <p style="margin: 3px 0; font-size: 13px;"><strong>Pass ID:</strong> <code>${p.pass_id}</code></p>
        <p style="margin: 3px 0; font-size: 13px;"><strong>Attendee:</strong> ${p.user_name}</p>
        <p style="margin: 3px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">VALID FOR GATE ENTRY</span></p>
        <p style="margin: 3px 0; font-size: 12px; color: #aaa;"><strong>QR Security Hash:</strong> ${p.security_hash.substring(0, 16)}...</p>
      </div>
    `).join('');

    const fullHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #0b0518; padding: 25px; color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 2px solid #ffd700;">
        <div style="text-align: center; border-bottom: 1px solid rgba(255,215,0,0.3); padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #ffd700; margin: 0; font-size: 24px;">💃 Maha Garba Mahotsav 2026 🕺</h2>
          <p style="color: #e91e63; font-weight: bold; margin: 5px 0 0 0;">Official Digital Pass Confirmation</p>
        </div>

        <p>Dear <strong>${registration.attendee_name}</strong>,</p>
        <p>Thank you for booking your passes! Your payment of <strong>₹${payment.amount.toLocaleString()}</strong> via ${payment.method} has been verified successfully.</p>

        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top:0; color:#ffd700;">Transaction Summary</h3>
          <p style="margin:4px 0;"><strong>Registration Ref:</strong> ${registration.id}</p>
          <p style="margin:4px 0;"><strong>Razorpay Payment ID:</strong> <code>${payment.payment_id}</code></p>
          <p style="margin:4px 0;"><strong>Venue:</strong> Royal Garba Grounds, SG Highway, Ahmedabad</p>
          <p style="margin:4px 0;"><strong>Event Dates:</strong> October 10 - October 18, 2026 (7:00 PM onwards)</p>
        </div>

        <h3 style="color:#ffd700;">Your Digital QR Passes (${passes.length}):</h3>
        ${passHtmlList}

        <div style="background: rgba(230, 57, 70, 0.2); border-left: 4px solid #e63946; padding: 12px; margin-top: 20px; font-size: 13px;">
          <strong>Important Gate Entry Rules:</strong>
          <ul style="margin: 5px 0 0 20px; padding: 0;">
            <li>Show the digital QR pass on your phone or print at Gate 01.</li>
            <li>Each QR code is strictly <strong>one-time entry</strong>. Duplicate scans will trigger security alerts.</li>
            <li>Government-issued photo ID match required at entrance.</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #888;">
          Maha Garba Mahotsav 2026 • Secure Ticketing Powered by Razorpay & WebCrypto
        </div>
      </div>
    `;

    this.lastDispatchedEmail = {
      to: registration.attendee_email,
      subject: `🎉 Your Digital Garba Passes are Ready! [Ref: ${registration.id}]`,
      sentAt: new Date().toLocaleString(),
      htmlContent: fullHtml,
      passesCount: passes.length
    };

    // Live EmailJS dispatch if configured
    if (typeof emailjs !== 'undefined' && window.EMAILJS_CONFIG && window.EMAILJS_CONFIG.publicKey) {
      try {
        emailjs.send(
          window.EMAILJS_CONFIG.serviceId,
          window.EMAILJS_CONFIG.templateId,
          {
            to_email: registration.attendee_email,
            to_name: registration.attendee_name,
            reg_id: registration.id,
            payment_id: payment.payment_id,
            amount: payment.amount,
            pass_ids: passes.map(p => p.pass_id).join(", "),
            message_html: fullHtml
          },
          window.EMAILJS_CONFIG.publicKey
        ).then(() => {
          console.log(`📧 Live EmailJS email sent to ${registration.attendee_email}`);
        }).catch(err => console.error("EmailJS dispatch error:", err));
      } catch (e) {
        console.warn("EmailJS send exception:", e);
      }
    }

    db.addAuditLog({
      event_type: "EMAIL_PASSES_DISPATCHED",
      actor: "Transactional Email Engine",
      details: `Digital QR pass email dispatched to ${registration.attendee_email} containing ${passes.length} tickets.`,
      severity: "INFO"
    });

    return this.lastDispatchedEmail;
  }
}
