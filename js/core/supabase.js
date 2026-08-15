/**
 * Navratri Event Management Platform - Free Supabase Cloud Database Client
 * Handles live syncing with free PostgreSQL database on Supabase.
 */
class SupabaseService {
  constructor() {
    this.SUPABASE_URL = "https://twhirotsceqcvklvcejm.supabase.co";
    this.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aGlyb3RzY2VxY3ZrbHZjZWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNzgxMTUsImV4cCI6MjEwMDY1NDExNX0.PzkNXLvjgn_DmrZ2IWW_E9FoJPPak2OasQ7UtNZNaHg";
    this.client = null;
    this.isConfigured = false;
    this.init();
  }

  init() {
    if (window.supabase && this.SUPABASE_URL.indexOf("your-supabase-project") === -1) {
      this.client = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY);
      this.isConfigured = true;
      console.log("⚡ Supabase Cloud Database Connected Successfully!");
    } else {
      console.log("ℹ️ Running in LocalStorage DB mode. Paste Supabase credentials into js/core/supabase.js to switch to Cloud DB.");
    }
  }

  async savePassToCloud(passData) {
    if (!this.isConfigured) return null;
    const { data, error } = await this.client
      .from('digital_passes')
      .insert([passData]);
    if (error) console.error("Supabase pass insert error:", error);
    return data;
  }

  async markPassUsedCloud(passId, gateId, operatorName) {
    if (!this.isConfigured) return null;
    const { data, error } = await this.client
      .from('digital_passes')
      .update({
        status: 'USED',
        scan_timestamp: new Date().toISOString(),
        gate_id: gateId,
        gate_operator: operatorName
      })
      .eq('pass_id', passId);
    return { data, error };
  }

  async fetchAllPassesCloud() {
    if (!this.isConfigured) return null;
    const { data, error } = await this.client
      .from('digital_passes')
      .select('*');
    return data;
  }

  /**
   * Fetches all passes from Supabase ordered by issue date (newest first)
   * Used for cross-device startup sync
   */
  async syncPassesFromCloud() {
    if (!this.isConfigured) return [];
    try {
      const { data, error } = await this.client
        .from('digital_passes')
        .select('*')
        .order('issued_at', { ascending: false });
      if (error) { console.error("Supabase sync error:", error); return []; }
      console.log(`☁️ Synced ${(data || []).length} passes from Supabase cloud.`);
      return data || [];
    } catch (e) {
      console.error("Supabase syncPassesFromCloud failed:", e);
      return [];
    }
  }

  /**
   * Saves a payment record to the Supabase payments table
   */
  async savePaymentToCloud(paymentData) {
    if (!this.isConfigured) return null;
    const { data, error } = await this.client
      .from('payments')
      .upsert([paymentData], { onConflict: 'id' });
    if (error) console.error("Supabase payment insert error:", error);
    return data;
  }

  /**
   * Saves an audit log entry to Supabase audit_logs table
   */
  async saveAuditLogToCloud(logData) {
    if (!this.isConfigured) return null;
    const { data, error } = await this.client
      .from('audit_logs')
      .insert([{
        event_type: logData.event_type,
        actor: logData.actor,
        details: logData.details,
        severity: logData.severity || 'INFO',
        ip_address: logData.ip_address || '127.0.0.1'
      }]);
    if (error) console.error("Supabase audit log error:", error);
    return data;
  }

  /**
   * Cross-device pass lookup — finds a pass by pass_id or qr_token directly in Supabase.
   * Used by gate scanner as a fallback when pass is not in local cache.
   */
  async findPassByTokenCloud(queryStr) {
    if (!this.isConfigured) return null;
    try {
      const clean = queryStr.trim().toLowerCase();
      const { data, error } = await this.client
        .from('digital_passes')
        .select('*')
        .or(`pass_id.ilike.${clean},qr_token.ilike.${clean}`)
        .limit(1);
      if (error || !data || data.length === 0) return null;
      return data[0];
    } catch (e) {
      console.error("Supabase findPassByTokenCloud error:", e);
      return null;
    }
  }
}

const supabaseService = new SupabaseService();
