export interface RiskIndicator {
  name: string
  icon: string
  score: number
  weight: number
  confidence: number
  reasoning: string
  evidence: Record<string, unknown>
}

export interface Transaction {
  id: string
  withdrawal_id: string
  customer: {
    name: string
    email: string
    country: string
    registration_date: string
    account_age_days: number
    total_deposits: number
    total_withdrawals: number
    account_type: string
  }
  amount: number
  currency: string
  payment_method: 'card' | 'ewallet' | 'bank' | 'crypto'
  recipient: {
    name: string
    account_number: string
    bank: string
  }
  ip_address: string
  device: string
  risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'approved' | 'escalated' | 'blocked'
  indicators: RiskIndicator[]
  llm_decision?: {
    reasoning: string
    recommendation: string
    confidence: number
  }
  created_at: string
  updated_at: string
}

export type TransactionStatus = 'all' | 'pending' | 'approved' | 'escalated' | 'blocked'

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-001',
    withdrawal_id: 'WD-2024-001',
    customer: {
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      country: 'Singapore',
      registration_date: '2023-01-15',
      account_age_days: 742,
      total_deposits: 45200,
      total_withdrawals: 12300,
      account_type: 'Premium',
    },
    amount: 1500.00,
    currency: 'USD',
    payment_method: 'bank',
    recipient: { name: 'Sarah Chen', account_number: '****4521', bank: 'DBS Bank' },
    ip_address: '103.12.45.67',
    device: 'Chrome 120 / macOS',
    risk_score: 0.15,
    risk_level: 'low',
    status: 'approved',
    indicators: [
      { name: 'amount_anomaly', icon: 'lucide:trending-up', score: 0.10, weight: 0.15, confidence: 0.95, reasoning: 'Amount is within normal range for this customer', evidence: { avg_withdrawal: 1200, std_dev: 450, z_score: 0.67 } },
      { name: 'velocity', icon: 'lucide:gauge', score: 0.08, weight: 0.15, confidence: 0.92, reasoning: 'Normal transaction frequency - 2 withdrawals this week', evidence: { transactions_24h: 1, transactions_7d: 2, avg_weekly: 2.1 } },
      { name: 'payment_method', icon: 'lucide:credit-card', score: 0.05, weight: 0.10, confidence: 0.98, reasoning: 'Established bank transfer method used 12 times before', evidence: { method_age_days: 340, usage_count: 12, verified: true } },
      { name: 'geographic', icon: 'lucide:map-pin', score: 0.12, weight: 0.15, confidence: 0.90, reasoning: 'IP location matches registered country', evidence: { ip_country: 'Singapore', registered_country: 'Singapore', distance_km: 0 } },
      { name: 'device_fingerprint', icon: 'lucide:smartphone', score: 0.10, weight: 0.10, confidence: 0.88, reasoning: 'Known device used in last 30 logins', evidence: { device_seen_count: 42, first_seen: '2023-02-01', is_trusted: true } },
      { name: 'trading_behavior', icon: 'lucide:bar-chart-3', score: 0.20, weight: 0.15, confidence: 0.85, reasoning: 'Consistent trading pattern over 2 years', evidence: { pattern_deviation: 0.15, profit_loss_ratio: 1.2, strategy_change: false } },
      { name: 'recipient', icon: 'lucide:user-check', score: 0.05, weight: 0.10, confidence: 0.96, reasoning: 'Same recipient as previous 10 withdrawals', evidence: { recipient_seen: 10, same_name: true, same_bank: true } },
      { name: 'card_errors', icon: 'lucide:alert-triangle', score: 0.02, weight: 0.10, confidence: 0.99, reasoning: 'No card errors in account history', evidence: { errors_30d: 0, errors_90d: 0, decline_rate: 0.0 } },
    ],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:45Z',
  },
  {
    id: 'TXN-002',
    withdrawal_id: 'WD-2024-002',
    customer: {
      name: 'Viktor Petrov',
      email: 'v.petrov@mail.ru',
      country: 'Russia',
      registration_date: '2023-08-20',
      account_age_days: 148,
      total_deposits: 8500,
      total_withdrawals: 7200,
      account_type: 'Standard',
    },
    amount: 4800.00,
    currency: 'USD',
    payment_method: 'crypto',
    recipient: { name: 'External Wallet', account_number: '0x7a3b...f29e', bank: 'Ethereum' },
    ip_address: '185.220.101.42',
    device: 'Firefox 119 / Windows',
    risk_score: 0.52,
    risk_level: 'medium',
    status: 'escalated',
    indicators: [
      { name: 'amount_anomaly', icon: 'lucide:trending-up', score: 0.55, weight: 0.15, confidence: 0.88, reasoning: 'Withdrawal amount is 2.3x the customer average', evidence: { avg_withdrawal: 2100, std_dev: 800, z_score: 2.3 } },
      { name: 'velocity', icon: 'lucide:gauge', score: 0.45, weight: 0.15, confidence: 0.85, reasoning: 'Slightly elevated - 4 withdrawals this week vs avg 2', evidence: { transactions_24h: 2, transactions_7d: 4, avg_weekly: 2.0 } },
      { name: 'payment_method', icon: 'lucide:credit-card', score: 0.40, weight: 0.10, confidence: 0.82, reasoning: 'Crypto wallet first used 5 days ago', evidence: { method_age_days: 5, usage_count: 2, verified: false } },
      { name: 'geographic', icon: 'lucide:map-pin', score: 0.80, weight: 0.15, confidence: 0.92, reasoning: 'IP location differs from registered country - VPN detected', evidence: { ip_country: 'Netherlands', registered_country: 'Russia', distance_km: 2200, vpn_detected: true } },
      { name: 'device_fingerprint', icon: 'lucide:smartphone', score: 0.70, weight: 0.10, confidence: 0.78, reasoning: 'New device - first seen 3 days ago', evidence: { device_seen_count: 3, first_seen: '2024-01-12', is_trusted: false } },
      { name: 'trading_behavior', icon: 'lucide:bar-chart-3', score: 0.35, weight: 0.15, confidence: 0.80, reasoning: 'Moderate deviation from usual trading pattern', evidence: { pattern_deviation: 0.45, profit_loss_ratio: 0.8, strategy_change: true } },
      { name: 'recipient', icon: 'lucide:user-check', score: 0.60, weight: 0.10, confidence: 0.75, reasoning: 'New crypto recipient not previously used', evidence: { recipient_seen: 0, same_name: false, same_bank: false } },
      { name: 'card_errors', icon: 'lucide:alert-triangle', score: 0.15, weight: 0.10, confidence: 0.90, reasoning: '1 card decline in last 30 days', evidence: { errors_30d: 1, errors_90d: 2, decline_rate: 0.05 } },
    ],
    llm_decision: {
      reasoning: 'The combination of geographic anomaly (VPN usage from Netherlands while registered in Russia), new device fingerprint, and new crypto recipient suggests potential account compromise. However, the trading behavior deviation is moderate and the account has some history. Recommend manual review before blocking.',
      recommendation: 'ESCALATE',
      confidence: 0.72,
    },
    created_at: '2024-01-15T11:15:00Z',
    updated_at: '2024-01-15T11:15:30Z',
  },
  {
    id: 'TXN-003',
    withdrawal_id: 'WD-2024-003',
    customer: {
      name: 'James Morrison',
      email: 'j.morrison@protonmail.com',
      country: 'United Kingdom',
      registration_date: '2024-01-02',
      account_age_days: 13,
      total_deposits: 25000,
      total_withdrawals: 24500,
      account_type: 'Standard',
    },
    amount: 24500.00,
    currency: 'USD',
    payment_method: 'card',
    recipient: { name: 'James M', account_number: '****8891', bank: 'Revolut' },
    ip_address: '45.134.26.89',
    device: 'Safari 17 / iOS',
    risk_score: 0.85,
    risk_level: 'critical',
    status: 'blocked',
    indicators: [
      { name: 'amount_anomaly', icon: 'lucide:trending-up', score: 0.80, weight: 0.15, confidence: 0.95, reasoning: 'Attempting to withdraw 98% of deposited funds within 13 days', evidence: { avg_withdrawal: 0, std_dev: 0, z_score: 99, deposit_ratio: 0.98 } },
      { name: 'velocity', icon: 'lucide:gauge', score: 0.90, weight: 0.15, confidence: 0.93, reasoning: 'Rapid deposit-withdrawal cycle detected - 5 deposits in 3 days', evidence: { transactions_24h: 3, transactions_7d: 8, avg_weekly: 0, rapid_cycle: true } },
      { name: 'payment_method', icon: 'lucide:credit-card', score: 0.65, weight: 0.10, confidence: 0.88, reasoning: 'Different card used for withdrawal than deposits', evidence: { method_age_days: 1, usage_count: 1, verified: false, mismatch: true } },
      { name: 'geographic', icon: 'lucide:map-pin', score: 0.75, weight: 0.15, confidence: 0.90, reasoning: 'IP geolocates to datacenter, likely proxy', evidence: { ip_country: 'United Kingdom', registered_country: 'United Kingdom', distance_km: 0, datacenter_ip: true } },
      { name: 'device_fingerprint', icon: 'lucide:smartphone', score: 0.85, weight: 0.10, confidence: 0.92, reasoning: 'Device fingerprint matches known fraud ring pattern', evidence: { device_seen_count: 1, first_seen: '2024-01-02', is_trusted: false, fraud_ring_match: true } },
      { name: 'trading_behavior', icon: 'lucide:bar-chart-3', score: 0.95, weight: 0.15, confidence: 0.96, reasoning: 'No actual trading activity - account used only for money movement', evidence: { pattern_deviation: 1.0, profit_loss_ratio: 0, strategy_change: false, trades_count: 0 } },
      { name: 'recipient', icon: 'lucide:user-check', score: 0.70, weight: 0.10, confidence: 0.85, reasoning: 'Recipient name slightly differs from account name', evidence: { recipient_seen: 0, same_name: false, name_similarity: 0.6, same_bank: false } },
      { name: 'card_errors', icon: 'lucide:alert-triangle', score: 0.60, weight: 0.10, confidence: 0.91, reasoning: '3 card errors before successful deposit', evidence: { errors_30d: 3, errors_90d: 3, decline_rate: 0.25 } },
    ],
    created_at: '2024-01-15T14:22:00Z',
    updated_at: '2024-01-15T14:22:15Z',
  },
  {
    id: 'TXN-004',
    withdrawal_id: 'WD-2024-004',
    customer: {
      name: 'Aiko Tanaka',
      email: 'aiko.t@gmail.com',
      country: 'Japan',
      registration_date: '2022-06-10',
      account_age_days: 950,
      total_deposits: 120000,
      total_withdrawals: 68000,
      account_type: 'VIP',
    },
    amount: 5000.00,
    currency: 'USD',
    payment_method: 'bank',
    recipient: { name: 'Aiko Tanaka', account_number: '****7732', bank: 'MUFG Bank' },
    ip_address: '126.72.104.55',
    device: 'Chrome 120 / Windows',
    risk_score: 0.08,
    risk_level: 'low',
    status: 'approved',
    indicators: [
      { name: 'amount_anomaly', icon: 'lucide:trending-up', score: 0.05, weight: 0.15, confidence: 0.97, reasoning: 'Amount well within normal range', evidence: { avg_withdrawal: 4800, std_dev: 1200, z_score: 0.17 } },
      { name: 'velocity', icon: 'lucide:gauge', score: 0.03, weight: 0.15, confidence: 0.96, reasoning: 'Regular monthly withdrawal pattern', evidence: { transactions_24h: 1, transactions_7d: 1, avg_weekly: 1.0 } },
      { name: 'payment_method', icon: 'lucide:credit-card', score: 0.02, weight: 0.10, confidence: 0.99, reasoning: 'Same bank account used for 2.5 years', evidence: { method_age_days: 920, usage_count: 28, verified: true } },
      { name: 'geographic', icon: 'lucide:map-pin', score: 0.05, weight: 0.15, confidence: 0.95, reasoning: 'IP consistently from Tokyo, Japan', evidence: { ip_country: 'Japan', registered_country: 'Japan', distance_km: 0 } },
      { name: 'device_fingerprint', icon: 'lucide:smartphone', score: 0.08, weight: 0.10, confidence: 0.94, reasoning: 'Trusted device used for 8 months', evidence: { device_seen_count: 85, first_seen: '2023-05-15', is_trusted: true } },
      { name: 'trading_behavior', icon: 'lucide:bar-chart-3', score: 0.10, weight: 0.15, confidence: 0.92, reasoning: 'Consistent profitable trading over 2+ years', evidence: { pattern_deviation: 0.08, profit_loss_ratio: 1.45, strategy_change: false } },
      { name: 'recipient', icon: 'lucide:user-check', score: 0.03, weight: 0.10, confidence: 0.98, reasoning: 'Same verified recipient for all withdrawals', evidence: { recipient_seen: 28, same_name: true, same_bank: true } },
      { name: 'card_errors', icon: 'lucide:alert-triangle', score: 0.01, weight: 0.10, confidence: 0.99, reasoning: 'Zero errors in account history', evidence: { errors_30d: 0, errors_90d: 0, decline_rate: 0.0 } },
    ],
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:00:30Z',
  },
  {
    id: 'TXN-005',
    withdrawal_id: 'WD-2024-005',
    customer: {
      name: 'Maria Silva',
      email: 'maria.silva@outlook.com',
      country: 'Brazil',
      registration_date: '2023-11-05',
      account_age_days: 71,
      total_deposits: 15000,
      total_withdrawals: 3200,
      account_type: 'Standard',
    },
    amount: 8500.00,
    currency: 'USD',
    payment_method: 'ewallet',
    recipient: { name: 'Maria S', account_number: 'PIX: ****@email', bank: 'Nubank' },
    ip_address: '177.38.219.44',
    device: 'Chrome 120 / Android',
    risk_score: 0.62,
    risk_level: 'medium',
    status: 'escalated',
    indicators: [
      { name: 'amount_anomaly', icon: 'lucide:trending-up', score: 0.72, weight: 0.15, confidence: 0.90, reasoning: 'Withdrawal 5.3x higher than previous average', evidence: { avg_withdrawal: 1600, std_dev: 400, z_score: 5.3 } },
      { name: 'velocity', icon: 'lucide:gauge', score: 0.55, weight: 0.15, confidence: 0.87, reasoning: '3 withdrawal attempts in 24 hours', evidence: { transactions_24h: 3, transactions_7d: 3, avg_weekly: 0.5 } },
      { name: 'payment_method', icon: 'lucide:credit-card', score: 0.50, weight: 0.10, confidence: 0.83, reasoning: 'E-wallet method added 2 days ago', evidence: { method_age_days: 2, usage_count: 1, verified: true } },
      { name: 'geographic', icon: 'lucide:map-pin', score: 0.15, weight: 0.15, confidence: 0.93, reasoning: 'IP from Sao Paulo matches registration', evidence: { ip_country: 'Brazil', registered_country: 'Brazil', distance_km: 0 } },
      { name: 'device_fingerprint', icon: 'lucide:smartphone', score: 0.45, weight: 0.10, confidence: 0.80, reasoning: 'Device seen 8 times but new browser version', evidence: { device_seen_count: 8, first_seen: '2023-11-10', is_trusted: true, browser_change: true } },
      { name: 'trading_behavior', icon: 'lucide:bar-chart-3', score: 0.65, weight: 0.15, confidence: 0.82, reasoning: 'Recent aggressive trading with significant losses', evidence: { pattern_deviation: 0.6, profit_loss_ratio: 0.4, strategy_change: true } },
      { name: 'recipient', icon: 'lucide:user-check', score: 0.40, weight: 0.10, confidence: 0.78, reasoning: 'New PIX recipient not used before', evidence: { recipient_seen: 0, same_name: false, name_similarity: 0.8, same_bank: false } },
      { name: 'card_errors', icon: 'lucide:alert-triangle', score: 0.30, weight: 0.10, confidence: 0.88, reasoning: '2 failed attempts before switching to e-wallet', evidence: { errors_30d: 2, errors_90d: 2, decline_rate: 0.15 } },
    ],
    llm_decision: {
      reasoning: 'While the geographic location and device are consistent, the significant amount anomaly (5.3x average), velocity spike, and recent trading losses suggest this could be a distressed withdrawal or potential account compromise. The new e-wallet method after card failures raises additional concern. Manual review recommended to verify customer intent.',
      recommendation: 'ESCALATE',
      confidence: 0.68,
    },
    created_at: '2024-01-15T16:45:00Z',
    updated_at: '2024-01-15T16:45:20Z',
  },
  {
    id: 'TXN-006',
    withdrawal_id: 'WD-2024-006',
    customer: {
      name: 'Ahmed Hassan',
      email: 'a.hassan@gmail.com',
      country: 'UAE',
      registration_date: '2023-05-22',
      account_age_days: 238,
      total_deposits: 35000,
      total_withdrawals: 18000,
      account_type: 'Premium',
    },
    amount: 3200.00,
    currency: 'USD',
    payment_method: 'bank',
    recipient: { name: 'Ahmed Hassan', account_number: '****6644', bank: 'Emirates NBD' },
    ip_address: '94.56.229.12',
    device: 'Safari 17 / macOS',
    risk_score: 0.22,
    risk_level: 'low',
    status: 'approved',
    indicators: [
      { name: 'amount_anomaly', icon: 'lucide:trending-up', score: 0.18, weight: 0.15, confidence: 0.93, reasoning: 'Normal withdrawal amount', evidence: { avg_withdrawal: 3000, std_dev: 800, z_score: 0.25 } },
      { name: 'velocity', icon: 'lucide:gauge', score: 0.12, weight: 0.15, confidence: 0.91, reasoning: 'Regular withdrawal pattern', evidence: { transactions_24h: 1, transactions_7d: 1, avg_weekly: 1.2 } },
      { name: 'payment_method', icon: 'lucide:credit-card', score: 0.08, weight: 0.10, confidence: 0.96, reasoning: 'Verified bank account used 15 times', evidence: { method_age_days: 230, usage_count: 15, verified: true } },
      { name: 'geographic', icon: 'lucide:map-pin', score: 0.20, weight: 0.15, confidence: 0.89, reasoning: 'IP from Dubai matches registration', evidence: { ip_country: 'UAE', registered_country: 'UAE', distance_km: 0 } },
      { name: 'device_fingerprint', icon: 'lucide:smartphone', score: 0.15, weight: 0.10, confidence: 0.90, reasoning: 'Trusted device used regularly', evidence: { device_seen_count: 52, first_seen: '2023-06-01', is_trusted: true } },
      { name: 'trading_behavior', icon: 'lucide:bar-chart-3', score: 0.25, weight: 0.15, confidence: 0.87, reasoning: 'Stable trading behavior', evidence: { pattern_deviation: 0.18, profit_loss_ratio: 1.1, strategy_change: false } },
      { name: 'recipient', icon: 'lucide:user-check', score: 0.10, weight: 0.10, confidence: 0.95, reasoning: 'Same verified recipient', evidence: { recipient_seen: 15, same_name: true, same_bank: true } },
      { name: 'card_errors', icon: 'lucide:alert-triangle', score: 0.05, weight: 0.10, confidence: 0.97, reasoning: 'No recent errors', evidence: { errors_30d: 0, errors_90d: 0, decline_rate: 0.0 } },
    ],
    created_at: '2024-01-15T08:15:00Z',
    updated_at: '2024-01-15T08:15:25Z',
  },
  {
    id: 'TXN-007',
    withdrawal_id: 'WD-2024-007',
    customer: {
      name: 'Chen Wei',
      email: 'chen.wei88@163.com',
      country: 'China',
      registration_date: '2024-01-10',
      account_age_days: 5,
      total_deposits: 50000,
      total_withdrawals: 0,
      account_type: 'Standard',
    },
    amount: 49500.00,
    currency: 'USD',
    payment_method: 'crypto',
    recipient: { name: 'Unknown', account_number: 'bc1q...x8m2', bank: 'Bitcoin' },
    ip_address: '223.104.63.118',
    device: 'Unknown Browser / Linux',
    risk_score: 0.93,
    risk_level: 'critical',
    status: 'blocked',
    indicators: [
      { name: 'amount_anomaly', icon: 'lucide:trending-up', score: 0.95, weight: 0.15, confidence: 0.98, reasoning: 'Attempting to withdraw 99% of deposited funds within 5 days of account creation', evidence: { avg_withdrawal: 0, std_dev: 0, z_score: 99, deposit_ratio: 0.99 } },
      { name: 'velocity', icon: 'lucide:gauge', score: 0.92, weight: 0.15, confidence: 0.96, reasoning: 'First withdrawal on a 5-day-old account with max deposit', evidence: { transactions_24h: 1, transactions_7d: 1, avg_weekly: 0, account_age_days: 5 } },
      { name: 'payment_method', icon: 'lucide:credit-card', score: 0.85, weight: 0.10, confidence: 0.94, reasoning: 'Crypto withdrawal on new account - high risk pattern', evidence: { method_age_days: 0, usage_count: 0, verified: false } },
      { name: 'geographic', icon: 'lucide:map-pin', score: 0.88, weight: 0.15, confidence: 0.93, reasoning: 'IP from known high-risk region, multiple proxy layers detected', evidence: { ip_country: 'China', registered_country: 'China', distance_km: 0, proxy_detected: true, tor_exit: true } },
      { name: 'device_fingerprint', icon: 'lucide:smartphone', score: 0.90, weight: 0.10, confidence: 0.95, reasoning: 'Device fingerprint associated with 3 other blocked accounts', evidence: { device_seen_count: 1, first_seen: '2024-01-10', is_trusted: false, linked_blocked_accounts: 3 } },
      { name: 'trading_behavior', icon: 'lucide:bar-chart-3', score: 0.98, weight: 0.15, confidence: 0.97, reasoning: 'Zero trading activity - classic money laundering pattern', evidence: { pattern_deviation: 1.0, profit_loss_ratio: 0, strategy_change: false, trades_count: 0 } },
      { name: 'recipient', icon: 'lucide:user-check', score: 0.92, weight: 0.10, confidence: 0.94, reasoning: 'Bitcoin address flagged in external fraud database', evidence: { recipient_seen: 0, same_name: false, external_flag: true, fraud_db_match: true } },
      { name: 'card_errors', icon: 'lucide:alert-triangle', score: 0.70, weight: 0.10, confidence: 0.92, reasoning: 'Multiple card attempts from different issuers before successful deposit', evidence: { errors_30d: 5, errors_90d: 5, decline_rate: 0.50, different_cards: 4 } },
    ],
    created_at: '2024-01-15T19:30:00Z',
    updated_at: '2024-01-15T19:30:05Z',
  },
  {
    id: 'TXN-008',
    withdrawal_id: 'WD-2024-008',
    customer: {
      name: 'Lisa Mueller',
      email: 'l.mueller@web.de',
      country: 'Germany',
      registration_date: '2023-03-10',
      account_age_days: 311,
      total_deposits: 28000,
      total_withdrawals: 15500,
      account_type: 'Premium',
    },
    amount: 2800.00,
    currency: 'EUR',
    payment_method: 'bank',
    recipient: { name: 'Lisa Mueller', account_number: 'DE89****4321', bank: 'Deutsche Bank' },
    ip_address: '87.123.45.89',
    device: 'Firefox 121 / Windows',
    risk_score: 0.18,
    risk_level: 'low',
    status: 'pending',
    indicators: [
      { name: 'amount_anomaly', icon: 'lucide:trending-up', score: 0.12, weight: 0.15, confidence: 0.94, reasoning: 'Standard monthly withdrawal', evidence: { avg_withdrawal: 2600, std_dev: 500, z_score: 0.4 } },
      { name: 'velocity', icon: 'lucide:gauge', score: 0.10, weight: 0.15, confidence: 0.93, reasoning: 'Normal frequency', evidence: { transactions_24h: 1, transactions_7d: 1, avg_weekly: 0.8 } },
      { name: 'payment_method', icon: 'lucide:credit-card', score: 0.05, weight: 0.10, confidence: 0.97, reasoning: 'Verified IBAN used consistently', evidence: { method_age_days: 300, usage_count: 10, verified: true } },
      { name: 'geographic', icon: 'lucide:map-pin', score: 0.10, weight: 0.15, confidence: 0.92, reasoning: 'Munich IP matches registration', evidence: { ip_country: 'Germany', registered_country: 'Germany', distance_km: 0 } },
      { name: 'device_fingerprint', icon: 'lucide:smartphone', score: 0.12, weight: 0.10, confidence: 0.91, reasoning: 'Known device', evidence: { device_seen_count: 35, first_seen: '2023-03-15', is_trusted: true } },
      { name: 'trading_behavior', icon: 'lucide:bar-chart-3', score: 0.20, weight: 0.15, confidence: 0.88, reasoning: 'Stable trading', evidence: { pattern_deviation: 0.12, profit_loss_ratio: 1.3, strategy_change: false } },
      { name: 'recipient', icon: 'lucide:user-check', score: 0.08, weight: 0.10, confidence: 0.96, reasoning: 'Same recipient always', evidence: { recipient_seen: 10, same_name: true, same_bank: true } },
      { name: 'card_errors', icon: 'lucide:alert-triangle', score: 0.03, weight: 0.10, confidence: 0.98, reasoning: 'No errors', evidence: { errors_30d: 0, errors_90d: 0, decline_rate: 0.0 } },
    ],
    created_at: '2024-01-16T07:30:00Z',
    updated_at: '2024-01-16T07:30:00Z',
  },
]

