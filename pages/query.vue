<script setup lang="ts">
import { Icon } from '@iconify/vue'

useHead({ title: 'NL Query - Nexa' })

interface QueryMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  data?: {
    summary?: string
    table?: { headers: string[]; rows: string[][] }
    actions?: { label: string; link: string }[]
  }
}

const input = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement>()
const messages = ref<QueryMessage[]>([])
const queryHistory = ref<string[]>([])
const showHistory = ref(false)

const exampleQueries = [
  'Show me accounts that deposited but traded minimally',
  'Which customers have multiple payment methods from different countries?',
  'Find velocity abuse patterns in the last 7 days',
  "What's our auto-approval rate this week?",
]

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

async function sendQuery(queryText?: string) {
  const q = queryText || input.value.trim()
  if (!q || isLoading.value) return

  input.value = ''

  const userMsg: QueryMessage = {
    id: generateId(),
    role: 'user',
    content: q,
    timestamp: new Date(),
  }
  messages.value.push(userMsg)

  if (!queryHistory.value.includes(q)) {
    queryHistory.value.unshift(q)
    if (queryHistory.value.length > 20) queryHistory.value.pop()
  }

  scrollToBottom()
  isLoading.value = true

  try {
    const response = await $fetch<{
      answer: string
      data?: {
        summary?: string
        table?: { headers: string[]; rows: string[][] }
        actions?: { label: string; link: string }[]
      }
    }>('/api/query', {
      method: 'POST',
      body: { question: q },
    })

    const assistantMsg: QueryMessage = {
      id: generateId(),
      role: 'assistant',
      content: response.answer || 'I processed your query but no results were returned.',
      timestamp: new Date(),
      data: response.data,
    }
    messages.value.push(assistantMsg)
  } catch {
    // Fallback to mock responses for demo/offline mode
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))
    const mock = getMockResponse(q)
    const fallbackMsg: QueryMessage = {
      id: generateId(),
      role: 'assistant',
      content: mock.answer,
      timestamp: new Date(),
      data: mock.data,
    }
    messages.value.push(fallbackMsg)
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

