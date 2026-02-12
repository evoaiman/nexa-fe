<script setup lang="ts">
import type { CandidateResult } from '~/utils/auditTypes'

interface Props {
  candidate: CandidateResult
}

const props = defineProps<Props>()

const confidenceColor = computed(() => {
  if (props.candidate.confidence >= 0.7) return 'bg-green-500'
  if (props.candidate.confidence >= 0.4) return 'bg-yellow-500'
  return 'bg-red-500'
})

const qualityColor = computed(() => {
  if (props.candidate.quality_score >= 0.7) return 'bg-green-500'
  if (props.candidate.quality_score >= 0.4) return 'bg-yellow-500'
  return 'bg-red-500'
})

const riskDotColor = computed(() => {
  if (props.candidate.confidence >= 0.7) return 'bg-red-500'
  if (props.candidate.confidence >= 0.4) return 'bg-yellow-500'
  return 'bg-green-500'
})

const noveltyBadge = computed(() => {
  const status = props.candidate.novelty_status?.toLowerCase()
  if (status === 'new') return { text: 'New pattern', class: 'bg-green-100 text-green-700' }
  if (status === 'known') return { text: 'Known pattern', class: 'bg-gray-100 text-gray-700' }
  return { text: props.candidate.novelty_status, class: 'bg-yellow-100 text-yellow-700' }
})

const adminBrief = computed(() => (props.candidate.pattern_card.plain_language ?? '').trim())

const confidencePercent = computed(() => Math.round(props.candidate.confidence * 100))
const qualityPercent = computed(() => Math.round(props.candidate.quality_score * 100))
const supportAccounts = computed(() => props.candidate.support_accounts ?? props.candidate.pattern_card.support_accounts ?? 0)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <div class="h-3 w-3 rounded-full" :class="riskDotColor" />
      <h3 class="text-lg font-semibold text-gray-900">
        {{ candidate.pattern_card.formal_pattern_name ?? 'Untitled Pattern' }}
      </h3>
    </div>

    <div class="space-y-3">
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-gray-700">Confidence</span>
          <span class="text-sm font-medium text-gray-900">{{ confidencePercent }}%</span>
        </div>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full transition-all" :class="confidenceColor" :style="{ width: `${confidencePercent}%` }" />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-gray-700">Quality</span>
          <span class="text-sm font-medium text-gray-900">{{ qualityPercent }}%</span>
        </div>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full transition-all" :class="qualityColor" :style="{ width: `${qualityPercent}%` }" />
        </div>
      </div>
    </div>

    <div v-if="adminBrief" class="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Admin Brief</p>
      <p class="mt-1 text-sm leading-relaxed text-gray-700">{{ adminBrief }}</p>
    </div>

    <div class="flex flex-wrap gap-3 pt-2">
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-medium px-2 py-1 rounded-full" :class="noveltyBadge.class">
          {{ noveltyBadge.text }}
        </span>
      </div>

      <div class="text-sm text-gray-600">
        <span class="font-medium">Evidence:</span>
        {{ candidate.support_events }} events, {{ supportAccounts }} accounts
      </div>

      <div v-if="candidate.pattern_card.source_types?.length" class="text-sm text-gray-600">
        <span class="font-medium">Sources:</span>
        {{ candidate.pattern_card.source_types.join(', ') }}
      </div>
    </div>
  </div>
</template>
