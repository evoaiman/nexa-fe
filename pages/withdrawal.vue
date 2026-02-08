<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { formatCurrency } from '~/utils/formatters'

useHead({ title: 'Withdrawal - Nexa' })

interface WithdrawalMethod {
  id: string
  name: string
  icon: string
  processingTime: string
  fee: string
  feeAmount: number
  minAmount: number
  maxAmount: number
}

const withdrawalMethods: WithdrawalMethod[] = [
  { id: 'bank-transfer', name: 'Bank Transfer', icon: 'lucide:building', processingTime: '1-3 business days', fee: '0%', feeAmount: 0, minAmount: 50, maxAmount: 100000 },
  { id: 'wire', name: 'Wire Transfer', icon: 'lucide:building', processingTime: '3-5 business days', fee: '$35 flat', feeAmount: 35, minAmount: 500, maxAmount: 500000 },
  { id: 'card', name: 'Card Refund', icon: 'lucide:credit-card', processingTime: '3-5 business days', fee: '1.5%', feeAmount: 0, minAmount: 10, maxAmount: 25000 },
  { id: 'ewallet', name: 'E-Wallet', icon: 'lucide:wallet', processingTime: '1-2 business days', fee: '1%', feeAmount: 0, minAmount: 10, maxAmount: 10000 },
  { id: 'crypto', name: 'Crypto (BTC/ETH)', icon: 'lucide:bitcoin', processingTime: '10-60 minutes', fee: 'Network fee', feeAmount: 0, minAmount: 50, maxAmount: 200000 },
]

const accounts = [
  { id: 'CUST-001', label: 'Sarah Chen (GBR)', balance: 12450.00 },
  { id: 'CUST-002', label: 'James Wilson (USA)', balance: 15200.50 },
  { id: 'CUST-008', label: 'Maria Santos (BRA)', balance: 5890.25 },
  { id: 'CUST-011', label: 'Victor Petrov (RUS)', balance: 3200.00 },
  { id: 'CUST-007', label: 'David Park (KOR)', balance: 1850.00 },
  { id: 'CUST-004', label: 'Kenji Sato (JPN)', balance: 8700.00 },
]

const selectedMethod = ref<WithdrawalMethod | null>(null)
const selectedAccount = ref('CUST-001')
const amount = ref('')
const recipientName = ref('')
const recipientAccount = ref('')
const isSubmitting = ref(false)
const showSuccess = ref(false)
const showFraudNotice = ref(false)

interface EvalResult {
  evaluation_id: string
  decision: 'approved' | 'escalated' | 'blocked'
  risk_score: number
  risk_percent: number
  risk_level: 'low' | 'medium' | 'high'
  summary: string
  indicators: { name: string; display_name: string; score: number; reasoning: string; status: string }[]
  elapsed_s: number
}
const evalResult = ref<EvalResult | null>(null)

const currentAccount = computed(() => accounts.find(a => a.id === selectedAccount.value))

const parsedAmount = computed(() => {
  const val = parseFloat(amount.value)
  return isNaN(val) ? 0 : val
})

const calculatedFee = computed(() => {
  if (!selectedMethod.value || parsedAmount.value <= 0) return 0
  if (selectedMethod.value.id === 'wire') return 35
  if (selectedMethod.value.id === 'card') return parsedAmount.value * 0.015
  if (selectedMethod.value.id === 'ewallet') return parsedAmount.value * 0.01
  if (selectedMethod.value.id === 'crypto') return parsedAmount.value * 0.001
  return 0
})

const receiveAmount = computed(() => {
  if (parsedAmount.value <= 0) return 0
  return parsedAmount.value - calculatedFee.value
})

const amountError = computed(() => {
  if (!selectedMethod.value || !amount.value) return ''
  if (parsedAmount.value < selectedMethod.value.minAmount)
    return `Minimum withdrawal is ${formatCurrency(selectedMethod.value.minAmount)}`
  if (parsedAmount.value > selectedMethod.value.maxAmount)
    return `Maximum withdrawal is ${formatCurrency(selectedMethod.value.maxAmount)}`
  if (currentAccount.value && parsedAmount.value > currentAccount.value.balance)
    return 'Insufficient balance'
  return ''
})

const canSubmit = computed(() => {
  return selectedMethod.value
    && parsedAmount.value > 0
    && !amountError.value
    && selectedAccount.value
    && recipientName.value.trim()
    && recipientAccount.value.trim()
    && !isSubmitting.value
})

