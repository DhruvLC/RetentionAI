import { createClient } from '@supabase/supabase-js';
import { Customer, AuditLog } from '../types.js';

let supabaseClient: any = null;

export function getSupabaseValidationError(): string | null {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  
  if (!url && !anonKey) {
    return null;
  }
  if ((url && !anonKey) || (!url && anonKey)) {
    return "Both SUPABASE_URL and SUPABASE_ANON_KEY must be provided together in your Environment Secrets.";
  }
  if (url === 'MY_SUPABASE_URL' || anonKey === 'MY_SUPABASE_ANON_KEY') {
    return "The template environment keys need to be replaced with your actual keys from Supabase.";
  }
  if (url && (url.includes('/dashboard') || url.includes('/project/') || url.includes('/projects/'))) {
    return "The configured SUPABASE_URL appears to be your Supabase Dashboard browser URL (e.g. at supabase.com/dashboard/project/...) rather than the actual REST API Endpoint. Please copy the 'Project URL' from settings, which looks like 'https://[project-id].supabase.co'.";
  }
  if (url && !url.startsWith('https://')) {
    return "The SUPABASE_URL is invalid. It must start with 'https://'.";
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey || url === 'MY_SUPABASE_URL' || anonKey === 'MY_SUPABASE_ANON_KEY') {
    return false;
  }
  // If there's a validation error, we do not consider it successfully configured
  if (getSupabaseValidationError() !== null) {
    return false;
  }
  return true;
}

export function getSupabase() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
    } catch (err) {
      console.error("[Supabase] Failed to initialize client:", err);
    }
  }
  return supabaseClient;
}

// SQL query snippet that users can run to set up their Supabase database
export const SUPABASE_SQL_SETUP = `-- Copy and paste this into your Supabase SQL Editor to prepare your tables:

-- Create Customers table
CREATE TABLE IF NOT EXISTS public.retention_customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    region TEXT,
    tenure_months INTEGER,
    age INTEGER,
    plan_type TEXT,
    login_frequency INTEGER,
    website_visits INTEGER,
    app_usage_hours INTEGER,
    order_count INTEGER,
    average_order_value NUMERIC,
    revenue NUMERIC,
    tickets_raised INTEGER,
    complaint_count INTEGER,
    recency_days INTEGER,
    frequency NUMERIC,
    monetary_value NUMERIC,
    churn_probability NUMERIC,
    churn_score INTEGER,
    churn_category TEXT,
    churn_drivers JSONB,
    predicted_clv NUMERIC,
    clv_category TEXT,
    expected_purchases_30d NUMERIC,
    remaining_tenure_months NUMERIC,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.retention_customers ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow full access for authenticated backend processes/anon key)
CREATE POLICY "Allow public read access" ON public.retention_customers FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.retention_customers FOR ALL USING (true) WITH CHECK (true);

-- Create Audit Logs table
CREATE TABLE IF NOT EXISTS public.retention_audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    "user" TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT,
    ip_address TEXT,
    status TEXT NOT NULL
);

ALTER TABLE public.retention_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on logs" ON public.retention_audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public write access on logs" ON public.retention_audit_logs FOR ALL USING (true) WITH CHECK (true);
`;

// Map database row keys from CamelCase to SnakeCase
function mapToDatabaseRow(c: Customer): any {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    region: c.region || "US-East",
    tenure_months: c.tenureMonths || 0,
    age: c.age || 0,
    plan_type: c.planType || 'Standard',
    login_frequency: c.loginFrequency || 0,
    website_visits: c.websiteVisits || 0,
    app_usage_hours: c.appUsageHours || 0,
    order_count: c.orderCount || 0,
    average_order_value: c.averageOrderValue || 0,
    revenue: c.revenue || 0,
    tickets_raised: c.ticketsRaised || 0,
    complaint_count: c.complaintCount || 0,
    recency_days: c.recencyDays || 0,
    frequency: c.frequency || 0,
    monetary_value: c.monetaryValue || 0,
    churn_probability: c.churnProbability || null,
    churn_score: c.churnScore || null,
    churn_category: c.churnCategory || null,
    churn_drivers: c.churnDrivers ? JSON.stringify(c.churnDrivers) : null,
    predicted_clv: c.predictedCLV || null,
    clv_category: c.clvCategory || null,
    expected_purchases_30d: c.expectedPurchases30d || null,
    remaining_tenure_months: c.remainingTenureMonths || null
  };
}

