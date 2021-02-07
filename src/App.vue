<template>
  <div id="app">
    <b-alert show variant="danger" dismissible class="fixed-top">
      This site is under construction. Results may be invalid!
    </b-alert>
    <b-container class="p-0 shadow">
      <b-container class="pt-2 border bg-primary text-white text-left">
        <h3>1. Select Products</h3>
      </b-container>
      <b-container class="border">
        <b-container class="m-3">
          <ProductPanel v-model="products"/>
        </b-container>
      </b-container>
      <b-container class="pt-2 border bg-primary text-white text-left">
        <h5>Summary</h5>
      </b-container>
      <b-container class="d-flex flex-wrap justify-content-center border">
        <ProductAndAmount v-for="product in products" :key="product.item.ID" :product="product" class="mt-2 mb-2 mr-1" />
      </b-container>
    </b-container>
    <b-container class="p-0 mt-3 shadow">
      <b-container class="pt-2 border bg-primary text-white text-left">
        <h3>2. View Pipeline</h3>
      </b-container>
      <b-container class="border">
        <b-container class="m-3">
          <b-tabs content-class="mt-3">
            <b-tab title="Graph" active><p>I'm the first tab</p></b-tab>
            <b-tab title="Details"><p>I'm the second tab</p></b-tab>
            <b-tab title="Summary"><p>I'm a disabled tab!</p></b-tab>
          </b-tabs>
        </b-container>
      </b-container>
    </b-container>
    <div class="mt-3"> {{ productSummary }} </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ProductPanel from '@/components/ProductPanel.vue'
import ProductAndAmount from '@/components/ProductAndAmount.vue'
import { Product } from '@/common/product'

@Component({
  components: {
    ProductPanel,
    ProductAndAmount
  }
})
export default class App extends Vue {
  private products: Array<Product> = [];

  get productSummary () {
    let result = ''
    this.products.forEach(product => {
      result += product.name + '[' + product.amount + '] '
    })
    if (result === '') {
      return 'Nothing'
    }
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
  margin-top: 60px;
}
</style>
