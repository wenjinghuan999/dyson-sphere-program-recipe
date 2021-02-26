<template>
  <div class="product-and-amount">
    <b-input-group>
      <div class="input-group-prepend">
        <div class="input-group-text">
          <b-img
            v-bind:src="require('../assets/' + product.icon + '.png')"
            style="width: 32px !important; height: 32px !important"
          />
        </div>
      </div>
      <div class="input-group-append">
        <div class="input-group-text">
          <span>{{ amount }}/{{ unit }}</span>
        </div>
      </div>
    </b-input-group>
  </div>
</template>

<script lang="ts">
import { Product } from '@/common/product'
import { Component, Prop, Vue } from 'vue-property-decorator'
import Mixins from '@/common/mixin'

@Component({
  mixins: [Mixins]
})
export default class ProductAndAmount extends Vue {
  @Prop() private readonly product!: Product;
  @Prop() private readonly unit!: string;

  get amount (): number {
    let amount = this.product.amount
    if (this.unit === 'min') {
      amount *= 60
    }
    return Math.round((amount + Number.EPSILON) * 100) / 100
  }
}
</script>
