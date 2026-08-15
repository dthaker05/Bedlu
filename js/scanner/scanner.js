/**
 * Navratri Event Management Platform - QR Code Scanner & Gate Entry Engine
 * Handles camera scanning, code parsing, backend token validation, and 1-time entry security.
 */
class GateScannerEngine {
  constructor() {
    this.isCameraActive = false;
    this.html5QrCode = null;
    this.lastScannedCode = null;
    this.lastScanTime = 0;
    this.scanLog = [];
  }

  /**
   * Toggles live device camera stream using Html5Qrcode SDK
   */
  async toggleCameraStream() {
    if (this.isCameraActive) {
      await this.stopCamera();
    } else {
      await this.startCamera();
    }
  }

  async startCamera() {
    const readerBox = document.getElementById("camera-reader-box");
    const standbyBox = document.getElementById("scanner-standby-box");
    const toggleBtn = document.getElementById("btn-toggle-camera");

    if (typeof Html5Qrcode === "undefined") {
      alert("HTML5 QR Code Scanner library is loading. Please try again in a moment.");
      return;
    }

    try {
      if (!this.html5QrCode) {
        this.html5QrCode = new Html5Qrcode("qr-reader");
      }

      if (standbyBox) standbyBox.style.display = "none";
      if (readerBox) readerBox.style.display = "block";
      if (toggleBtn) toggleBtn.innerText = "🛑 Stop Device Camera";

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      await this.html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          const now = Date.now();
          if (decodedText === this.lastScannedCode && (now - this.lastScanTime) < 3000) {
            return;
          }
          this.lastScannedCode = decodedText;
          this.lastScanTime = now;

          const inputField = document.getElementById("scanner-input-code");
          if (inputField) inputField.value = decodedText;

          if (window.app && window.app.handleScanVerify) {
            window.app.handleScanVerify(decodedText);
          } else {
            const outcome = await this.processScanInput(decodedText);
            this.playBeep(outcome.status === "VALID");
          }
        },
        (errorMessage) => {
          // Ignore frame parse errors
        }
      );

      this.isCameraActive = true;
    } catch (err) {
      console.error("Camera access error:", err);
      if (standbyBox) standbyBox.style.display = "block";
      if (readerBox) readerBox.style.display = "none";
      if (toggleBtn) toggleBtn.innerText = "📷 Start Live Device Camera";
      alert("Could not access device camera. Please check camera permissions in your browser.");
    }
  }

  async stopCamera() {
    if (this.html5QrCode && this.isCameraActive) {
      try {
        await this.html5QrCode.stop();
      } catch (e) {
        console.warn("Error stopping QR camera:", e);
      }
    }

    const readerBox = document.getElementById("camera-reader-box");
    const standbyBox = document.getElementById("scanner-standby-box");
    const toggleBtn = document.getElementById("btn-toggle-camera");

    if (readerBox) readerBox.style.display = "none";
    if (standbyBox) standbyBox.style.display = "block";
    if (toggleBtn) toggleBtn.innerText = "📷 Start Live Device Camera";
    this.isCameraActive = false;
  }

  playBeep(isSuccess = true) {
    if (typeof audioSynthesizer !== 'undefined') {
      audioSynthesizer.playBeep(isSuccess);
    }
  }

  /**
   * Processes scanned QR String or Pass ID string.
   * Falls back to Supabase cloud lookup if pass is not in local cache (cross-device support).
   */
  async processScanInput(rawInput) {
    if (!rawInput) return { status: "INVALID", message: "Empty QR input string" };

    const cleanInput = rawInput.trim();
    
    let pass = db.findPassByTokenOrId(cleanInput);

    if (!pass && typeof supabaseService !== 'undefined' && supabaseService.isConfigured) {
      console.log("🔍 Pass not in local cache — checking Supabase cloud...");
      pass = await supabaseService.findPassByTokenCloud(cleanInput);
      if (pass) {
        db.data.passes.unshift(pass);
        db.save();
        console.log("☁️ Pass loaded from cloud into local cache.");
      }
    }

    if (!pass) {
      this.playBeep(false);
      db.addAuditLog({
        event_type: "SECURITY_INVALID_QR_SCAN",
        actor: auth.currentUser ? auth.currentUser.name : "Gate Scanner",
        details: `INVALID QR SCAN: Raw input '${cleanInput}' not found in database registry. Counterfeit attempt suspected.`,
        severity: "WARNING",
        ip_address: "192.168.1.112"
      });
      return {
        status: "INVALID",
        title: "⛔ Counterfeit / Invalid Pass",
        message: "This QR code does not belong to any valid registration in the system.",
        pass: null
      };
    }

    const currentOperator = auth.currentUser ? auth.currentUser.name : "Gate Scanner Staff";
    const currentGate = "Gate-01 (Main Entry)";

    const result = db.markPassAsUsed(pass.pass_id, currentGate, currentOperator);

    if (!result.success) {
      if (result.reason === "ALREADY_USED") {
        this.playBeep(false);
        return {
          status: "DUPLICATE",
          title: "🚨 DUPLICATE SCAN REJECTED",
          message: `THIS PASS WAS ALREADY USED FOR ENTRY!`,
          details: `Originally scanned on: ${new Date(result.pass.scan_timestamp).toLocaleString()} at ${result.pass.gate_id} by ${result.pass.gate_operator}. Duplicate scan blocked!`,
          pass: result.pass
        };
      }
    }

    this.playBeep(true);
    return {
      status: "VALID",
      title: "✅ ACCESS GRANTED",
      message: `Welcome to Garba Mahotsav 2026!`,
      pass: result.pass
    };
  }
}

const gateScanner = new GateScannerEngine();
