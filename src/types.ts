export interface Customer {
  id: string;
  name: string;
  email: string;
  region: string;
  tenureMonths: number;
  age: number;
  planType: 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
  loginFrequency: number;     // monthly
  websiteVisits: number;
  appUsageHours: number;
  orderCount: number;
  averageOrderValue: number;
  revenue: number;            // Total spend
  ticketsRaised: number;
  complaintCount: number;
  recencyDays: number;         // days since last order
  frequency: number;          // orders per month
  monetaryValue: number;      // total customer value

  // Model Predictions (computed)
  churnProbability?: number;   // 0 to 1
  churnScore?: number;         // 1 to 100
  churnCategory?: 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical Risk';
  churnDrivers?: { feature: string; impact: number; description: string }[];
  predictedCLV?: number;       // Predicted lifetime value
  clvCategory?: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  expectedPurchases30d?: number;
  remainingTenureMonths?: number;
}

export interface ModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number;
}

export interface IngestionProfile {
  fileName: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
  dataQualityScore: number;     // 0 to 100
  missingValues: Record<string, number>;
  anomaliesDetected: number;
  columnsDetected: string[];
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  ipAddress: string;
  eventType: 'FIREWALL_BLOCK' | 'MALWARE_SCAN' | 'FAILED_LOGIN' | 'UNAUTHORIZED_ACCESS' | 'API_LIMIT_EXCEEDED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
  status: 'BLOCKED' | 'LOGGED' | 'FLAGGED';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILURE';
}

export interface RevenueForecast {
  period: string; // "30d" | "90d" | "180d" | "365d"
  forecastedRevenue: number;
  lowerBound: number;
  upperBound: number;
  activeCount: number;
}

export interface RetentionAction {
  id: string;
  name: string;
  category: string;
  targetRisk: string;
  cost: number;
  retentionLift: number; // probability improvement e.g. +15%
  savingsPotential: number; // recovery revenue
  description: string;
}