// Map SnakeCase database rows to CamelCase Customer objects
function mapFromDatabaseRow(row: any): Customer {
  let drivers = null;
  if (row.churn_drivers) {
    try {
      drivers = typeof row.churn_drivers === 'string' ? JSON.parse(row.churn_drivers) : row.churn_drivers;
    } catch {
      drivers = null;
    }
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    region: row.region,
    tenureMonths: row.tenure_months,
    age: row.age,
    planType: row.plan_type,
    loginFrequency: row.login_frequency,
    websiteVisits: row.website_visits,
    appUsageHours: row.app_usage_hours,
    orderCount: row.order_count,
    averageOrderValue: Number(row.average_order_value),
    revenue: Number(row.revenue),
    ticketsRaised: row.tickets_raised,
    complaintCount: row.complaint_count,
    recencyDays: row.recency_days,
    frequency: Number(row.frequency || 0),
    monetaryValue: Number(row.monetary_value || 0),
    churnProbability: row.churn_probability !== null ? Number(row.churn_probability) : undefined,
    churnScore: row.churn_score !== null ? Number(row.churn_score) : undefined,
    churnCategory: row.churn_category || undefined,
    churnDrivers: drivers || undefined,
    predictedCLV: row.predicted_clv !== null ? Number(row.predicted_clv) : undefined,
    clvCategory: row.clv_category || undefined,
    expectedPurchases30d: row.expected_purchases_30d !== null ? Number(row.expected_purchases_30d) : undefined,
    remainingTenureMonths: row.remaining_tenure_months !== null ? Number(row.remaining_tenure_months) : undefined
  };
}

// Map AuditLog database properties
function mapToAuditLogDb(log: AuditLog): any {
  return {
    id: log.id,
    timestamp: log.timestamp,
    user: log.user,
    action: log.action,
    module: log.module,
    ip_address: log.ipAddress,
    status: log.status
  };
}

function mapFromAuditLogDb(row: any): AuditLog {
  return {
    id: row.id,
    timestamp: row.timestamp,
    user: row.user,
    action: row.action,
    module: row.module,
    ipAddress: row.ip_address,
    status: row.status as 'SUCCESS' | 'FAILURE'
  };
}

export async function fetchCustomersFromSupabase(): Promise<Customer[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('retention_customers')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error("[Supabase] fetch error:", error.message);
      return null;
    }

    return (data || []).map(mapFromDatabaseRow);
  } catch (err: any) {
    console.error("[Supabase] Unexpected fetch error:", err);
    return null;
  }
}

export async function upsertCustomersToSupabase(customers: Customer[]): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const rows = customers.map(mapToDatabaseRow);
    const { error } = await sb
      .from('retention_customers')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error("[Supabase] upsert error:", error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error("[Supabase] Unexpected upsert error:", err);
    return false;
  }
}

export async function saveAuditLogToSupabase(log: AuditLog): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const row = mapToAuditLogDb(log);
    const { error } = await sb
      .from('retention_audit_logs')
      .insert([row]);

    if (error) {
      console.error("[Supabase] log insert error:", error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error("[Supabase] Unexpected log insert error:", err);
    return false;
  }
}

export async function fetchAuditLogsFromSupabase(): Promise<AuditLog[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('retention_audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(200);

    if (error) {
      console.error("[Supabase] log fetch error:", error.message);
      return null;
    }
    return (data || []).map(mapFromAuditLogDb);
  } catch (err: any) {
    console.error("[Supabase] Unexpected log fetch error:", err);
    return null;
  }
}
