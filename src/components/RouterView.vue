<template>
  <div>
    <b-container class="p-0 mt-2 shadow">
      <b-container class="pt-2 border bg-primary text-white text-left">
        <h3>1. {{ tr('Select Products') }}</h3>
      </b-container>
      <b-container class="border">
        <b-container class="m-3">
          <ProductPanel v-model="userInputProducts" :unit="options.unit" :defaultProducts="userInputProducts"/>
        </b-container>
      </b-container>
      <b-container class="d-inline-flex pt-2 border bg-primary justify-content-left">
        <div class="d-inline-flex btn bg-transparent p-0 text-white text-left" v-b-toggle.collapse-summary>
          <b-icon-caret-down-fill v-if="collapseSummaryVisible" />
          <b-icon-caret-right-fill v-else />
          <h5>{{ tr('Summary') }}</h5>
        </div>
      </b-container>
      <b-collapse visible id="collapse-summary" v-model="collapseSummaryVisible">
        <b-container class="d-flex flex-wrap justify-content-center border">
          <ProductAndAmount v-for="product in targets" :key="product.item.ID" :product="product" :unit="options.unit" class="mt-2 mb-2 mr-1" />
        </b-container>
      </b-collapse>
      <b-container class="d-inline-flex pt-2 border bg-primary justify-content-left">
        <div class="d-inline-flex btn bg-transparent p-0 text-white text-left" v-b-toggle.collapse-options>
          <b-icon-caret-down-fill v-if="collapseOptionsVisible" />
          <b-icon-caret-right-fill v-else />
          <h5>{{ tr('Options') }}</h5>
        </div>
      </b-container>
      <b-collapse id="collapse-options" v-model="collapseOptionsVisible">
        <b-container class="d-flex flex-wrap justify-content-center border">
          <OptionsPanel v-model="options" class="mt-2 mb-2 mr-1" />
        </b-container>
      </b-collapse>
    </b-container>
    <b-container class="p-0 mt-3 shadow">
      <b-container class="pt-2 border bg-primary text-white text-left">
        <h3>2. {{ tr('View Pipeline') }}</h3>
      </b-container>
      <b-container class="border">
        <b-container class="m-3">
          <PipelinePanel :planner="planner" :options="options" :targets="targets" :activePanel="activePanel"/>
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
import OptionsPanel from '@/components/OptionsPanel.vue'
import PipelinePanel from '@/components/PipelinePanel.vue'
import { Item, Product, UserInputProduct } from '@/common/product'
import { DataLoader, tr } from '@/common/dataloader'
import { Planner } from '@/common/planner'
import { Options } from '@/common/options'
import { Base64 } from 'js-base64'

@Component({
  components: {
    Navbar,
    ProductPanel,
    ProductAndAmount,
    OptionsPanel,
    PipelinePanel
  }
})
export default class RouterView extends Vue {
  @Prop() planData?: string;
  @Prop() optionsData?: string;
  @Prop() targetsData?: string;
  @Prop() activePanel?: string;

  private userInputProducts: UserInputProduct[];
  private targets: Product[];
  private planner: Planner;
  private options: Options;
  private readonly tr = tr;

  private collapseOptionsVisible = false;
  private collapseSummaryVisible = true;

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
    if (this.optionsData) {
      this.options = Options.Deserialize(Base64.decode(this.optionsData))
    } else {
      this.options = new Options()
    }
  }

  @Watch('planData')
  @Watch('targetsData')
  @Watch('optionsData')
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
    if (this.optionsData) {
      this.options = Options.Deserialize(Base64.decode(this.optionsData))
    } else {
      this.options = new Options()
    }
  }

  @Watch('userInputProducts')
  @Watch('options')
  onUserInputProductsChanged () {
    const targetsData = Base64.encodeURI(RouterView.SerializeUserInputProducts(this.userInputProducts))
    const optionsData = Base64.encodeURI(Options.Serialize(this.options))
    const path = this.$router.currentRoute.path
    const query = { target: targetsData, options: optionsData }
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