async function handleSubmit() {
  if (!canSubmit.value) return
  isSubmitting.value = true
  showFraudNotice.value = true
  evalResult.value = null

  try {
    const result = await $fetch<EvalResult>('/api/payout/evaluate', {
      method: 'POST',
      body: {
        withdrawal_id: crypto.randomUUID(),
        customer_id: selectedAccount.value,
        amount: parsedAmount.value,
        recipient_name: recipientName.value,
        recipient_account: recipientAccount.value,
        ip_address: '203.0.113.42',
        device_fingerprint: 'demo-device-001',
        customer_country: 'MYS',
      },
    })

    isSubmitting.value = false
    showFraudNotice.value = false
    evalResult.value = result
  } catch {
    // Fallback: simulate if BE is unreachable
    await new Promise(resolve => setTimeout(resolve, 2500))
    isSubmitting.value = false
    showFraudNotice.value = false
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
      amount.value = ''
      recipientName.value = ''
      recipientAccount.value = ''
      selectedMethod.value = null
    }, 3000)
  }
}

function dismissResult() {
  evalResult.value = null
  amount.value = ''
  recipientName.value = ''
  recipientAccount.value = ''
  selectedMethod.value = null
}

const topIndicators = computed(() => {
  if (!evalResult.value) return []
  return [...evalResult.value.indicators]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Request Withdrawal</h1>
      <p class="text-sm text-gray-500 mt-1">Withdraw funds from your trading account. All requests undergo AI-powered fraud evaluation.</p>
    </div>

    <!-- Fraud Evaluation Notice -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showFraudNotice" class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <Icon icon="lucide:loader-2" class="w-5 h-5 text-blue-600 shrink-0 animate-spin" />
        <div>
          <p class="text-sm font-medium text-blue-800">Running AI fraud evaluation...</p>
          <p class="text-xs text-blue-600 mt-0.5">Analyzing 8 risk indicators including amount anomaly, velocity, geographic, and device fingerprint.</p>
        </div>
      </div>
    </Transition>

    <!-- Success Message (fallback) -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showSuccess" class="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <Icon icon="lucide:check-circle" class="w-5 h-5 text-green-600 shrink-0" />
        <div>
          <p class="text-sm font-medium text-green-800">Withdrawal request submitted!</p>
          <p class="text-xs text-green-600 mt-0.5">Your request has been approved and is being processed. Track it on the Transactions page.</p>
        </div>
      </div>
    </Transition>

    <!-- AI Evaluation Result -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="evalResult" class="rounded-xl border overflow-hidden" :class="{
        'border-green-200 bg-green-50/50': evalResult.decision === 'approved',
        'border-yellow-200 bg-yellow-50/50': evalResult.decision === 'escalated',
        'border-red-200 bg-red-50/50': evalResult.decision === 'blocked',
      }">
        <div class="p-5 space-y-4">
          <!-- Header row: Decision badge + Risk score -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon
                :icon="evalResult.decision === 'approved' ? 'lucide:check-circle' : evalResult.decision === 'escalated' ? 'lucide:alert-triangle' : 'lucide:shield-x'"
                class="w-6 h-6"
                :class="{
                  'text-green-600': evalResult.decision === 'approved',
                  'text-yellow-600': evalResult.decision === 'escalated',
                  'text-red-600': evalResult.decision === 'blocked',
                }"
              />
              <div>
                <span class="inline-flex px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide" :class="{
                  'bg-green-100 text-green-700': evalResult.decision === 'approved',
                  'bg-yellow-100 text-yellow-700': evalResult.decision === 'escalated',
                  'bg-red-100 text-red-700': evalResult.decision === 'blocked',
                }">
                  {{ evalResult.decision }}
                </span>
                <p class="text-xs text-gray-500 mt-1">Processed in {{ evalResult.elapsed_s.toFixed(2) }}s</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold tabular-nums" :class="{
                'text-green-600': evalResult.risk_score < 0.3,
                'text-yellow-600': evalResult.risk_score >= 0.3 && evalResult.risk_score < 0.7,
                'text-red-600': evalResult.risk_score >= 0.7,
              }">
                {{ evalResult.risk_percent }}%
              </p>
              <p class="text-xs text-gray-500">Risk Score</p>
            </div>
          </div>

          <!-- Top 3 Indicators -->
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Top Risk Indicators</p>
            <div class="space-y-2">
              <div v-for="ind in topIndicators" :key="ind.name" class="flex items-center gap-3 bg-white/60 rounded-lg p-2.5">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800">{{ ind.display_name }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ ind.reasoning }}</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <div class="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      class="h-1.5 rounded-full"
                      :class="ind.score >= 0.6 ? 'bg-red-500' : ind.score >= 0.3 ? 'bg-yellow-500' : 'bg-green-500'"
                      :style="{ width: `${ind.score * 100}%` }"
                    />
                  </div>
                  <span class="text-xs font-bold tabular-nums w-8 text-right" :class="ind.score >= 0.6 ? 'text-red-600' : ind.score >= 0.3 ? 'text-yellow-600' : 'text-green-600'">
                    {{ (ind.score * 100).toFixed(0) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary + dismiss -->
          <div class="flex items-center justify-between pt-2 border-t border-gray-200/60">
            <p class="text-xs text-gray-600">{{ evalResult.summary }}</p>
            <button
              class="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              @click="dismissResult"
            >
              New Withdrawal
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Withdrawal Methods (Left 2/3) -->
      <div class="lg:col-span-2 space-y-4">
        <h3 class="text-sm font-semibold text-gray-700">Select Withdrawal Method</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            v-for="method in withdrawalMethods"
            :key="method.id"
            class="flex items-center gap-4 p-4 bg-white rounded-xl border-2 transition-all text-left"
            :class="selectedMethod?.id === method.id
              ? 'border-primary-500 bg-primary-50/30 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'"
            @click="selectedMethod = method"
          >
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              :class="selectedMethod?.id === method.id ? 'bg-primary-100' : 'bg-gray-100'"
            >
              <Icon
                :icon="method.icon"
                class="w-6 h-6"
                :class="selectedMethod?.id === method.id ? 'text-primary-600' : 'text-gray-500'"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900">{{ method.name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ method.processingTime }}</p>
              <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span>Fee: {{ method.fee }}</span>
                <span>Min: {{ formatCurrency(method.minAmount) }}</span>
              </div>
            </div>
            <div v-if="selectedMethod?.id === method.id">
              <Icon icon="lucide:check-circle-2" class="w-5 h-5 text-primary-600" />
            </div>
          </button>
        </div>

        <!-- Fraud Evaluation Info -->
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <Icon icon="lucide:shield-alert" class="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p class="text-sm font-medium text-amber-800">AI-Powered Fraud Evaluation</p>
              <p class="text-xs text-amber-700 mt-1 leading-relaxed">
                Every withdrawal request is automatically evaluated by our fraud detection pipeline. The system analyzes
                8 risk indicators in real-time: amount anomaly, transaction velocity, payment method history, geographic
                consistency, device fingerprint, trading behavior, recipient analysis, and card error patterns.
                Requests scoring above the threshold may be escalated for manual review.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Withdrawal Form (Right 1/3) -->
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
          <h3 class="text-base font-semibold text-gray-900">Withdrawal Details</h3>

          <!-- Account Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">From Account</label>
            <select
              v-model="selectedAccount"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.label }}
              </option>
            </select>
            <p v-if="currentAccount" class="mt-1 text-xs text-gray-500">
              Available: <span class="font-medium text-gray-700">{{ formatCurrency(currentAccount.balance) }}</span>
            </p>
          </div>

          <!-- Amount Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Amount (USD)</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                v-model="amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                class="w-full pl-7 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                :class="amountError ? 'border-red-300' : 'border-gray-300'"
              >
            </div>
            <p v-if="amountError" class="mt-1 text-xs text-red-500">{{ amountError }}</p>
          </div>

          <!-- Recipient Details -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Recipient Name</label>
            <input
              v-model="recipientName"
              type="text"
              placeholder="Full legal name"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              {{ selectedMethod?.id === 'crypto' ? 'Wallet Address' : 'Account Number / IBAN' }}
            </label>
            <input
              v-model="recipientAccount"
              type="text"
              :placeholder="selectedMethod?.id === 'crypto' ? '0x... or bc1...' : 'Enter account number'"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
          </div>

          <!-- Fee Summary -->
          <div v-if="selectedMethod && parsedAmount > 0" class="bg-gray-50 rounded-lg p-3 space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500">Processing Time</span>
              <span class="font-medium text-gray-900">{{ selectedMethod.processingTime }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500">Fee</span>
              <span class="font-medium text-gray-900">{{ calculatedFee > 0 ? formatCurrency(calculatedFee) : 'Free' }}</span>
            </div>
            <div class="flex items-center justify-between text-sm border-t border-gray-200 pt-2 mt-2">
              <span class="text-gray-700 font-medium">You will receive</span>
              <span class="text-lg font-bold text-gray-900">{{ formatCurrency(receiveAmount) }}</span>
            </div>
          </div>

          <!-- Submit -->
          <button
            class="w-full py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            <Icon v-if="isSubmitting" icon="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <Icon v-else icon="lucide:arrow-up-circle" class="w-4 h-4" />
            {{ isSubmitting ? 'Evaluating...' : 'Request Withdrawal' }}
          </button>
        </div>

        <!-- Security Note -->
        <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div class="flex items-start gap-2">
            <Icon icon="lucide:lock" class="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p class="text-xs font-medium text-blue-800">Secure Withdrawal</p>
              <p class="text-xs text-blue-600 mt-0.5">Withdrawal requests are subject to identity verification and fraud screening. Processing times may vary.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
