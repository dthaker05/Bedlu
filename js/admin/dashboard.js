/**
 * Navratri Event Management Platform - Admin Dashboard Controller
 * Real-Time KPIs, Transaction Stream, Gate Activity Logs, and Security Alerts.
 */
class AdminDashboardController {
  constructor() {
    this.streamInterval = null;
  }

  init() {
    this.renderKPIs();
    this.renderTransactions();
    this.renderGateLogs();
    this.renderAuditLogs();
    this.renderCharts();
    this.startRealtimeStream();
  }

  renderKPIs() {
    const metrics = db.getMetrics();
    const revElem = document.getElementById("kpi-total-revenue");
    const passesElem = document.getElementById("kpi-passes-sold");
    const scannedElem = document.getElementById("kpi-scanned-count");
    const attRateElem = document.getElementById("kpi-attendance-rate");

    if (revElem) revElem.innerText = `₹${metrics.totalRevenue.toLocaleString()}`;
    if (passesElem) passesElem.innerText = metrics.totalPassesSold.toLocaleString();
    if (scannedElem) scannedElem.innerText = metrics.totalScanned.toLocaleString();
    if (attRateElem) attRateElem.innerText = `${metrics.attendancePercentage}%`;
  }

  renderTransactions() {
    const tableBody = document.getElementById("admin-transactions-body");
    if (!tableBody) return;

    const payments = db.getPayments();
    const registrations = db.getRegistrations();

    tableBody.innerHTML = payments.slice(0, 10).map(pay => {
      const reg = registrations.find(r => r.id === pay.reg_id) || {};
      return `
        <tr>
          <td><code>${pay.payment_id}</code></td>
          <td><strong>${reg.attendee_name || 'Guest User'}</strong><br/><small class="text-muted">${reg.attendee_email || ''}</small></td>
          <td><span class="badge badge-purple">${(reg.pass_type || 'pass').toUpperCase()} (x${reg.quantity || 1})</span></td>
          <td><strong>₹${pay.amount.toLocaleString()}</strong></td>
          <td><small>${pay.method}</small></td>
          <td><span class="badge badge-success">✓ ${pay.status}</span></td>
          <td><small>${new Date(pay.created_at).toLocaleTimeString()}</small></td>
        </tr>
      `;
    }).join('');
  }

  renderGateLogs() {
    const logList = document.getElementById("admin-gatelog-stream");
    if (!logList) return;

    const passes = db.getPasses();
    const scannedPasses = passes
      .filter(p => p.status === "USED")
      .sort((a, b) => new Date(b.scan_timestamp) - new Date(a.scan_timestamp));

    if (scannedPasses.length === 0) {
      logList.innerHTML = `<div class="empty-stream-msg">No gate entries scanned yet.</div>`;
      return;
    }

    logList.innerHTML = scannedPasses.map(p => `
      <div class="gate-stream-item">
        <div class="stream-icon green">🎟️</div>
        <div class="stream-info">
          <div class="stream-title"><strong>${p.user_name}</strong> entered via <code>${p.gate_id || 'Gate-01'}</code></div>
          <div class="stream-meta">Pass: <code>${p.pass_id}</code> (${p.tier_title}) • Operator: ${p.gate_operator || 'Gate Staff'}</div>
        </div>
        <div class="stream-time">${new Date(p.scan_timestamp).toLocaleTimeString()}</div>
      </div>
    `).join('');
  }

  renderAuditLogs() {
    const auditContainer = document.getElementById("admin-audit-log-body");
    if (!auditContainer) return;

    const logs = db.getAuditLogs();
    auditContainer.innerHTML = logs.slice(0, 15).map(log => {
      let sevClass = "badge-info";
      if (log.severity === "WARNING") sevClass = "badge-warning";
      if (log.severity === "CRITICAL") sevClass = "badge-danger";

      return `
        <tr>
          <td><small>${new Date(log.timestamp).toLocaleTimeString()}</small></td>
          <td><span class="badge ${sevClass}">${log.severity}</span></td>
          <td><code>${log.event_type}</code></td>
          <td><small>${log.actor}</small></td>
          <td><div class="audit-details-text">${log.details}</div></td>
          <td><code>${log.ip_address}</code></td>
        </tr>
      `;
    }).join('');
  }

  renderCharts() {
    this.drawRevenueChart();
    this.drawPassTypeChart();
  }

  drawRevenueChart() {
    const canvas = document.getElementById("canvas-revenue-chart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const points = [15000, 28000, 42000, 65000, 98000, 135000, 185000];
    const labels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

    const padding = 40;
    const w = canvas.width - padding * 2;
    const h = canvas.height - padding * 2;
    const maxVal = 200000;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 3;
    points.forEach((val, index) => {
      const x = padding + (w / (points.length - 1)) * index;
      const y = padding + h - (val / maxVal) * h;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    points.forEach((val, index) => {
      const x = padding + (w / (points.length - 1)) * index;
      const y = padding + h - (val / maxVal) * h;

      ctx.fillStyle = "#e91e63";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#aaa";
      ctx.font = "10px sans-serif";
      ctx.fillText(labels[index], x - 12, canvas.height - 10);
    });
  }

  drawPassTypeChart() {
    const canvas = document.getElementById("canvas-pass-breakdown");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const passes = db.getPasses();
    const counts = { single: 0, season: 0, vip: 0, family: 0 };
    passes.forEach(p => {
      if (counts[p.pass_type] !== undefined) counts[p.pass_type]++;
      else counts.single++;
    });

    const categories = [
      { label: "Season 9-Night", count: counts.season || 2, color: "#ffd700" },
      { label: "VIP Lounge", count: counts.vip || 1, color: "#e91e63" },
      { label: "Single Night", count: counts.single || 1, color: "#9c27b0" },
      { label: "Family Group", count: counts.family || 1, color: "#10b981" }
    ];

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 5;
    let startAngle = 0;
    const centerX = canvas.width / 3;
    const centerY = canvas.height / 2;
    const radius = 65;

    categories.forEach(cat => {
      const sliceAngle = (cat.count / total) * 2 * Math.PI;

      ctx.fillStyle = cat.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      startAngle += sliceAngle;
    });

    ctx.fillStyle = "#120726";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.55, 0, 2 * Math.PI);
    ctx.fill();

    let legendY = 30;
    categories.forEach(cat => {
      ctx.fillStyle = cat.color;
      ctx.fillRect(canvas.width / 2 + 10, legendY, 12, 12);

      ctx.fillStyle = "#fff";
      ctx.font = "11px sans-serif";
      ctx.fillText(`${cat.label} (${cat.count})`, canvas.width / 2 + 30, legendY + 10);
      legendY += 24;
    });
  }

  startRealtimeStream() {
    if (this.streamInterval) clearInterval(this.streamInterval);

    this.streamInterval = setInterval(() => {
      this.renderKPIs();
      this.renderTransactions();
      this.renderGateLogs();
      this.renderAuditLogs();
      this.renderCharts();

      const pulseElem = document.getElementById("admin-live-pulse");
      if (pulseElem) {
        pulseElem.classList.add("flash");
        setTimeout(() => pulseElem.classList.remove("flash"), 600);
      }
    }, 5000);
  }
}

const adminDashboard = new AdminDashboardController();
