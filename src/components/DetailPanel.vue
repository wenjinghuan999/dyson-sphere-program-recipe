<template>
  <b-container>
    <b-table striped hover fixed :fields="fields" :items="items">
      <template #cell(requires)="data">
        <b-container class="d-flex flex-wrap justify-content-center">
          <ProductAndAmount v-for="product in data.value" :key="product.item.ID" :product="product" class="mt-2 mb-2 mr-1" />
        </b-container>
      </template>
      <template #cell(products)="data">
        <b-container class="d-flex flex-wrap justify-content-center">
          <ProductAndAmount v-for="product in data.value" :key="product.item.ID" :product="product" class="mt-2 mb-2 mr-1" />
        </b-container>
      </template>
      <template #cell(inputs)="data">
        <b-container class="d-flex flex-wrap justify-content-center">
          <ProductAndAmount v-for="product in data.value" :key="product.item.ID" :product="product" class="mt-2 mb-2 mr-1" />
        </b-container>
      </template>
    </b-table>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Planner } from '@/common/planner'
import Mixins from '@/common/mixin'
import { Product, Recipe } from '@/common/product'
import ProductAndAmount from '@/components/ProductAndAmount.vue'
import { tr } from '@/common/dataloader'

@Component({
  mixins: [Mixins],
  components: {
    ProductAndAmount
  }
})
export default class DetailPanel extends Vue {
  @Prop() planner?: Planner;
  private readonly tr = tr;
  private items: Array<Record<string, string | number | Array<Product>>>;
  private readonly fields = [
    { key: 'recipe', label: tr('Recipe') },
    { key: 'amount', label: tr('Amount') },
    { key: 'requires', label: tr('Requirements'), thStyle: { width: '25%' } },
    { key: 'products', label: tr('Products'), thStyle: { width: '25%' } },
    { key: 'inputs', label: tr('Inputs'), thStyle: { width: '25%' } }
  ]

  constructor () {
    super()
    if (this.planner) {
      this.items = DetailPanel.CreateItems(this.planner)
    } else {
      this.items = []
    }
  }

  @Watch('planner', { deep: true })
  onPlannerChanged () {
    if (this.planner) {
      this.items = DetailPanel.CreateItems(this.planner)
    } else {
      this.items = []
    }
  }

  static CreateItems (planner: Planner): Array<Record<string, string | number | Array<Product>>> {
    const items: Array<Record<string, string | number | Array<Product>>> = []
    planner.nodes.forEach((node) => {
      items.push({
        recipe: node.recipe ? tr(node.recipe.Name) : '',
        amount: node.amount,
        requires: node.requires,
        inputs: node.inputs,
        products: node.products
      })
    })
    return items
  }
}
</script>
