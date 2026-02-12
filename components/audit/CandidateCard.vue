<script setup lang="ts">
interface CandidateResult {
  candidate_id: string
  title: string | null
  status: string
  quality_score: number
  confidence: number
  support_events: number
  novelty_status: string
  pattern_card: {
    formal_pattern_name?: string
    plain_language?: string
    source_types?: string[]
    support_accounts?: number
  }
}

interface Props {
  candidate: CandidateResult
  isSelected: boolean
}

interface Emits {
  (e: 'click'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const riskDotColor = computed(() => {
  if (props.candidate.confidence >= 0.7) return 'bg-red-500'
  if (props.candidate.confidence >= 0.4) return 'bg-yellow-500'
  return 'bg-green-500'
})

const noveltyBadgeClass = computed(() => {
  switch (props.candidate.novelty_status) {
    case 'new':
      return 'bg-green-100 text-green-700'
    case 'known':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-yellow-100 text-yellow-700'
  }
})

const patternName = computed(() => {
  return props.candidate.pattern_card.formal_pattern_name || props.candidate.title || 'Unnamed Pattern'
})

const sourcesText = computed(() => {
  const sources = props.candidate.pattern_card.source_types || []
  if (sources.length === 0) return 'No sources'
  const joined = sources.join(', ')
  return joined.length > 30 ? joined.substring(0, 30) + '...' : joined
})

const qualityPercent = computed(() => Math.round(props.candidate.quality_score * 100))
const confidencePercent = computed(() => Math.round(props.candidate.confidence * 100))
const supportAccounts = computed(() => props.candidate.pattern_card.support_accounts || 0)
</script>

<template>
  <div
    @click="emit('click')"
    class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-gray-300"
    :class="{ 'ring-2 ring-primary-500 border-primary-300': isSelected }"
  >
    <div class="flex items-start justify-between gap-2">
      <h3 class="text-sm font-semibold text-gray-900 flex-1">
        {{ patternName }}
      </h3>
      <div :class="riskDotColor" class="mt-1 h-2 w-2 rounded-full flex-shrink-0" />
    </div>

    <div class="mt-3 space-y-1.5">
      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-600">Quality:</span>
        <span class="font-medium text-gray-900">{{ qualityPercent }}%</span>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-600">Confidence:</span>
        <span class="font-medium text-gray-900">{{ confidencePercent }}%</span>
      </div>
    </div>

    <div class="mt-2 flex items-center gap-2 text-xs text-gray-600">
      <span>{{ candidate.support_events }} events</span>
      <span>·</span>
      <span>{{ supportAccounts }} accts</span>
    </div>

    <div class="mt-2">
      <span
        :class="noveltyBadgeClass"
        class="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
      >
        {{ candidate.novelty_status }} pattern
      </span>
    </div>

    <div class="mt-2 text-xs text-gray-500 truncate">
      {{ sourcesText }}
    </div>
  </div>
</template>
