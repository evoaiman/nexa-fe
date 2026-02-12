<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface IndicatorRow {
  name: string
  baseline_weight: number
  customer_multiplier: number
  customer_weight: number
  difference: number
  status: string
  reason: string
}

interface WeightSnapshot {
  customer_id: string
  personalization_status: string
  last_updated: string | null
  sample_count: number
  blend: {
    baseline: { rule_engine: number; investigators: number }
    customer: { rule_engine: number; investigators: number }
  }
  indicators: IndicatorRow[]
}

const props = defineProps<{
  visible: boolean
  customerId: string
  riskScore: number
  decision: string
}>()

const emit = defineEmits<{ close: [] }>()

const snapshot = ref<WeightSnapshot | null>(null)
const loading = ref(false)
const error = ref('')
const resetting = ref(false)

const INDICATOR_LABELS: Record<string, string> = {
  trading_behavior: 'Trading Behavior',
  device_fingerprint: 'Device Fingerprint',
  geographic: 'Geographic Signals',
  amount_anomaly: 'Amount Anomaly',
  velocity: 'Transaction Velocity',
  payment_method: 'Payment Method',
  recipient: 'Recipient Analysis',
  card_errors: 'Card Error History',
}

const statusBadge: Record<string, { bg: string; text: string }> = {
  stable: { bg: 'bg-green-100', text: 'text-green-700' },
  'limited data': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'baseline fallback': { bg: 'bg-gray-100', text: 'text-gray-600' },
}

watch(() => props.visible, async (open) => {
  if (open && props.customerId) await fetchSnapshot()
})

async function fetchSnapshot() {
  loading.value = true
  error.value = ''
  try {
    snapshot.value = await $fetch<WeightSnapshot>(
      `/api/customers/${props.customerId}/weights`,
    )
  }
  catch {
    error.value = 'Could not load scoring factors. Showing baseline only.'
  }
  finally {
    loading.value = false
  }
}

async function resetToBaseline() {
  if (!confirm('Reset this customer to baseline weights?')) return
  resetting.value = true
  try {
    await $fetch(`/api/customers/${props.customerId}/weights/reset`, {
      method: 'POST',
      body: { reason: 'Manual reset by officer', updated_by: 'officer-demo-001' },
    })
    await fetchSnapshot()
  }
  catch {
    error.value = 'Reset failed.'
  }
  finally {
    resetting.value = false
  }
}

function formatDiff(diff: number): string {
  const sign = diff > 0 ? '+' : ''
  return `${sign}${diff.toFixed(3)}`
}

function diffColor(diff: number): string {
  if (diff > 0.01) return 'text-red-600'
  if (diff < -0.01) return 'text-green-600'
  return 'text-gray-500'
}

const thresholdExplanation = computed(() => {
  const s = props.riskScore
  if (s < 0.3) return `This case is approved because personalized score ${s.toFixed(2)} is below approve threshold 0.30.`
  if (s < 0.7) return `This case is escalated because personalized score ${s.toFixed(2)} is above approve threshold 0.30 and below block threshold 0.70.`
  return `This case is blocked because personalized score ${s.toFixed(2)} is at or above block threshold 0.70.`
})

const isPersonalized = computed(() =>
  snapshot.value?.personalization_status === 'applied'
  || snapshot.value?.personalization_status === 'limited data',
)

function handleClose() {
  emit('close')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') handleClose()
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div v-if="visible" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0" @click="handleClose" />

        <div class="relative w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-gray-200 shrink-0">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Scoring Factors</h3>
              <p class="text-xs text-gray-500 mt-0.5">{{ customerId }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span
                v-if="snapshot"
                class="px-2.5 py-1 text-xs font-medium rounded-full"
                :class="[
                  statusBadge[snapshot.personalization_status]?.bg ?? 'bg-gray-100',
                  statusBadge[snapshot.personalization_status]?.text ?? 'text-gray-600',
                ]"
              >
                {{ snapshot.personalization_status }}
              </span>
              <button class="p-1.5 hover:bg-gray-100 rounded-lg" @click="handleClose">
                <Icon icon="lucide:x" class="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-5 space-y-5">
            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-12">
              <div class="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span class="ml-3 text-sm text-gray-500">Loading scoring factors...</span>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-sm text-yellow-700">{{ error }}</p>
            </div>

            <template v-else-if="snapshot">
              <!-- Section A: Quick Comparator -->
              <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Icon icon="lucide:scale" class="w-4 h-4" />
                  Quick Comparison
                </h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="bg-white rounded-md p-3 border border-gray-200">
                    <p class="text-xs text-gray-500 mb-1">Baseline blend</p>
                    <p class="font-medium">Rules {{ (snapshot.blend.baseline.rule_engine * 100).toFixed(0) }}% / Inv {{ (snapshot.blend.baseline.investigators * 100).toFixed(0) }}%</p>
                  </div>
                  <div class="bg-white rounded-md p-3 border border-gray-200">
                    <p class="text-xs text-gray-500 mb-1">Customer blend</p>
                    <p class="font-medium">Rules {{ (snapshot.blend.customer.rule_engine * 100).toFixed(0) }}% / Inv {{ (snapshot.blend.customer.investigators * 100).toFixed(0) }}%</p>
                  </div>
                </div>
              </div>

              <!-- Section B: Indicator Table -->
              <div>
                <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Icon icon="lucide:bar-chart-3" class="w-4 h-4" />
                  Indicator Weights
                </h4>
                <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="bg-gray-50 border-b border-gray-200">
                        <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Indicator</th>
                        <th class="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Baseline</th>
                        <th class="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                        <th class="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Diff</th>
                        <th class="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr v-for="row in snapshot.indicators" :key="row.name" class="hover:bg-gray-50/50">
                        <td class="px-3 py-2.5">
                          <span class="font-medium text-gray-800">{{ INDICATOR_LABELS[row.name] || row.name }}</span>
                          <p v-if="row.reason" class="text-xs text-gray-400 mt-0.5">{{ row.reason }}</p>
                        </td>
                        <td class="px-3 py-2.5 text-right tabular-nums text-gray-600">{{ row.baseline_weight.toFixed(3) }}</td>
                        <td class="px-3 py-2.5 text-right tabular-nums font-medium text-gray-900">{{ row.customer_weight.toFixed(3) }}</td>
                        <td class="px-3 py-2.5 text-right tabular-nums font-bold" :class="diffColor(row.difference)">
                          {{ formatDiff(row.difference) }}
                        </td>
                        <td class="px-3 py-2.5 text-center">
                          <span
                            class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full"
                            :class="[statusBadge[row.status]?.bg ?? 'bg-gray-100', statusBadge[row.status]?.text ?? 'text-gray-600']"
                          >
                            {{ row.status }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Section C: Threshold Explanation -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Icon icon="lucide:info" class="w-4 h-4" />
                  Threshold Decision
                </h4>
                <p class="text-sm text-blue-900">{{ thresholdExplanation }}</p>
              </div>

              <!-- Section D: Freshness -->
              <div class="text-xs text-gray-500 space-y-1">
                <p v-if="snapshot.last_updated">Last updated: {{ new Date(snapshot.last_updated).toLocaleString() }}</p>
                <p>Sample count: {{ snapshot.sample_count }}</p>
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-gray-200 shrink-0 flex items-center justify-between bg-white">
            <button
              v-if="isPersonalized"
              class="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              :disabled="resetting"
              @click="resetToBaseline"
            >
              <Icon icon="lucide:rotate-ccw" class="w-4 h-4 inline mr-1" />
              Reset to baseline
            </button>
            <span v-else />
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              @click="handleClose"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
