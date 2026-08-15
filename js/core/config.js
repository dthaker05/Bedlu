/**
 * Navratri Event Management Platform - Global Configuration
 */
const NAVRATRI_CONFIG = {
  eventName: "BEDLU",
  tagline: "Presented by United 18 • Premium Pre-Navratri Celebration",
  startDate: "2026-10-10T19:00:00+05:30", // Pre-Navratri 2026 Start Date
  endDate: "2026-10-18T23:59:59+05:30",
  venue: {
    name: "Royal Garba Grounds & Sports Complex",
    address: "SG Highway, Near Vaishno Devi Circle, Ahmedabad, Gujarat 380060",
    city: "Ahmedabad",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3670.3626359578644!2d72.5348883!3d23.0837568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e8346e9df5359%3A0xb35a840e53a3db51!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
  },
  
  // Security Keys & Gateway Controls
  security: {
    enableLiveRazorpay: false, // Set to true when adding valid Razorpay Key ID for real payment modal
    razorpayKeyId: "rzp_test_NAV2026GARBA99",
    razorpayKeySecret: "secret_navratri_garba_2026_hmac_key",
    jwtSecret: "navratri_jwt_super_secret_key_2026_verifying_signature",
    tokenExpiryHours: 24,
    qrSecret: "qr_crypto_hmac_seal_2026_navratri"
  },

  // Pass Pricing Tiers
  passTiers: [
    {
      id: "single",
      name: "Single Night Garba Pass",
      price: 499,
      originalPrice: 799,
      popular: false,
      badge: "Standard",
      features: [
        "Entry for 1 Night (Any day of choice)",
        "General Garba Arena Access",
        "Food Court & Stalls Access",
        "Digital Pass with QR Code",
        "Free Parking Spot"
      ]
    },
    {
      id: "season",
      name: "9-Night Festival Pass",
      price: 2999,
      originalPrice: 4499,
      popular: true,
      badge: "Best Value - Save 40%",
      features: [
        "Full Access to all 9 Garba Nights",
        "Priority Express Gate Entry",
        "Complimentary Dandiya Pair",
        "Access to Exclusive Food Lounge",
        "Free RFID Festival Wristband",
        "Digital Pass + Commemorative Badge"
      ]
    },
    {
      id: "vip",
      name: "VIP Garba Lounge Pass",
      price: 6999,
      originalPrice: 9999,
      popular: false,
      badge: "Exclusive VIP",
      features: [
        "9-Night VIP Covered Pavilion Access",
        "Celebrity & Artist Meet & Greet Lounge",
        "Unlimited Complimentary Food & Beverage",
        "Reserved Valet Parking",
        "Air-Conditioned VIP Changing Rooms",
        "Dedicated Personal Security Escort"
      ]
    },
    {
      id: "family",
      name: "Family / Group Pass (4 Pax)",
      price: 8999,
      originalPrice: 12999,
      popular: false,
      badge: "Group Savings",
      features: [
        "Entry for 4 Adults for 9 Garba Nights",
        "Group Seating Area Access",
        "4x Premium Dandiya Sets",
        "Food & Beverage Vouchers worth ₹1,000",
        "Dedicated Group Gate Entry"
      ]
    }
  ],

  // 9 Garba Nights Schedule
  garbaNights: [
    { day: 1, title: "Pratipada - Grand inauguration", performer: "Falguni Pathak & Orchestra", date: "Oct 10, 2026", color: "#e91e63" },
    { day: 2, title: "Dwitiya - Traditional Raas Night", performer: "Kinjal Dave Live", date: "Oct 11, 2026", color: "#9c27b0" },
    { day: 3, title: "Tritiya - Royal Fusion Garba", performer: "Aditya Gadhvi & Band", date: "Oct 12, 2026", color: "#673ab7" },
    { day: 4, title: "Chaturthi - Disco Dandiya Spectacular", performer: "Osman Mir Traditional Ensemble", date: "Oct 13, 2026", color: "#3f51b5" },
    { day: 5, title: "Panchami - Garba Queen Night", performer: "Aishwarya Majmudar", date: "Oct 14, 2026", color: "#00bcd4" },
    { day: 6, title: "Shasthi - Divine Aarti & Fusion", performer: "Geeta Rabari Raas Night", date: "Oct 15, 2026", color: "#009688" },
    { day: 7, title: "Saptami - Bollywood Garba Fever", performer: "Kirtidan Gadhvi Mega Show", date: "Oct 16, 2026", color: "#4caf50" },
    { day: 8, title: "Maha Ashtami - Royal Mega Garba", performer: "Jigardan Gadhavi & Rahul Munjariya", date: "Oct 17, 2026", color: "#ff9800" },
    { day: 9, title: "Maha Navami - Grand Finale & Awards", performer: "Falguni Pathak & All Stars", date: "Oct 18, 2026", color: "#f44336" }
  ]
};

// Freeze configuration to prevent tampering
Object.freeze(NAVRATRI_CONFIG);
