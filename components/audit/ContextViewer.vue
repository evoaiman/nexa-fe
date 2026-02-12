<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { CandidateResult, ClusterStep } from '~/utils/auditTypes'

interface Props {
  selectedCluster: ClusterStep | null
  selectedCandidate: CandidateResult | null
  status: string
}

const props = defineProps<Props>()

type TabName = 'summary' | 'evidence' | 'sql' | 'web' | 'notes'

const activeTab = ref<TabName>('summary')

type GenericRecord = Record<string, unknown>

const evidenceItems = computed(() => {
  const candidate = props.selectedCandidate
  if (!candidate) return []

  const card = (candidate.pattern_card || {}) as GenericRecord
  const raw = [
    ...(Array.isArray(card.evidence_units) ? card.evidence_units : []),
    ...(Array.isArray(card.ranked_evidence) ? card.ranked_evidence : []),
  ]

  const normalized = raw
    .filter((item): item is GenericRecord => !!item && typeof item === 'object')
    .map((item) => {
      const rank = Number(item.rank)
      const fallbackConfidence = Number.isFinite(rank)
        ? Math.max(0.2, 1 - (Math.max(rank, 1) - 1) * 0.15)
        : 0.5

      return {
        source: String(item.source ?? item.type ?? item.evidence_type ?? 'evidence'),
        text: String(item.text ?? item.snippet ?? item.summary ?? item.result ?? item.query ?? '').trim(),
        confidence: Number(item.confidence ?? fallbackConfidence),
        withdrawal_id: String(item.withdrawal_id ?? item.unit_id ?? ''),
      }
    })
    .filter(item => item.text.length > 0)

  const seen = new Set<string>()
  return normalized.filter((item) => {
    const key = `${item.source}|${item.text}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
})

const tabs = computed(() => {
  const candidate = props.selectedCandidate
  if (!candidate) return [{ name: 'summary' as TabName, label: 'Summary', icon: 'lucide:file-text', show: true }]

  return [
    { name: 'summary' as TabName, label: 'Summary', icon: 'lucide:file-text', show: true },
    {
      name: 'evidence' as TabName,
      label: 'Evidence',
      icon: 'lucide:list',
      show: evidenceItems.value.length > 0,
    },
    {
      name: 'sql' as TabName,
      label: 'SQL Findings',
      icon: 'lucide:database',
      show: (candidate.pattern_card.sql_findings?.length ?? 0) > 0
    },
    {
      name: 'web' as TabName,
      label: 'Web Proof',
      icon: 'lucide:globe',
      show: (candidate.pattern_card.web_references?.length ?? 0) > 0
    },
    {
      name: 'notes' as TabName,
      label: 'Agent Notes',
      icon: 'lucide:brain',
      show: !!candidate.pattern_card.analyst_notes
    }
  ].filter((tab) => tab.show)
})

watch(
  () => props.selectedCandidate,
  () => {
    activeTab.value = 'summary'
  }
)
</script>

<template>
  <div class="h-full flex flex-col">
    <div v-if="selectedCandidate" class="flex-1 flex flex-col">
      <div class="border-b border-gray-200 px-5 pt-4">
        <div class="flex gap-4">
          <button
            v-for="tab in tabs"
            :key="tab.name"
            type="button"
            class="flex items-center gap-1.5 pb-3 px-2 text-sm font-medium transition-colors"
            :class="
              activeTab === tab.name
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            "
            @click="activeTab = tab.name"
          >
            <Icon :icon="tab.icon" class="h-4 w-4" />
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-5">
        <AuditPatternCard v-if="activeTab === 'summary'" :candidate="selectedCandidate" />
        <AuditEvidenceExplorer
          v-else-if="activeTab === 'evidence'"
          :evidence="evidenceItems"
        />
        <AuditSqlFindings v-else-if="activeTab === 'sql'" :findings="selectedCandidate.pattern_card.sql_findings ?? []" />
        <AuditWebReferences
          v-else-if="activeTab === 'web'"
          :references="selectedCandidate.pattern_card.web_references ?? []"
        />
        <AuditAgentReasoning v-else-if="activeTab === 'notes'" :candidate="selectedCandidate" />
      </div>
    </div>

    <div v-else-if="status === 'streaming' && selectedCluster" class="flex-1 flex flex-col p-5">
      <div class="flex items-center gap-2 mb-4">
        <Icon icon="lucide:brain" class="h-5 w-5 text-primary-500 animate-pulse" />
        <h3 class="text-sm font-semibold text-gray-700">The agent is investigating...</h3>
      </div>
      <div class="space-y-2">
        <div
          v-for="(call, idx) in selectedCluster.toolCalls"
          :key="idx"
          class="flex items-center gap-2 text-sm text-gray-600"
        >
          <Icon
            :icon="call.tool.includes('web') || call.tool.includes('tavily') ? 'lucide:globe' : 'lucide:database'"
            class="h-4 w-4 text-gray-400"
          />
          <span>{{ call.friendlyLabel }}</span>
          <span class="text-xs text-gray-400">{{ call.timestamp }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="selectedCluster && status === 'completed'" class="flex-1 flex items-center justify-center p-8 text-center">
      <div>
        <Icon icon="lucide:info" class="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <p class="text-sm text-gray-500">This cluster was filtered out or did not produce a candidate pattern</p>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center p-8 text-center">
      <div>
        <Icon icon="lucide:circle-dashed" class="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <p class="text-sm text-gray-500">Select a cluster from the timeline to see details</p>
      </div>
    </div>
  </div>
</template>
