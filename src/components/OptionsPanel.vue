<template>
  <b-container class="d-flex flex-wrap justify-content-center border" fluid>
    <div class="mt-2 mb-2 mr-1">
      <b-input-group>
        <div class="input-group-prepend">
          <div class="input-group-text">
            <span>{{ tr('Unit') }}</span>
          </div>
        </div>
        <b-form-select class="form-control" v-model="options.unit" :options="unitOptions" style="max-width: 4.5rem"></b-form-select>
      </b-input-group>
    </div>
    <div class="mt-2 mb-2 mr-1">
      <b-input-group>
        <div class="input-group-prepend">
          <div class="input-group-text">
            <span>{{ tr('Graph view mode') }}</span>
          </div>
        </div>
        <b-form-select class="form-control" v-model="options.graphViewMode" :options="trs(graphViewModeOptions)"></b-form-select>
      </b-input-group>
    </div>
  </b-container>
</template>

<script lang="ts">
import { Options } from '@/common/options'
import { Component, VModel, Vue, Watch } from 'vue-property-decorator'
import { tr } from '@/common/dataloader'
import Mixins from '@/common/mixin'

@Component({
  mixins: [Mixins]
})
export default class OptionsPanel extends Vue {
  @VModel() options!: Options;
  private tr = tr;

  trs (arr: string[]) {
    return arr.map(s => { return { value: s, text: tr(s) } })
  }
}
</script>
