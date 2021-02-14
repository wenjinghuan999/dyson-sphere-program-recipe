<template>
  <div>
    <b-tabs
      content-class="mt-3"
      v-on:activate-tab="onActivateTab"
    >
      <b-tab
        :title="tr('Graph')"
        :active="activePanel !== 'details' && activePanel !== 'summary'"
      >
        <p>I'm the first tab</p>
      </b-tab>
      <b-tab
        :title="tr('Details')"
        :active="activePanel === 'details'"
      >
        <DetailPanel :planner="planner"/>
      </b-tab>
      <b-tab
        :title="tr('Summary')"
        :active="activePanel === 'summary'"
      >
        <p>I'm a disabled tab!</p>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { BvEvent } from 'bootstrap-vue'
import { tr } from '@/common/dataloader'
import { Product } from '@/common/product'
import { Planner } from '@/common/planner'
import DetailPanel from '@/components/DetailPanel.vue'

@Component({
  components: {
    DetailPanel
  }
})
export default class PipelinePanel extends Vue {
  @Prop() planner?: Planner;
  @Prop() targets?: Product[];
  @Prop() activePanel?: string;
  private readonly tr = tr;

  private onActivateTab (newTabIndex: number, prevTabIndex: number, e: BvEvent) {
    const newActivePanel = newTabIndex === 0 ? 'graph' : newTabIndex === 1 ? 'details' : 'summary'
    // this.$router.replace({ path: newActivePanel })
  }
}
</script>
