<template>
  <div class="options-panel">
    <b-input-group>
      <div class="input-group-prepend">
        <div class="input-group-text">
          <span>Unit</span>
        </div>
      </div>
      <b-form-select class="form-control" v-model="options.unit" :options="unitOptions" style="max-width: 4.5rem"></b-form-select>
    </b-input-group>
  </div>
</template>

<script lang="ts">
import { Options } from '@/common/options'
import { Component, Prop, VModel, Vue, Watch } from 'vue-property-decorator'
import Mixins from '@/common/mixin'

@Component({
  mixins: [Mixins]
})
export default class OptionsPanel extends Vue {
  @VModel() options!: Options;
}
</script>
