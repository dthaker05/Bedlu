/**
 * Navratri Event Management Platform - Relational DB Simulator
 * Handles local persistence, query execution, indexing, and seed data initialization.
 */
class NavratriDatabase {
  constructor() {
    this.STORAGE_KEY = typeof NAVRATRI_CONSTANTS !== 'undefined' ? NAVRATRI_CONSTANTS.STORAGE_KEY_DB : "NAVRATRI_DB_V1";
    this.data = {
      users: [],
      registrations: [],
      payments: [],
      passes: [],
      contactMessages: [],
      gallery: [],
      auditLogs: []
    };
    this.init();
  }

  init() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.data = JSON.parse(stored);
        if (!this.data.users) this.data.users = [];
        if (!this.data.registrations) this.data.registrations = [];
        if (!this.data.payments) this.data.payments = [];
        if (!this.data.passes) this.data.passes = [];
        if (!this.data.contactMessages) this.data.contactMessages = [];
        if (!this.data.gallery) this.data.gallery = [];
        if (!this.data.auditLogs) this.data.auditLogs = [];
      } catch (e) {
        console.error("Failed to parse local database, resetting seed", e);
        this.seedData();
      }
    } else {
      this.seedData();
    }
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  }

  seedData() {
    const now = new Date().toISOString();
    const ago1h = new Date(Date.now() - 3600000).toISOString();
    const ago2h = new Date(Date.now() - 7200000).toISOString();
    const ago5h = new Date(Date.now() - 18000000).toISOString();
    const ago1d = new Date(Date.now() - 86400000).toISOString();

    // Users Seed
    this.data.users = [
      {
        id: "USR-001",
        name: "Super Admin",
        email: "admin@navratri2026.org",
        phone: "+91 98765 43210",
        role: "super_admin",
        password_hash: "$argon2id$v=19$m=65536,t=3,p=4$simulated_hash_admin",
        created_at: ago1d
      },
      {
        id: "USR-002",
        name: "Gate Scanner Gate-1",
        email: "gate1@navratri2026.org",
        phone: "+91 98765 43211",
        role: "gate_scanner",
        password_hash: "$argon2id$v=19$m=65536,t=3,p=4$simulated_hash_gate",
        created_at: ago1d
      },
      {
        id: "USR-003",
        name: "Aarav Sharma",
        email: "aarav.sharma@example.com",
        phone: "+91 98123 45678",
        role: "visitor",
        password_hash: "$argon2id$v=19$m=65536,t=3,p=4$simulated_hash_user",
        created_at: ago5h
      },
      {
        id: "USR-004",
        name: "Priya Patel",
        email: "priya.patel@example.com",
        phone: "+91 98234 56789",
        role: "visitor",
        password_hash: "$argon2id$v=19$m=65536,t=3,p=4$simulated_hash_user2",
        created_at: ago2h
      }
    ];

    // Registrations Seed
    this.data.registrations = [
      {
        id: "REG-90812",
        user_id: "USR-003",
        pass_type: "season",
        quantity: 2,
        amount: 5998,
        status: "PAID",
        attendee_name: "Aarav Sharma",
        attendee_email: "aarav.sharma@example.com",
        attendee_phone: "+91 98123 45678",
        created_at: ago5h
      },
      {
        id: "REG-90813",
        user_id: "USR-004",
        pass_type: "vip",
        quantity: 1,
        amount: 6999,
        status: "PAID",
        attendee_name: "Priya Patel",
        attendee_email: "priya.patel@example.com",
        attendee_phone: "+91 98234 56789",
        created_at: ago2h
      },
      {
        id: "REG-90814",
        user_id: "USR-003",
        pass_type: "single",
        quantity: 3,
        amount: 1497,
        status: "PAID",
        attendee_name: "Rohan Mehta",
        attendee_email: "rohan.mehta@example.com",
        attendee_phone: "+91 98345 67890",
        created_at: ago1h
      }
    ];

    // Payments Seed
    this.data.payments = [
      {
        id: "PAY-1001",
        reg_id: "REG-90812",
        order_id: "order_NVRTR_881921",
        payment_id: "pay_NVRTR_7719283",
        signature: "f4a8b79210c8e9b62a19e5d4c892b1029cfa98b7e2d1982a",
        status: "CAPTURED",
        amount: 5998,
        method: "UPI (Google Pay)",
        created_at: ago5h
      },
      {
        id: "PAY-1002",
        reg_id: "REG-90813",
        order_id: "order_NVRTR_881922",
        payment_id: "pay_NVRTR_7719284",
        signature: "a9c18d726b219e831f298c4d29a1b28394ef8271a",
        status: "CAPTURED",
        amount: 6999,
        method: "Credit Card (HDFC)",
        created_at: ago2h
      },
      {
        id: "PAY-1003",
        reg_id: "REG-90814",
        order_id: "order_NVRTR_881923",
        payment_id: "pay_NVRTR_7719285",
        signature: "889b7192a831e27b919d82e17621a29318b7218",
        status: "CAPTURED",
        amount: 1497,
        method: "NetBanking (ICICI)",
        created_at: ago1h
      }
    ];

    // Digital Passes Seed
    this.data.passes = [
      {
        pass_id: "PASS-NVR-2026-90812-1",
        reg_id: "REG-90812",
        user_name: "Aarav Sharma",
        user_email: "aarav.sharma@example.com",
        user_phone: "+91 98123 45678",
        pass_type: "season",
        tier_title: "9-Night Festival Pass",
        qr_token: "NVR-HMAC-2026:PASS-NVR-2026-90812-1:season:a891f7c29b1",
        status: "USED",
        scan_timestamp: ago2h,
        gate_id: "Gate-01 (VIP/Main Entrance)",
        gate_operator: "Gate Operator - Vikram",
        security_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        issued_at: ago5h
      },
      {
        pass_id: "PASS-NVR-2026-90812-2",
        reg_id: "REG-90812",
        user_name: "Diya Sharma",
        user_email: "diya.sharma@example.com",
        user_phone: "+91 98123 45679",
        pass_type: "season",
        tier_title: "9-Night Festival Pass",
        qr_token: "NVR-HMAC-2026:PASS-NVR-2026-90812-2:season:b721c82e19a",
        status: "UNUSED",
        scan_timestamp: null,
        gate_id: null,
        gate_operator: null,
        security_hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        issued_at: ago5h
      },
      {
        pass_id: "PASS-NVR-2026-90813-1",
        reg_id: "REG-90813",
        user_name: "Priya Patel",
        user_email: "priya.patel@example.com",
        user_phone: "+91 98234 56789",
        pass_type: "vip",
        tier_title: "VIP Garba Lounge Pass",
        qr_token: "NVR-HMAC-2026:PASS-NVR-2026-90813-1:vip:c981a82716b",
        status: "USED",
        scan_timestamp: ago1h,
        gate_id: "Gate-VIP-Exclusive",
        gate_operator: "Gate Operator - Ananya",
        security_hash: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
        issued_at: ago2h
      },
      {
        pass_id: "PASS-NVR-2026-90814-1",
        reg_id: "REG-90814",
        user_name: "Rohan Mehta",
        user_email: "rohan.mehta@example.com",
        user_phone: "+91 98345 67890",
        pass_type: "single",
        tier_title: "Single Night Garba Pass",
        qr_token: "NVR-HMAC-2026:PASS-NVR-2026-90814-1:single:d18291a27b8",
        status: "UNUSED",
        scan_timestamp: null,
        gate_id: null,
        gate_operator: null,
        security_hash: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
        issued_at: ago1h
      }
    ];

    // Gallery Seed
    this.data.gallery = [
      {
        id: "GAL-01",
        title: "Falguni Pathak Live Night",
        category: "Garba Nights",
        year: 2025,
        badge: "Highlight",
        media_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80"
      },
      {
        id: "GAL-02",
        title: "Traditional Chaniya Choli & Attire",
        category: "Fashion & Culture",
        year: 2025,
        badge: "Culture",
        media_url: "https://images.unsplash.com/photo-1545232979-fbf34fe37295?auto=format&fit=crop&w=1000&q=80"
      },
      {
        id: "GAL-03",
        title: "10,000 Dancers Maha Aarti",
        category: "Divine Aarti",
        year: 2025,
        badge: "Record Breaking",
        media_url: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1000&q=80"
      },
      {
        id: "GAL-04",
        title: "Kinjal Dave Garba Raas",
        category: "Celebrity Guests",
        year: 2025,
        badge: "Celebrity",
        media_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80"
      },
      {
        id: "GAL-05",
        title: "Royal VIP Garba Arena Lightshow",
        category: "Garba Nights",
        year: 2025,
        badge: "VIP Lounge",
        media_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80"
      },
      {
        id: "GAL-06",
        title: "Authentic Gujarati Food Festival Stalls",
        category: "Food & Stalls",
        year: 2025,
        badge: "Food Court",
        media_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
      }
    ];

    // Contact Messages Seed
    this.data.contactMessages = [
      {
        id: "MSG-001",
        name: "Suresh Shah",
        email: "suresh.shah@example.com",
        subject: "Corporate Bulk Pass Booking",
        message: "We need 50 VIP passes for our corporate team. Is there a group discount available?",
        created_at: ago5h,
        status: "NEW"
      }
    ];

    // Audit Logs Seed
    this.data.auditLogs = [
      {
        id: "LOG-1001",
        event_type: "SYSTEM_INIT",
        actor: "System Engine",
        details: "Navratri Event Platform core security modules initialized with TLS 1.3 enforcement",
        timestamp: ago1d,
        severity: "INFO",
        ip_address: "127.0.0.1"
      },
      {
        id: "LOG-1002",
        event_type: "PAYMENT_WEBHOOK_VERIFIED",
        actor: "Razorpay Webhook Engine",
        details: "HMAC SHA-256 Signature verified successfully for Order order_NVRTR_881921. Amount: ₹5,998",
        timestamp: ago5h,
        severity: "INFO",
        ip_address: "52.66.121.43 (Razorpay AWS Server)"
      },
      {
        id: "LOG-1003",
        event_type: "GATE_ENTRY_SUCCESS",
        actor: "Gate Operator - Vikram",
        details: "Pass PASS-NVR-2026-90812-1 verified & redeemed at Gate-01. Attendee: Aarav Sharma",
        timestamp: ago2h,
        severity: "INFO",
        ip_address: "192.168.1.105 (Gate Scanner 01)"
      },
      {
        id: "LOG-1004",
        event_type: "DUPLICATE_SCAN_REJECTED",
        actor: "Gate Scanner Engine",
        details: "ATTEMPTED RE-ENTRY BLOCKED: Pass PASS-NVR-2026-90812-1 was already redeemed 1 hour ago. Rejection logged.",
        timestamp: ago1h,
        severity: "WARNING",
        ip_address: "192.168.1.106 (Gate Scanner 02)"
      }
    ];

    this.save();
  }

  // --- Entity Operations ---
  getUsers() { return this.data.users; }
  getRegistrations() { return this.data.registrations; }
  getPayments() { return this.data.payments; }
  getPasses() { return this.data.passes; }
  getAuditLogs() { return this.data.auditLogs; }
  getGallery() { return this.data.gallery; }
  getMessages() { return this.data.contactMessages; }

  findPassByTokenOrId(queryStr) {
    if (!queryStr) return null;
    const clean = queryStr.trim();
    return this.data.passes.find(
      p => p.pass_id.toLowerCase() === clean.toLowerCase() ||
           p.qr_token.toLowerCase() === clean.toLowerCase()
    );
  }

  addRegistration(regData, paymentData, passesArray) {
    this.data.registrations.unshift(regData);
    this.data.payments.unshift(paymentData);
    passesArray.forEach(pass => {
      this.data.passes.unshift(pass);
      // Sync pass with Supabase Cloud if configured
      if (typeof supabaseService !== 'undefined' && supabaseService.isConfigured) {
        supabaseService.savePassToCloud(pass);
      }
    });

    // Sync payment with Supabase Cloud if configured
    if (typeof supabaseService !== 'undefined' && supabaseService.isConfigured) {
      supabaseService.savePaymentToCloud(paymentData);
    }

    // Audit Log
    this.addAuditLog({
      event_type: "PASS_BOOKED_AND_ISSUED",
      actor: regData.attendee_name,
      details: `New booking created: ${regData.quantity}x ${regData.pass_type} passes (₹${regData.amount}). Razorpay Payment ID: ${paymentData.payment_id}`,
      severity: "INFO",
      ip_address: "103.22.180.12"
    });

    this.save();
  }

  markPassAsUsed(passId, gateId, operatorName) {
    const pass = this.data.passes.find(p => p.pass_id === passId);
    if (!pass) return { success: false, reason: "NOT_FOUND" };

    if (pass.status === "USED") {
      this.addAuditLog({
        event_type: "SECURITY_DUPLICATE_ENTRY_ALERT",
        actor: operatorName || "Gate Scanner",
        details: `DUPLICATE ENTRY ALERT: Pass ${passId} already scanned at ${pass.scan_timestamp} on ${pass.gate_id}. Re-entry denied!`,
        severity: "CRITICAL",
        ip_address: "192.168.1.110"
      });
      this.save();
      return { success: false, reason: "ALREADY_USED", pass: pass };
    }

    pass.status = "USED";
    pass.scan_timestamp = new Date().toISOString();
    pass.gate_id = gateId || "Gate-01 Main";
    pass.gate_operator = operatorName || "Scanner Staff";

    // Sync status with Supabase Cloud if configured
    if (typeof supabaseService !== 'undefined' && supabaseService.isConfigured) {
      supabaseService.markPassUsedCloud(passId, pass.gate_id, pass.gate_operator);
    }

    this.addAuditLog({
      event_type: "GATE_ENTRY_SUCCESS",
      actor: pass.gate_operator,
      details: `Pass ${passId} (${pass.tier_title}) successfully redeemed at ${pass.gate_id} for ${pass.user_name}`,
      severity: "INFO",
      ip_address: "192.168.1.110"
    });

    this.save();
    return { success: true, pass: pass };
  }

  addContactMessage(msg) {
    const newMessage = {
      id: "MSG-" + Math.floor(100 + Math.random() * 900),
      ...msg,
      created_at: new Date().toISOString(),
      status: "NEW"
    };
    this.data.contactMessages.unshift(newMessage);
    this.addAuditLog({
      event_type: "CONTACT_FORM_SUBMITTED",
      actor: msg.email,
      details: `Contact enquiry received from ${msg.name}: "${msg.subject}"`,
      severity: "INFO",
      ip_address: "114.143.20.1"
    });
    this.save();
    return newMessage;
  }

  addAuditLog(logObj) {
    const newLog = {
      id: "LOG-" + (1000 + this.data.auditLogs.length + 1),
      timestamp: new Date().toISOString(),
      ip_address: "127.0.0.1",
      ...logObj
    };
    this.data.auditLogs.unshift(newLog);
    this.save();
    return newLog;
  }

  getMetrics() {
    const totalRevenue = this.data.payments
      .filter(p => p.status === "CAPTURED")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPassesSold = this.data.passes.length;
    const totalScanned = this.data.passes.filter(p => p.status === "USED").length;
    const totalPendingEntry = totalPassesSold - totalScanned;
    const attendancePercentage = totalPassesSold > 0 ? Math.round((totalScanned / totalPassesSold) * 100) : 0;

    return {
      totalRevenue,
      totalPassesSold,
      totalScanned,
      totalPendingEntry,
      attendancePercentage
    };
  }

  async syncFromCloud() {
    if (typeof supabaseService === 'undefined' || !supabaseService.isConfigured) return;
    const cloudPasses = await supabaseService.syncPassesFromCloud();
    if (!cloudPasses || cloudPasses.length === 0) return;

    cloudPasses.forEach(cloudPass => {
      const idx = this.data.passes.findIndex(p => p.pass_id === cloudPass.pass_id);
      if (idx !== -1) {
        this.data.passes[idx] = { ...this.data.passes[idx], ...cloudPass };
      } else {
        this.data.passes.unshift(cloudPass);
      }
    });

    this.save();
    console.log(`✅ Local DB synced with ${cloudPasses.length} cloud passes.`);
  }
}

// Global Singleton Database Instance
const db = new NavratriDatabase();
