<template>
  <b-container>
    <b-table striped hover fixed :fields="fields" :items="items">
      <template #cell(recipe)="data">
        <b-container class="d-flex flex-wrap justify-content-center">
          <p>{{ tr(data.value.Name) }}</p>
          <building-and-recipe :recipe="data.value" class="mt-2 mb-2 mr-1" />
        </b-container>
      </template>
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
      <template #cell(provides)="data">
        <b-container class="d-flex flex-wrap justify-content-center">
          <ProductAndAmount v-for="product in data.value" :key="product.item.ID" :product="product" class="mt-2 mb-2 mr-1" />
        </b-container>
      </template>
      <template #cell(byProducts)="data">
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
import BuildingAndRecipe from '@/components/BuildingAndRecipe.vue'
import { tr } from '@/common/dataloader'

@Component({
  mixins: [Mixins],
  components: {
    ProductAndAmount,
    BuildingAndRecipe
  }
})
export default class DetailPanel extends Vue {
  @Prop() planner?: Planner;
  private readonly tr = tr;
  private items: Record<string, string | number | Recipe | Product[]>[];
  private readonly fields = [
    { key: 'recipe', label: tr('Recipe'), thStyle: { width: '19%' } },
    { key: 'amount', label: tr('Amount'), thStyle: { width: '5%' } },
    { key: 'requires', label: tr('Requirements'), thStyle: { width: '19%' } },
    { key: 'products', label: tr('Products'), thStyle: { width: '19%' } },
    { key: 'provides', label: tr('Raw inputs'), thStyle: { width: '19%' } },
    { key: 'byProducts', label: tr('By-products'), thStyle: { width: '19%' } }
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

  static CreateItems (planner: Planner): Array<Record<string, string | number | Recipe | Product[]>> {
    const items: Record<string, string | number | Recipe | Product[]>[] = []
    planner.nodes.forEach((node) => {
      items.push({
        recipe: node.recipe ? node.recipe : Recipe.Empty,
        amount: node.amount,
        requires: node.requires,
        products: node.products,
        provides: node.provides,
        byProducts: node.byProducts
      })
    })
    return items
  }
}
</script>
