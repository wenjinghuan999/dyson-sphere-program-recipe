<template>
  <b-container>
    <div v-if="items.length">
      <div class="d-flex justify-content-center">
        <div class="w-50 p-2 mb-2 border border-primary align-middle">
          <h5 class="m-0 text-primary">{{ tr('Production line') }}</h5>
        </div>
      </div>
      <b-table striped hover fixed :fields="fields" :items="items">
        <template #cell(recipe)="data">
          <div class="text-center">
            <span>{{ tr(data.value.Name) }}</span>
            <b-container class="d-flex flex-wrap justify-content-center">
              <BuildingAndRecipe :recipe="data.value" class="mt-2 mb-2 mr-1" />
            </b-container>
          </div>
        </template>
        <template #cell(energy)="data">
          <p>{{ getEnergyText(data.value) }}</p>
        </template>
        <template #cell(requires)="data">
          <b-container class="d-flex flex-wrap justify-content-center">
            <ProductAndAmount v-for="product in data.value" :unit="options.unit" :key="product.item.ID" :product="product" class="mt-2 mb-2 mr-1" />
          </b-container>
        </template>
        <template #cell(products)="data">
          <b-container class="d-flex flex-wrap justify-content-center">
            <ProductAndAmount v-for="product in data.value" :unit="options.unit" :key="product.item.ID" :product="product" class="mt-2 mb-2 mr-1" />
          </b-container>
        </template>
        <template #cell(provides)="data">
          <b-container class="d-flex flex-wrap justify-content-center">
            <ProductAndAmount v-for="product in data.value" :unit="options.unit" :key="product.item.ID" :product="product" class="mt-2 mb-2 mr-1" />
          </b-container>
        </template>
        <template #cell(byProducts)="data">
          <b-container class="d-flex flex-wrap justify-content-center">
            <ProductAndAmount v-for="product in data.value" :unit="options.unit" :key="product.item.ID" :product="product" class="mt-2 mb-2 mr-1" />
          </b-container>
        </template>
      </b-table>
    </div>
    <div v-if="miningItems.length">
      <div class="d-flex justify-content-center">
        <div class="w-50 p-2 mb-2 border border-primary align-middle">
          <h5 class="m-0 text-primary">{{ tr('Mining') }}</h5>
        </div>
      </div>
      <b-table striped hover fixed :fields="miningFields" :items="miningItems">
        <template #cell(recipe)="data">
          <b-container class="d-flex flex-wrap justify-content-center">
            <BuildingAndMining :recipe="data.value" class="mt-2 mb-2 mr-1" />
          </b-container>
        </template>
        <template #cell(amount)="data">
          <p>{{ data.value >= 0 ? data.value : '-'}}</p>
        </template>
        <template #cell(energy)="data">
          <p>{{ getEnergyText(data.value) }}</p>
        </template>
        <template #cell(product)="data">
          <b-container class="d-flex flex-wrap justify-content-center">
            <ProductAndAmount :product="data.value" :unit="options.unit" class="mt-2 mb-2 mr-1" />
          </b-container>
        </template>
      </b-table>
    </div>
    <div v-if="externals.length">
      <div class="d-flex justify-content-center">
        <div class="w-50 p-2 mb-2 border border-primary align-middle">
          <h5 class="m-0 text-primary">{{ tr('Raw inputs') }}</h5>
        </div>
      </div>
      <b-container class="d-flex flex-wrap justify-content-center border">
        <ProductAndAmount v-for="product in externals" :unit="options.unit" :key="product.item.ID" :product="product" class="mt-2 mb-2 mr-1" />
      </b-container>
    </div>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Planner } from '@/common/planner'
import { Options } from '@/common/options'
import Mixins from '@/common/mixin'
import { Recipe, MiningRecipe, Product, Entity, MiningProduct } from '@/common/product'
import ProductAndAmount from '@/components/ProductAndAmount.vue'
import BuildingAndRecipe from '@/components/BuildingAndRecipe.vue'
import BuildingAndMining from '@/components/BuildingAndMining.vue'
import { DataLoader, tr } from '@/common/dataloader'

@Component({
  mixins: [Mixins],
  components: {
    ProductAndAmount,
    BuildingAndRecipe,
    BuildingAndMining
  }
})
export default class DetailPanel extends Vue {
  @Prop() planner!: Planner;
  @Prop() options!: Options;

  private readonly tr = tr;
  private items: Record<string, number | Recipe | Product[]>[];
  private miningItems: Record<string, number | MiningRecipe | Product>[];
  private externals: Product[];
  private readonly fields = [
    { key: 'recipe', label: tr('Recipe'), thStyle: { width: '18%' } },
    { key: 'amount', label: tr('Amount'), thStyle: { width: '5%' } },
    { key: 'energy', label: tr('Power'), thStyle: { width: '5%' } },
    { key: 'requires', label: tr('Requirements'), thStyle: { width: '18%' } },
    { key: 'products', label: tr('Products'), thStyle: { width: '18%' } },
    { key: 'provides', label: tr('Raw inputs'), thStyle: { width: '18%' } },
    { key: 'byProducts', label: tr('By-products'), thStyle: { width: '18%' } }
  ]

  private readonly miningFields = [
    { key: 'recipe', label: tr('Recipe'), thStyle: { width: '40%' } },
    { key: 'amount', label: tr('Amount'), thStyle: { width: '10%' }, tdClass: 'align-middle' },
    { key: 'energy', label: tr('Power'), thStyle: { width: '10%' }, tdClass: 'align-middle' },
    { key: 'product', label: tr('Products'), thStyle: { width: '40%' } }
  ]

  constructor () {
    super()
    this.items = DetailPanel.CreateItems(this.planner)
    this.miningItems = DetailPanel.CreateMiningItems(this.planner)
    this.externals = this.planner.externals
  }

  @Watch('planner', { deep: true })
  onPlannerChanged () {
    this.items = DetailPanel.CreateItems(this.planner)
    this.miningItems = DetailPanel.CreateMiningItems(this.planner)
    this.externals = this.planner.externals
  }

  static CreateItems (planner: Planner): Array<Record<string, number | Recipe | Product[]>> {
    const items: Record<string, number | Recipe | Product[]>[] = []
    planner.nodes.forEach((node) => {
      items.push({
        recipe: node.recipe ? node.recipe : Recipe.Empty,
        amount: Math.round(node.amount * 100) / 100,
        energy: node.energy,
        requires: node.requires,
        products: node.products,
        provides: node.provides,
        byProducts: node.byProducts
      })
    })
    return items
  }

  static CreateMiningItems (planner: Planner): Array<Record<string, number | MiningRecipe | Product>> {
    const items: Record<string, number | MiningRecipe | Product>[] = []
    planner.minings.forEach((mining) => {
      items.push({
        recipe: mining.miningRecipe,
        amount: Math.round(mining.amount * 100) / 100,
        energy: DetailPanel.getMiningEnergy(mining),
        product: mining.product
      })
    })
    return items
  }

  static getMiningEnergy (miningProduct: MiningProduct): number {
    if (miningProduct) {
      const entity = DataLoader.getInstance().EntityMap[miningProduct.miningRecipe.building.ID]
      if (entity !== undefined) {
        return Entity.getEnergy(entity, miningProduct.amount)
      }
    }
    return 0
  }

  getEnergyText (energy: number): string {
    return Entity.getEnergyText(energy)
  }
}
</script>
