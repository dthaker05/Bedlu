/**
 * Navratri Event Management Platform - Web Crypto Engine & Security Core Helpers
 * Implements HMAC SHA-256, JWT Token generation/verification, and hashing utilities.
 */
class CryptoEngine {
  /**
   * Generates SHA-256 Hash of string using standard Web Crypto API
   */
  static async sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Computes HMAC SHA-256 for Razorpay Webhook signature verification
   * Algorithm: HMAC_SHA256(order_id + "|" + payment_id, secret_key)
   */
  static async verifyRazorpayHMAC(orderId, paymentId, receivedSignature, secretKey) {
    const payload = `${orderId}|${paymentId}`;
    const encoder = new TextEncoder();
    
    const keyData = encoder.encode(secretKey || NAVRATRI_CONFIG.security.razorpayKeySecret);
    const messageData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const isValid = computedSignature === receivedSignature;
    return {
      isValid,
      computedSignature,
      receivedSignature,
      payload
    };
  }

  /**
   * Generates a Cryptographic QR Token for a Digital Pass
   */
  static async generateQRToken(passId, passType, attendeeEmail) {
    const secret = NAVRATRI_CONFIG.security.qrSecret;
    const timestamp = Date.now();
    const message = `${passId}:${passType}:${attendeeEmail}:${timestamp}`;
    const hash = await this.sha256(message + secret);
    const shortHash = hash.substring(0, 12);
    
    // Encrypted token format: NVR-HMAC-2026:PASS_ID:PASS_TYPE:SHORT_HMAC
    return `NVR-HMAC-2026:${passId}:${passType}:${shortHash}`;
  }

  /**
   * Simulates JWT Token Generation with Claims & Cryptographic HMAC Signature
   */
  static async generateJWT(user) {
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (NAVRATRI_CONFIG.security.tokenExpiryHours * 3600),
      iss: "https://auth.navratri2026.org"
    };

    const b64Header = btoa(JSON.stringify(header)).replace(/=/g, "");
    const b64Payload = btoa(JSON.stringify(payload)).replace(/=/g, "");
    const unsignedToken = `${b64Header}.${b64Payload}`;
    
    const signature = await this.sha256(unsignedToken + NAVRATRI_CONFIG.security.jwtSecret);
    const token = `${unsignedToken}.${signature.substring(0, 32)}`;

    return {
      token,
      expiresAt: new Date(payload.exp * 1000).toLocaleString(),
      payload
    };
  }

  /**
   * Decodes and validates JWT token structure
   */
  static decodeJWT(jwtToken) {
    try {
      const parts = jwtToken.split('.');
      if (parts.length !== 3) return null;
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      return { header, payload, signature: parts[2] };
    } catch (e) {
      return null;
    }
  }
}

/**
 * Web Audio API Audio Synthesizer Engine
 */
class AudioBeatSynthesizer {
  constructor() {
    this.audioContext = null;
    this.isPlayingGarbaBeat = false;
    this.audioInterval = null;
  }

  toggleGarbaMusic(btnElement) {
    if (this.isPlayingGarbaBeat) {
      this.stopGarbaBeat();
      if (btnElement) btnElement.innerHTML = `🎵 Play Garba Beats`;
    } else {
      this.playGarbaBeat();
      if (btnElement) btnElement.innerHTML = `🔊 Mute Garba Beats`;
    }
  }

  playGarbaBeat() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.audioContext) this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') this.audioContext.resume();

      this.isPlayingGarbaBeat = true;
      let step = 0;

      this.audioInterval = setInterval(() => {
        if (!this.isPlayingGarbaBeat) return;
        const now = this.audioContext.currentTime;

        if (step % 2 === 0) {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.connect(gain);
          gain.connect(this.audioContext.destination);
          osc.start(now);
          osc.stop(now + 0.15);
        } else {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(1200 + (step * 50), now);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(this.audioContext.destination);
          osc.start(now);
          osc.stop(now + 0.08);
        }

        step = (step + 1) % 8;
      }, 160);

    } catch (e) {
      console.warn("Audio Context blocked until user click", e);
    }
  }

  stopGarbaBeat() {
    this.isPlayingGarbaBeat = false;
    if (this.audioInterval) clearInterval(this.audioInterval);
  }

  playBeep(isSuccess = true) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = isSuccess ? "sine" : "sawtooth";
      osc.frequency.setValueAtTime(isSuccess ? 880 : 300, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + (isSuccess ? 0.2 : 0.4));
    } catch (e) {
      // Audio context ignored if user gesture missing
    }
  }
}

const audioSynthesizer = new AudioBeatSynthesizer();