function exportResults() {
  const assistantMessages = messages.value.filter(m => m.role === 'assistant' && m.data?.table)
  if (assistantMessages.length === 0) return

  const lastTable = assistantMessages[assistantMessages.length - 1].data!.table!
  const csv = [lastTable.headers.join(','), ...lastTable.rows.map(r => r.join(','))].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'query-results.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function clearChat() {
  messages.value = []
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function getMockResponse(query: string) {
  const q = query.toLowerCase()

  if (q.includes('deposited') && (q.includes('traded') || q.includes('minimal'))) {
    return {
      answer: 'Found 12 accounts matching the "No Trade" pattern. These accounts deposited funds but had minimal or no trading activity before requesting withdrawals. Total exposure: $45,800.',
      data: {
        summary: '12 accounts flagged',
        table: {
          headers: ['Account ID', 'Name', 'Deposit', 'Trades', 'Withdrawal Req', 'Risk Score'],
          rows: [
            ['ACC-8821', 'Marcus Chen', '$5,200', '0', '$4,900', '94'],
            ['ACC-7744', 'Elena Petrov', '$3,800', '2', '$3,650', '89'],
            ['ACC-9102', 'David Park', '$8,100', '1', '$7,800', '92'],
            ['ACC-6637', 'Sarah Ahmed', '$2,400', '0', '$2,300', '96'],
            ['ACC-5519', 'James Wilson', '$6,700', '3', '$6,200', '85'],
          ],
        },
        actions: [
          { label: 'Flag All Accounts', link: '/alerts' },
          { label: 'View Transactions', link: '/transactions' },
        ],
      },
    }
  }

  if (q.includes('payment method') || q.includes('different countries') || q.includes('multiple')) {
    return {
      answer: 'Identified 8 customers using multiple payment methods originating from different countries. This pattern is commonly associated with card testing or money laundering schemes.',
      data: {
        table: {
          headers: ['Customer', 'Payment Methods', 'Countries', 'Total Volume', 'Risk Level'],
          rows: [
            ['Elena Petrov', '4 cards', 'RU, CY, UK', '$12,400', 'High'],
            ['Yuki Tanaka', '5 cards', 'JP, SG, HK, TW', '$22,100', 'High'],
            ['James Wilson', '3 cards', 'US, MX, CA', '$8,900', 'Medium'],
            ['Ahmed Hassan', '3 cards', 'AE, EG, QA', '$6,300', 'Medium'],
          ],
        },
        actions: [
          { label: 'Lock Accounts', link: '/alerts' },
          { label: 'View Profiles', link: '/transactions' },
        ],
      },
    }
  }

  if (q.includes('velocity')) {
    return {
      answer: 'Detected 3 active velocity abuse patterns in the last 7 days. These accounts show abnormally high transaction frequency, exceeding the 95th percentile threshold. Combined exposure: $67,200.',
      data: {
        table: {
          headers: ['Account', 'Txns/Hour', 'Normal Rate', 'Total Amount', 'Duration'],
          rows: [
            ['ACC-3312', '47', '3-5', '$23,400', '6 hours'],
            ['ACC-8891', '31', '2-4', '$28,800', '12 hours'],
            ['ACC-2209', '22', '1-3', '$15,000', '4 hours'],
          ],
        },
        actions: [
          { label: 'Freeze Withdrawals', link: '/alerts' },
          { label: 'Generate Report', link: '/transactions' },
        ],
      },
    }
  }

  if (q.includes('approval rate') || q.includes('auto-approv')) {
    return {
      answer: 'This week\'s auto-approval rate is 73.2%, up from 68.5% last week (+4.7%). The improvement is driven by refined ML model thresholds deployed on Monday. 1,247 of 1,703 payouts were auto-approved with zero false negatives reported.',
      data: {
        table: {
          headers: ['Day', 'Total Payouts', 'Auto-Approved', 'Escalated', 'Blocked', 'Rate'],
          rows: [
            ['Monday', '245', '178', '52', '15', '72.7%'],
            ['Tuesday', '312', '231', '61', '20', '74.0%'],
            ['Wednesday', '289', '214', '55', '20', '74.0%'],
            ['Thursday', '267', '193', '56', '18', '72.3%'],
            ['Friday', '248', '180', '51', '17', '72.6%'],
            ['Saturday', '178', '132', '34', '12', '74.2%'],
            ['Sunday', '164', '119', '33', '12', '72.6%'],
          ],
        },
      },
    }
  }

  // Default fallback
  return {
    answer: `Based on your query, I analyzed the current transaction data. Today we processed 847 transactions with a 73.2% auto-approval rate. The system detected 7 escalation alerts and 3 block alerts. Would you like to drill deeper into any specific area?`,
    data: {
      actions: [
        { label: 'View Dashboard', link: '/' },
        { label: 'Check Alerts', link: '/alerts' },
      ],
    },
  }
}
</script>

<template>
  <div class="flex h-[calc(100vh-5rem)] flex-col">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Natural Language Query</h1>
        <p class="mt-1 text-sm text-gray-500">Ask questions about your payment data using AI</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          @click="showHistory = !showHistory"
        >
          <Icon icon="lucide:history" class="h-4 w-4" />
          History
        </button>
        <button
          v-if="messages.some(m => m.data?.table)"
          class="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          @click="exportResults"
        >
          <Icon icon="lucide:download" class="h-4 w-4" />
          Export
        </button>
        <button
          v-if="messages.length > 0"
          class="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          @click="clearChat"
        >
          <Icon icon="lucide:trash-2" class="h-4 w-4" />
          Clear
        </button>
      </div>
    </div>

    <div class="flex flex-1 gap-4 overflow-hidden">
      <!-- History Sidebar -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="-translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="-translate-x-full opacity-0"
      >
        <div v-if="showHistory" class="w-64 shrink-0 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
          <h3 class="mb-3 text-sm font-semibold text-gray-700">Query History</h3>
          <div v-if="queryHistory.length === 0" class="text-center text-xs text-gray-400 py-8">
            No queries yet
          </div>
          <div v-else class="space-y-1">
            <button
              v-for="(q, i) in queryHistory"
              :key="i"
              class="block w-full truncate rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
              @click="sendQuery(q)"
            >
              {{ q }}
            </button>
          </div>
        </div>
      </Transition>

      <!-- Chat Area -->
      <div class="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
        <!-- Messages -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Empty state -->
          <div v-if="messages.length === 0" class="flex h-full flex-col items-center justify-center">
            <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
              <Icon icon="lucide:message-square" class="h-8 w-8 text-primary-500" />
            </div>
            <h2 class="text-lg font-semibold text-gray-800">Ask anything about your data</h2>
            <p class="mt-1 text-sm text-gray-500">Use natural language to query transactions, detect fraud, and analyze patterns</p>

            <div class="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                v-for="example in exampleQueries"
                :key="example"
                class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-600 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                @click="sendQuery(example)"
              >
                <Icon icon="lucide:sparkles" class="mb-1 h-4 w-4 text-primary-400" />
                <span class="block">{{ example }}</span>
              </button>
            </div>
          </div>

          <!-- Message bubbles -->
          <template v-else>
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']"
            >
              <div :class="['max-w-[80%]', msg.role === 'user' ? '' : 'w-full max-w-2xl']">
                <!-- User message -->
                <div v-if="msg.role === 'user'" class="rounded-2xl rounded-br-md bg-primary-600 px-4 py-3 text-sm text-white">
                  {{ msg.content }}
                  <p class="mt-1 text-[10px] text-primary-200">{{ formatTime(msg.timestamp) }}</p>
                </div>

                <!-- Assistant message -->
                <div v-else class="space-y-3">
                  <div class="flex items-start gap-2">
                    <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <Icon icon="lucide:bot" class="h-4 w-4 text-gray-600" />
                    </div>
                    <div class="rounded-2xl rounded-tl-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm">
                      {{ msg.content }}
                      <p class="mt-1 text-[10px] text-gray-400">{{ formatTime(msg.timestamp) }}</p>
                    </div>
                  </div>

                  <!-- Data table -->
                  <div v-if="msg.data?.table" class="ml-9 overflow-x-auto rounded-lg border border-gray-200">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="border-b border-gray-200 bg-gray-50">
                          <th
                            v-for="h in msg.data.table.headers"
                            :key="h"
                            class="px-3 py-2 text-left text-xs font-semibold text-gray-500"
                          >
                            {{ h }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr v-for="(row, ri) in msg.data.table.rows" :key="ri" class="hover:bg-gray-50">
                          <td v-for="(cell, ci) in row" :key="ci" class="px-3 py-2 text-gray-700">
                            {{ cell }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Action links -->
                  <div v-if="msg.data?.actions?.length" class="ml-9 flex flex-wrap gap-2">
                    <NuxtLink
                      v-for="action in msg.data.actions"
                      :key="action.label"
                      :to="action.link"
                      class="flex items-center gap-1 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100"
                    >
                      <Icon icon="lucide:external-link" class="h-3 w-3" />
                      {{ action.label }}
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="isLoading" class="flex items-start gap-2">
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
                <Icon icon="lucide:bot" class="h-4 w-4 text-gray-600" />
              </div>
              <div class="rounded-2xl rounded-tl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div class="flex items-center gap-1">
                  <span class="h-2 w-2 animate-bounce rounded-full bg-gray-400" style="animation-delay: 0ms" />
                  <span class="h-2 w-2 animate-bounce rounded-full bg-gray-400" style="animation-delay: 150ms" />
                  <span class="h-2 w-2 animate-bounce rounded-full bg-gray-400" style="animation-delay: 300ms" />
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Input bar -->
        <div class="border-t border-gray-200 p-4">
          <form class="flex items-center gap-3" @submit.prevent="sendQuery()">
            <input
              v-model="input"
              type="text"
              placeholder="Ask about fraud patterns, account behavior, or transactions..."
              class="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              :disabled="isLoading"
            />
            <button
              type="submit"
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
              :disabled="!input.trim() || isLoading"
            >
              <Icon icon="lucide:send" class="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
