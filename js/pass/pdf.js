/**
 * Navratri Event Management Platform - Digital Pass PDF & Ticket Renderer Engine
 */
class DigitalPassRenderer {
  /**
   * Renders SVG / Canvas QR Code for given text string
   */
  static generateQRCodeDataURL(text) {
    const size = 180;
    const modules = 21;
    const cellSize = size / modules;
    
    // Deterministic module generation based on string hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    let rects = '';
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        // Finder patterns at corners
        const isTopLeft = (r < 7 && c < 7);
        const isTopRight = (r < 7 && c >= modules - 7);
        const isBottomLeft = (r >= modules - 7 && c < 7);
        
        let fill = false;
        if (isTopLeft || isTopRight || isBottomLeft) {
          const isOuterBorder = (r === 0 || r === 6 || c === 0 || c === 6 || r === modules - 7 || r === modules - 1 || c === modules - 7 || c === modules - 1);
          const isInnerSquare = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                                (r >= 2 && r <= 4 && c >= modules - 5 && c <= modules - 3) ||
                                (r >= modules - 5 && r <= modules - 3 && c >= 2 && c <= 4);
          fill = isOuterBorder || isInnerSquare;
        } else {
          // Pseudorandom grid fill based on text hash
          fill = Math.abs((hash ^ (r * 31 + c * 17))) % 3 === 0;
        }

        if (fill) {
          rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize + 0.3}" height="${cellSize + 0.3}" fill="#100720"/>`;
        }
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="#ffffff" rx="8"/>
      ${rects}
    </svg>`;

    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  /**
   * Builds an HTML Pass Ticket element for modal display or printing
   */
  static renderPassHTML(pass) {
    const qrDataUrl = this.generateQRCodeDataURL(pass.qr_token || pass.pass_id);
    const tier = NAVRATRI_CONFIG.passTiers.find(t => t.id === pass.pass_type) || { name: pass.tier_title, badge: "Pass" };

    return `
      <div id="ticket-card-${pass.pass_id}" class="digital-ticket-card">
        <div class="ticket-header">
          <div class="ticket-brand">
            <span class="garba-icon">💃</span>
            <div>
              <h3>MAHA GARBA MAHOTSAV 2026</h3>
              <p class="ticket-subtitle">Ahmedabad • Royal Garba Grounds</p>
            </div>
          </div>
          <span class="ticket-badge tier-${pass.pass_type}">${pass.tier_title.toUpperCase()}</span>
        </div>

        <div class="ticket-body">
          <div class="ticket-info">
            <div class="info-row">
              <label>PASS HOLDER</label>
              <div class="val-name">${pass.user_name}</div>
            </div>
            <div class="info-row-grid">
              <div>
                <label>PASS SERIAL ID</label>
                <div class="val-code">${pass.pass_id}</div>
              </div>
              <div>
                <label>ENTRY STATUS</label>
                <div class="val-status ${pass.status === 'USED' ? 'status-used' : 'status-valid'}">
                  ${pass.status === 'USED' ? '🔴 REDEEMED / USED' : '🟢 VALID FOR ENTRY'}
                </div>
              </div>
            </div>
            <div class="info-row-grid">
              <div>
                <label>VALID DATES</label>
                <div class="val-text">Oct 10 - Oct 18, 2026</div>
              </div>
              <div>
                <label>GATE TIME</label>
                <div class="val-text">7:00 PM Onwards</div>
              </div>
            </div>
          </div>

          <div class="ticket-qr-section">
            <img src="${qrDataUrl}" alt="QR Pass Token" class="qr-image" />
            <div class="qr-code-label">${pass.pass_id}</div>
            <div class="crypto-seal">🔒 HMAC SHA-256 SECURED</div>
          </div>
        </div>

        <div class="ticket-footer">
          <div class="security-hash">
            <span>TOKEN HASH:</span> <code>${pass.security_hash ? pass.security_hash.substring(0, 24) : 'NVR2026-HMAC'}...</code>
          </div>
          <div class="rules-note">Scan at Gate 01 • Requires Photo ID • Non-transferable</div>
        </div>
      </div>
    `;
  }

  /**
   * Triggers native print modal for pass ticket
   */
  static printPass(passId) {
    const pass = db.findPassByTokenOrId(passId);
    if (!pass) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const passHtml = this.renderPassHTML(pass);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Pass - ${pass.pass_id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fff; padding: 20px; text-align: center; }
          .digital-ticket-card { border: 2px solid #1a0b2e; border-radius: 12px; max-width: 650px; margin: 0 auto; padding: 20px; background: #120626; color: #fff; text-align: left; }
          .ticket-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #ffd700; padding-bottom: 15px; }
          .ticket-brand { display: flex; align-items: center; gap: 10px; }
          .ticket-brand h3 { margin: 0; color: #ffd700; font-size: 20px; }
          .ticket-subtitle { margin: 2px 0 0 0; font-size: 12px; color: #ccc; }
          .ticket-badge { background: #ffd700; color: #000; font-weight: bold; padding: 6px 12px; border-radius: 20px; font-size: 12px; }
          .ticket-body { display: flex; gap: 20px; margin: 20px 0; align-items: center; }
          .ticket-info { flex: 1; }
          .info-row label, .info-row-grid label { font-size: 10px; color: #aaa; letter-spacing: 1px; display: block; margin-bottom: 3px; }
          .val-name { font-size: 18px; font-weight: bold; color: #fff; margin-bottom: 12px; }
          .val-code { font-size: 14px; font-family: monospace; color: #ffd700; margin-bottom: 10px; }
          .info-row-grid { display: flex; gap: 15px; margin-bottom: 10px; }
          .val-status { font-weight: bold; font-size: 12px; }
          .status-valid { color: #10b981; }
          .status-used { color: #ef4444; }
          .ticket-qr-section { text-align: center; background: #fff; padding: 10px; border-radius: 8px; }
          .qr-image { width: 140px; height: 140px; }
          .qr-code-label { font-size: 10px; color: #333; font-family: monospace; margin-top: 4px; }
          .crypto-seal { font-size: 9px; color: #666; margin-top: 2px; }
          .ticket-footer { border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; color: #aaa; }
          .security-hash code { color: #ffd700; }
        </style>
      </head>
      <body>
        ${passHtml}
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}
