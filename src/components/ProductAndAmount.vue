<template>
  <div class="product-and-amount">
    <b-input-group>
      <div class="input-group-prepend">
        <div class="input-group-text">
          <b-img
            v-bind:src="product.item.id >= 0
              ? require('../assets/icons/' + product.item.icon)
              : require('../assets/icons/Placeholder.png')"
            style="width: 32px !important; height: 32px !important"
          />
        </div>
      </div>
      <div class="input-group-append">
        <div class="input-group-text">
          <span>{{ Math.round((product.amount + Number.EPSILON) * 100) / 100 }}/s</span>
        </div>
      </div>
    </b-input-group>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Mixins from '../common/mixin'

@Component({
  mixins: [Mixins]
})
export default class ProductAndAmount extends Vue {
  @Prop() private readonly product!: typeof Mixins.noneProductAndAmount;
}
</script>
