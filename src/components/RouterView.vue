<template>
  <div>
    <b-container class="p-0 mt-2 shadow">
      <b-container class="pt-2 border bg-primary text-white text-left">
        <h3>1. {{ tr('Select Products') }}</h3>
      </b-container>
      <b-container class="border">
        <b-container class="m-3">
          <ProductPanel v-model="userInputProducts" :defaultProducts="userInputProducts"/>
        </b-container>
      </b-container>
      <b-container class="pt-2 border bg-primary text-white text-left">
        <h5>{{ tr('Summary') }}</h5>
      </b-container>
      <b-container class="d-flex flex-wrap justify-content-center border">
        <ProductAndAmount v-for="product in targets" :key="product.item.ID" :product="product" class="mt-2 mb-2 mr-1" />
      </b-container>
    </b-container>
    <b-container class="p-0 mt-3 shadow">
      <b-container class="pt-2 border bg-primary text-white text-left">
        <h3>2. {{ tr('View Pipeline') }}</h3>
      </b-container>
      <b-container class="border">
        <b-container class="m-3">
          <PipelinePanel :planner="planner" :targets="targets" :activePanel="activePanel"/>
        </b-container>
      </b-container>
    </b-container>
    <div class="mt-3"> {{ productSummary }} </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue, Prop } from 'vue-property-decorator'
import Navbar from '@/components/Navbar.vue'
import ProductPanel from '@/components/ProductPanel.vue'
import ProductAndAmount from '@/components/ProductAndAmount.vue'
import PipelinePanel from '@/components/PipelinePanel.vue'
import { Item, Product, UserInputProduct } from '@/common/product'
import { DataLoader, tr } from '@/common/dataloader'
import { Planner } from '@/common/planner'
import { Base64 } from 'js-base64'

@Component({
  components: {
    Navbar,
    ProductPanel,
    ProductAndAmount,
    PipelinePanel
  }
})
export default class RouterView extends Vue {
  @Prop() planData?: string;
  @Prop() targetsData?: string;
  @Prop() activePanel?: string;

  private userInputProducts: UserInputProduct[];
  private targets: Product[];
  private planner: Planner;
  private readonly tr = tr;

  constructor () {
    super()
    if (this.planData) {
      this.planner = Planner.Deserialize(Base64.decode(this.planData))
      this.userInputProducts = this.planner.targets.map(p => new UserInputProduct(p.item, p.amount))
      this.targets = this.planner.targets
    } else if (this.targetsData) {
      this.userInputProducts = RouterView.DeserializeUserInputProducts(Base64.decode(this.targetsData))
      this.targets = Product.SimplifyProducts(this.userInputProducts.map(p => p.product))
      this.planner = new Planner(this.targets)
    } else {
      this.planner = new Planner([])
      this.userInputProducts = []
      this.targets = []
    }
  }

  @Watch('planData')
  @Watch('targetsData')
  onRouterDataChanged () {
    if (this.planData) {
      this.planner = Planner.Deserialize(Base64.decode(this.planData))
      this.userInputProducts = this.planner.targets.map(p => new UserInputProduct(p.item, p.amount))
      this.targets = this.planner.targets
    } else if (this.targetsData) {
      this.userInputProducts = RouterView.DeserializeUserInputProducts(Base64.decode(this.targetsData))
      this.targets = Product.SimplifyProducts(this.userInputProducts.map(p => p.product))
      this.planner = new Planner(this.targets)
    } else {
      this.planner = new Planner([])
      this.userInputProducts = []
      this.targets = []
    }
  }

  @Watch('userInputProducts')
  onUserInputProductsChanged () {
    const targetsData = Base64.encodeURI(RouterView.SerializeUserInputProducts(this.userInputProducts))
    const path = this.$router.currentRoute.path
    const query = { target: targetsData }
    if (targetsData !== this.targetsData) {
      this.$router.push({ path: path, query: query })
    }
  }

  get productSummary () {
    console.log(this.planner)
    let result = ''
    this.planner.provides.forEach((product) => {
      result += tr(product.name) + '[' + (Math.round(product.amount * 100) / 100) + '] '
    })
    result += ' => '
    this.planner.targets.forEach((product) => {
      result += tr(product.name) + '[' + (Math.round(product.amount * 100) / 100) + '] '
    })
    result += ' + '
    this.planner.byProducts.forEach((product) => {
      result += tr(product.name) + '[' + (Math.round(product.amount * 100) / 100) + '] '
    })
    return result
  }

  static SerializeUserInputProducts (products: UserInputProduct[]): string {
    return JSON.stringify(products, (key, value) => {
      if (key === 'item' && value as Item) {
        return (value as Item).ID
      }
      return value
    })
  }

  static DeserializeUserInputProducts (text: string): UserInputProduct[] {
    return JSON.parse(text, (key, value) => {
      if (key === 'item' && typeof value === 'number') {
        return DataLoader.getInstance().ItemMap[value]
      } else if (value && value.item !== undefined && value.amount !== undefined && value.unit !== undefined) {
        return new UserInputProduct(value.item, value.amount, value.unit)
      }
      return value
    })
  }
}
</script>
