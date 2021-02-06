<template>
  <div class="product-panel">
    <div v-for="element in selected" :key="element.pickerId">
      <b-container class="d-flex justify-content-center">
        <ProductPicker
          v-model="element.item"
          v-on:click="onItemPickerClicked(element.pickerId)"
          v-on:input="updateProduct()"
          :showPicker="showPickerId == element.pickerId"
          default-message="Select Item"
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
import ProductPicker from './ProductPicker.vue'
import Mixins from '../common/mixin'

@Component({
  mixins: [Mixins],
  components: {
    ProductPicker
  }
})
export default class ProductPanel extends Vue {
  @Prop() private title!: string;
  @VModel() private products!: Array<typeof Mixins.noneProductAndAmount>;

  static noneElement = { pickerId: 0, item: Mixins.noneProductAndAmount };

  private selected: Array<typeof ProductPanel.noneElement> = [
    Object.create(ProductPanel.noneElement)
  ];

  private showPickerId = -1;

  findPicker (pickerId: number) {
    return this.selected.findIndex((value) => { return value.pickerId === pickerId })
  }

  onDeleteButtonClicked (pickerId: number) {
    if (this.selected.length > 1) {
      this.selected.splice(this.findPicker(pickerId), 1)
      this.updateProduct()
    }
  }

  onAddButtonClicked () {
    const newElement = Object.create(ProductPanel.noneElement)
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
    const newProducts: Array<typeof Mixins.noneProductAndAmount> = []
    this.selected.forEach((value) => {
      if (value.item.item.id >= 0 && value.item.amount > 0) {
        const idx = newProducts.findIndex((v) => {
          return v.item.id === value.item.item.id
        })
        if (idx >= 0) {
          newProducts[idx].amount += value.item.amount
        } else {
          newProducts.push(Object.create(value.item))
        }
      }
    })
    this.products = newProducts
  }
}
</script>