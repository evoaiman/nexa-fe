<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface ToolCall {
  tool: string
  friendlyLabel: string
  timestamp: string
}

interface ClusterStep {
  clusterId: string
  label: string
  status: 'pending' | 'active' | 'completed'
  eventCount: number
  accountCount: number
  sourceType: string
  toolCalls: ToolCall[]
  patternName: string | null
}

interface Props {
  cluster: ClusterStep
  isSelected: boolean
}

interface Emits {
  (e: 'click'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const statusIcon = computed(() => {
  switch (props.cluster.status) {
    case 'pending':
      return { icon: 'lucide:circle', class: 'text-gray-400' }
    case 'active':
      return { icon: 'lucide:loader', class: 'text-primary-500 animate-spin' }
    case 'completed':
      return { icon: 'lucide:check-circle', class: 'text-green-500' }
    default:
      return { icon: 'lucide:circle', class: 'text-gray-400' }
  }
})

const clusterIcon = computed(() => {
  const sourceType = props.cluster.sourceType
  switch (sourceType) {
    case 'constellation_analysis':
      return { icon: 'lucide:orbit', label: 'Multi-signal analysis' }
    case 'identity_access':
      return { icon: 'lucide:fingerprint', label: 'Identity & access' }
    case 'financial_behavior':
      return { icon: 'lucide:trending-up', label: 'Financial behavior' }
    case 'cross_account':
      return { icon: 'lucide:users', label: 'Cross-account links' }
    default:
      return { icon: 'lucide:search', label: props.cluster.label }
  }
})

function getToolIcon(toolName: string): string {
  const lower = toolName.toLowerCase()
  if (lower.includes('sql') || lower.includes('db')) return 'lucide:database'
  if (lower.includes('web') || lower.includes('search')) return 'lucide:globe'
  if (lower.includes('cluster') || lower.includes('kmeans')) return 'lucide:git-branch'
  return 'lucide:file-text'
}

const containerClass = computed(() => {
  const base = 'cursor-pointer rounded-lg p-3 transition-all hover:bg-gray-50'
  if (props.isSelected) {
    return `${base} border-l-2 border-primary-500 bg-primary-50/50`
  }
  if (props.cluster.status === 'active') {
    return `${base} border-l-2 border-primary-300 animate-pulse`
  }
  return `${base} border-l-2 border-transparent`
})
</script>

<template>
  <div
    :class="containerClass"
    @click="emit('click')"
  >
    <div class="flex items-start gap-3">
      <Icon
        :icon="statusIcon.icon"
        :class="statusIcon.class"
        class="h-4 w-4 flex-shrink-0"
      />

      <div class="flex-1 space-y-2">
        <div class="flex items-center gap-2">
          <Icon
            :icon="clusterIcon.icon"
            class="h-4 w-4 text-gray-600"
          />
          <span class="text-sm font-medium text-gray-900">
            {{ clusterIcon.label }}
          </span>
        </div>

        <div class="text-xs text-gray-400">
          {{ cluster.eventCount }} events, {{ cluster.accountCount }} accounts
        </div>

        <div
          v-if="cluster.status === 'active' && cluster.toolCalls.length > 0"
          class="space-y-1"
        >
          <div
            v-for="(call, idx) in cluster.toolCalls"
            :key="idx"
            class="flex items-center gap-2 text-xs text-gray-500"
          >
            <Icon
              :icon="getToolIcon(call.tool)"
              class="h-3 w-3"
            />
            <span>{{ call.friendlyLabel }}</span>
          </div>
        </div>

        <div
          v-if="cluster.status === 'completed' && cluster.patternName"
          class="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700"
        >
          {{ cluster.patternName }}
        </div>
      </div>
    </div>
  </div>
</template>
