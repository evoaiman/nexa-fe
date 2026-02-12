<script setup lang="ts">
interface Phase {
  name: string
  label: string
  status: 'pending' | 'active' | 'completed'
  detail: string | null
  startedAt: string | null
  duration: number | null
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

interface ToolCall {
  tool: string
  friendlyLabel: string
  timestamp: string
}

interface Props {
  phases: Phase[]
  clusters: ClusterStep[]
  selectedClusterId: string | null
}

interface Emits {
  (e: 'select-cluster', clusterId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const investigatePhaseIndex = computed(() =>
  props.phases.findIndex(p => p.name === 'investigate')
)
</script>

<template>
  <div class="relative space-y-1">
    <div
      v-for="(phase, index) in phases"
      :key="phase.name"
    >
      <AuditPhaseNode :phase="phase" />

      <template v-if="index === investigatePhaseIndex && clusters.length > 0">
        <div class="relative ml-8 border-l-2 border-gray-200 pl-3">
          <AuditStepNode
            v-for="cluster in clusters"
            :key="cluster.clusterId"
            :cluster="cluster"
            :is-selected="selectedClusterId === cluster.clusterId"
            @click="emit('select-cluster', cluster.clusterId)"
          />
        </div>
      </template>
    </div>
  </div>
</template>
