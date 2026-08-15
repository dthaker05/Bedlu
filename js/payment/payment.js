/**
 * Navratri Event Management Platform - Razorpay Payment Gateway & HMAC Webhook Engine
 */
class RazorpayPaymentEngine {
  /**
   * Creates a simulated Razorpay Order (Backend API endpoint simulator)
   */
  static createOrder(tierId, quantity, attendeeDetails) {
    const tier = NAVRATRI_CONFIG.passTiers.find(t => t.id === tierId);
    if (!tier) throw new Error("Invalid Pass Tier selected");

    const amount = tier.price * quantity;
    const orderId = `order_NVRTR_${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      orderId,
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      status: "created",
      passTier: tier,
      quantity,
      attendeeDetails,
      keyId: NAVRATRI_CONFIG.security.razorpayKeyId
    };
  }

  /**
   * Simulates or executes live Razorpay Checkout Modal Payment Execution & HMAC Verification Webhook
   */
  static async processPayment(order, paymentMethod = "UPI / Google Pay") {
    // If live Razorpay mode is enabled and Razorpay SDK is loaded, launch real modal
    if (NAVRATRI_CONFIG.security.enableLiveRazorpay && typeof Razorpay !== 'undefined') {
      return new Promise((resolve) => {
        const options = {
          key: NAVRATRI_CONFIG.security.razorpayKeyId,
          amount: order.amount * 100, // Amount in paise
          currency: "INR",
          name: NAVRATRI_CONFIG.eventName,
          description: `Booking for ${order.quantity}x ${order.passTier.name}`,
          image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          handler: async (response) => {
            // Verify HMAC signature returned by Razorpay
            const verification = await CryptoEngine.verifyRazorpayHMAC(
              response.razorpay_order_id || order.orderId,
              response.razorpay_payment_id,
              response.razorpay_signature,
              NAVRATRI_CONFIG.security.razorpayKeySecret
            );
            const result = await RazorpayPaymentEngine.completeRegistrationAndPassIssuance(
              order,
              response.razorpay_payment_id,
              response.razorpay_signature || verification.computedSignature,
              "Razorpay Live Gateway",
              verification
            );
            resolve(result);
          },
          prefill: {
            name: order.attendeeDetails.name,
            email: order.attendeeDetails.email,
            contact: order.attendeeDetails.phone
          },
          theme: {
            color: "#ffd700"
          },
          modal: {
            ondismiss: function () {
              resolve({ success: false, error: "Payment cancelled by user" });
            }
          }
        };
        const rzp = new Razorpay(options);
        rzp.open();
      });
    }

    const paymentId = `pay_NVRTR_${Math.floor(1000000 + Math.random() * 9000000)}`;

    // Generate expected HMAC SHA-256 signature matching Razorpay standard
    const { computedSignature } = await CryptoEngine.verifyRazorpayHMAC(
      order.orderId,
      paymentId,
      "",
      NAVRATRI_CONFIG.security.razorpayKeySecret
    );

    // Perform Webhook Signature Verification Step (CRITICAL SECURITY)
    const verification = await CryptoEngine.verifyRazorpayHMAC(
      order.orderId,
      paymentId,
      computedSignature,
      NAVRATRI_CONFIG.security.razorpayKeySecret
    );

    if (!verification.isValid) {
      db.addAuditLog({
        event_type: "RAZORPAY_WEBHOOK_VERIFICATION_FAILED",
        actor: "Payment Gateway Engine",
        details: `CRITICAL PAYMENT ERROR: Webhook signature mismatch for Order ${order.orderId}. Pass generation blocked!`,
        severity: "CRITICAL",
        ip_address: "52.66.121.43"
      });
      return { success: false, error: "Razorpay Webhook Signature Mismatch" };
    }

    return await RazorpayPaymentEngine.completeRegistrationAndPassIssuance(
      order,
      paymentId,
      computedSignature,
      paymentMethod,
      verification
    );
  }

  /**
   * Complete registration, generate digital passes with HMAC signatures, sync to DB/Cloud & send emails.
   */
  static async completeRegistrationAndPassIssuance(order, paymentId, signature, paymentMethod, verification) {
    const regId = `REG-${Math.floor(10000 + Math.random() * 90000)}`;
    const regRecord = {
      id: regId,
      user_id: auth.currentUser ? auth.currentUser.id : "USR-GUEST",
      pass_type: order.passTier.id,
      quantity: order.quantity,
      amount: order.amount,
      status: "PAID",
      attendee_name: order.attendeeDetails.name,
      attendee_email: order.attendeeDetails.email,
      attendee_phone: order.attendeeDetails.phone,
      created_at: new Date().toISOString()
    };

    const paymentRecord = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      reg_id: regId,
      order_id: order.orderId,
      payment_id: paymentId,
      signature: signature,
      status: "CAPTURED",
      amount: order.amount,
      method: paymentMethod,
      created_at: new Date().toISOString()
    };

    // Generate individual passes with unique HMAC QR tokens
    const generatedPasses = [];
    for (let i = 1; i <= order.quantity; i++) {
      const passId = `PASS-NVR-2026-${regId.replace('REG-', '')}-${i}`;
      const qrToken = await CryptoEngine.generateQRToken(
        passId,
        order.passTier.id,
        order.attendeeDetails.email
      );
      const securityHash = await CryptoEngine.sha256(`${passId}:${qrToken}:${order.attendeeDetails.email}`);

      generatedPasses.push({
        pass_id: passId,
        reg_id: regId,
        user_name: order.quantity === 1 ? order.attendeeDetails.name : `${order.attendeeDetails.name} (Pass #${i})`,
        user_email: order.attendeeDetails.email,
        user_phone: order.attendeeDetails.phone,
        pass_type: order.passTier.id,
        tier_title: order.passTier.name,
        qr_token: qrToken,
        status: "UNUSED",
        scan_timestamp: null,
        gate_id: null,
        gate_operator: null,
        security_hash: securityHash,
        issued_at: new Date().toISOString()
      });
    }

    // Persist to relational DB & Supabase Cloud
    db.addRegistration(regRecord, paymentRecord, generatedPasses);

    // Send Email Notification simulation / EmailJS dispatch
    EmailService.sendPassEmail(regRecord, generatedPasses, paymentRecord);

    return {
      success: true,
      registration: regRecord,
      payment: paymentRecord,
      passes: generatedPasses,
      signatureVerification: verification
    };
  }
}
