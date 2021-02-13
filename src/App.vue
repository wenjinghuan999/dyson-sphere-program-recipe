<template>
  <div id="app">
    <Navbar :title="tr('Dyson Sphere Program Recipe')" />
    <b-container class="p-0 pt-2 shadow">
      <b-container class="pt-2 border bg-primary text-white text-left">
        <h3>1. {{ tr('Select Products') }}</h3>
      </b-container>
      <b-container class="border">
        <b-container class="m-3">
          <ProductPanel v-model="products"/>
        </b-container>
      </b-container>
      <b-container class="pt-2 border bg-primary text-white text-left">
        <h5>{{ tr('Summary') }}</h5>
      </b-container>
      <b-container class="d-flex flex-wrap justify-content-center border">
        <ProductAndAmount v-for="product in products" :key="product.item.ID" :product="product" class="mt-2 mb-2 mr-1" />
      </b-container>
    </b-container>
    <b-container class="p-0 mt-3 shadow">
      <b-container class="pt-2 border bg-primary text-white text-left">
        <h3>2. {{ tr('View Pipeline') }}</h3>
      </b-container>
      <b-container class="border">
        <b-container class="m-3">
          <b-tabs content-class="mt-3">
            <b-tab :title="tr('Graph')" active><p>I'm the first tab</p></b-tab>
            <b-tab :title="tr('Details')">
              <DetailPanel :planner="planner"/>
            </b-tab>
            <b-tab :title="tr('Summary')"><p>I'm a disabled tab!</p></b-tab>
          </b-tabs>
        </b-container>
      </b-container>
    </b-container>
    <div class="mt-3"> {{ productSummary }} </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator'
import Navbar from '@/components/Navbar.vue'
import ProductPanel from '@/components/ProductPanel.vue'
import ProductAndAmount from '@/components/ProductAndAmount.vue'
import DetailPanel from '@/components/DetailPanel.vue'
import { Product } from '@/common/product'
import { tr } from '@/common/dataloader'
// TODO: remove following imports
import { Planner } from '@/common/planner'

@Component({
  components: {
    Navbar,
    ProductPanel,
    ProductAndAmount,
    DetailPanel
  }
})
export default class App extends Vue {
  private products: Product[] = [];
  private readonly tr = tr;
  private planner: Planner = new Planner([]);

  @Watch('products')
  onProductsChanged () {
    this.planner = new Planner(this.products)
  }

  get productSummary () {
    const planner = new Planner(this.products)
    console.log(planner)
    let result = ''
    planner.provides.forEach((product) => {
      result += tr(product.name) + '[' + product.amount + '] '
    })
    result += ' => '
    planner.targets.forEach((product) => {
      result += tr(product.name) + '[' + product.amount + '] '
    })
    result += ' + '
    planner.byProducts.forEach((product) => {
      result += tr(product.name) + '[' + product.amount + '] '
    })
    return result
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
