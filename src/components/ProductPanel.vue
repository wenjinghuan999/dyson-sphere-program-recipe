<template>
  <div class="product-panel">
    <div v-for="element in selected" :key="element.pickerId">
      <b-container class="d-flex justify-content-center">
        <ProductPicker
          v-model="element.product"
          v-on:click="onItemPickerClicked(element.pickerId)"
          v-on:input="updateProduct()"
          :showPicker="showPickerId == element.pickerId"
          :default-message="tr('Select Item')"
        />
        <b-button v-bind:disabled="selected.length <= 1" v-on:click="onDeleteButtonClicked(element.pickerId)" variant="link"><b-icon-dash-circle /></b-button>
      </b-container>
    </div>
    <b-container>
      <b-button v-on:click="onAddButtonClicked()" variant="link"><b-icon-plus-circle /></b-button>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component, Prop, VModel, Vue, Watch } from 'vue-property-decorator'
import ProductPicker from '@/components/ProductPicker.vue'
import Mixins from '@/common/mixin'
import { Product } from '@/common/product'
import { tr } from '@/common/dataloader'

@Component({
  mixins: [Mixins],
  components: {
    ProductPicker
  }
})
export default class ProductPanel extends Vue {
  @Prop() private title!: string;
  @VModel() private products!: Array<Product>;
  private tr = tr

  static NoneElement = { pickerId: 0, product: Product.Empty };

  private selected: Array<typeof ProductPanel.NoneElement> = [
    Object.create(ProductPanel.NoneElement)
  ];

  private showPickerId = -1;

  findPicker (pickerId: number) {
    return this.selected.findIndex((element) => { return element.pickerId === pickerId })
  }

  onDeleteButtonClicked (pickerId: number) {
    if (this.selected.length > 1) {
      this.selected.splice(this.findPicker(pickerId), 1)
      this.updateProduct()
    }
  }

  onAddButtonClicked () {
    const newElement = Object.create(ProductPanel.NoneElement)
    newElement.pickerId = 0
    while (this.findPicker(newElement.pickerId) >= 0) {
      newElement.pickerId++
    }
    this.selected.push(newElement)
    this.updateProduct()
  }

  onItemPickerClicked (pickerId: number) {
    if (this.showPickerId === pickerId) {
      this.showPickerId = -1
    } else {
      this.showPickerId = pickerId
    }
    this.updateProduct()
  }

  @Watch('selected', { immediate: true, deep: true })
  updateProduct () {
    const newProducts: Array<Product> = []
    this.selected.forEach((element) => {
      if (element.product.isValid && element.product.amount > 0) {
        const idx = newProducts.findIndex((product) => {
          return product.item.ID === element.product.item.ID
        })
        if (idx >= 0) {
          newProducts[idx].amount += element.product.amount
        } else {
          newProducts.push(new Product(element.product.item, element.product.amount))
        }
      }
    })
    this.products = newProducts
  }
}
</script>
