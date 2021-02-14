<template>
  <div>
    <b-container class="p-0 pt-2 shadow">
      <b-container class="pt-2 border bg-primary text-white text-left">
        <h3>1. {{ tr('Select Products') }}</h3>
      </b-container>
      <b-container class="border">
        <b-container class="m-3">
          <ProductPanel v-model="targets" :defaultProducts="targets"/>
        </b-container>
      </b-container>
      <b-container class="pt-2 border bg-primary text-white text-left">
        <h5>{{ tr('Summary') }}</h5>
      </b-container>
      <b-container class="d-flex flex-wrap justify-content-center border">
        <ProductAndAmount v-for="product in simplifiedTargets" :key="product.item.ID" :product="product" class="mt-2 mb-2 mr-1" />
      </b-container>
    </b-container>
    <b-container class="p-0 mt-3 shadow">
      <b-container class="pt-2 border bg-primary text-white text-left">
        <h3>2. {{ tr('View Pipeline') }}</h3>
      </b-container>
      <b-container class="border">
        <b-container class="m-3">
          <PipelinePanel :planner="planner" :targets="simplifiedTargets" :activePanel="activePanel"/>
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
import { Product } from '@/common/product'
import { tr } from '@/common/dataloader'
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

  private targets: Product[];
  private planner: Planner;
  private readonly tr = tr;

  constructor () {
    super()
    if (this.planData) {
      this.planner = Planner.Deserialize(Base64.decode(this.planData))
      this.targets = this.planner.targets
    } else if (this.targetsData) {
      this.targets = Planner.DeserializeProductArray(Base64.decode(this.targetsData))
      this.planner = new Planner(Product.SimplifyProducts(this.targets))
    } else {
      this.planner = new Planner([])
      this.targets = []
    }
  }

  @Watch('planData')
  @Watch('targetsData')
  onRouterDataChanged () {
    if (this.planData) {
      this.planner = Planner.Deserialize(Base64.decode(this.planData))
      this.targets = this.planner.targets
    } else if (this.targetsData) {
      this.targets = Planner.DeserializeProductArray(Base64.decode(this.targetsData))
      this.planner = new Planner(Product.SimplifyProducts(this.targets))
    } else {
      this.planner = new Planner([])
      this.targets = []
    }
  }

  @Watch('targets')
  onTargetsChanged () {
    const targetsData = Base64.encodeURI(Planner.SerializeProductArray(this.targets))
    if (targetsData !== this.targetsData) {
      this.$router.push('/?target=' + targetsData)
    }
  }

  get simplifiedTargets () {
    return Product.SimplifyProducts(this.targets)
  }

  get productSummary () {
    const planner = new Planner(this.targets)
    // console.log(planner)
    // let result = ''
    // planner.provides.forEach((product) => {
    //   result += tr(product.name) + '[' + product.amount + '] '
    // })
    // result += ' => '
    // planner.targets.forEach((product) => {
    //   result += tr(product.name) + '[' + product.amount + '] '
    // })
    // result += ' + '
    // planner.byProducts.forEach((product) => {
    //   result += tr(product.name) + '[' + product.amount + '] '
    // })
    const result = Base64.encode(Planner.Serialize(planner))
    return result
  }
}
</script>