export function useTransactions() {
  const transactions = ref<Transaction[]>(MOCK_TRANSACTIONS)
  const selectedStatus = ref<TransactionStatus>('all')
  const searchQuery = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const dateFrom = ref('')
  const dateTo = ref('')

  const filteredTransactions = computed(() => {
    let result = transactions.value

    if (selectedStatus.value !== 'all') {
      result = result.filter(t => t.status === selectedStatus.value)
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(t =>
        t.customer.name.toLowerCase().includes(query) ||
        t.customer.email.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query),
      )
    }

    if (dateFrom.value) {
      result = result.filter(t => t.created_at >= dateFrom.value)
    }
    if (dateTo.value) {
      result = result.filter(t => t.created_at <= dateTo.value)
    }

    return result
  })

  const paginatedTransactions = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredTransactions.value.slice(start, start + pageSize.value)
  })

  const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / pageSize.value))

  const statusCounts = computed(() => ({
    all: transactions.value.length,
    pending: transactions.value.filter(t => t.status === 'pending').length,
    approved: transactions.value.filter(t => t.status === 'approved').length,
    escalated: transactions.value.filter(t => t.status === 'escalated').length,
    blocked: transactions.value.filter(t => t.status === 'blocked').length,
  }))

  function updateTransactionStatus(id: string, newStatus: Transaction['status']) {
    const tx = transactions.value.find(t => t.id === id)
    if (tx) {
      tx.status = newStatus
      tx.updated_at = new Date().toISOString()
    }
  }

  function exportCSV() {
    const headers = ['ID', 'Customer', 'Email', 'Amount', 'Currency', 'Method', 'Risk Score', 'Status', 'Created']
    const rows = filteredTransactions.value.map(t => [
      t.id,
      t.customer.name,
      t.customer.email,
      t.amount.toString(),
      t.currency,
      t.payment_method,
      t.risk_score.toString(),
      t.status,
      t.created_at,
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    transactions,
    selectedStatus,
    searchQuery,
    currentPage,
    pageSize,
    dateFrom,
    dateTo,
    filteredTransactions,
    paginatedTransactions,
    totalPages,
    statusCounts,
    updateTransactionStatus,
    exportCSV,
  }
}
