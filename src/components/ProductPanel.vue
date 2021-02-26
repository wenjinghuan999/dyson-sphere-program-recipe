<template>
  <div class="product-panel">
    <div v-for="element in selected" :key="element.pickerId">
      <b-container class="d-flex justify-content-center">
        <ProductPicker
          v-model="element.product"
          v-on:click="onItemPickerClicked(element.pickerId)"
          v-on:input="updateProduct()"
          :unit="unit"
          :defaultProduct="element.product"
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
import { Item, UserInputProduct } from '@/common/product'
import { tr } from '@/common/dataloader'

@Component({
  mixins: [Mixins],
  components: {
    ProductPicker
  }
})
export default class ProductPanel extends Vue {
  @Prop() private title!: string;
  @Prop() private defaultProducts!: UserInputProduct[];
  @Prop() private unit!: string;
  @VModel() private products!: UserInputProduct[];
  private readonly tr = tr;

  static NoneElement = { pickerId: 0, product: UserInputProduct.Empty };

  private selected: (typeof ProductPanel.NoneElement)[] = [];

  private newPickerId = 0;
  private showPickerId = -1;

  constructor () {
    super()

    ProductPanel.ConstrcutPickers(this)
  }

  findPicker (pickerId: number) {
    return this.selected.findIndex((element) => { return element.pickerId === pickerId })
  }

  onDeleteButtonClicked (pickerId: number) {
    this.removePicker(pickerId)
  }

  onAddButtonClicked () {
    this.addNewPicker(null)
  }

  addNewPicker (product: UserInputProduct | null) {
    const newElement = {
      pickerId: this.newPickerId++,
      product: product === null
        ? new UserInputProduct(Item.Empty, 1, 's')
        : new UserInputProduct(product.item, product.amount, product.unit)
    }
    this.selected.push(newElement)
  }

  removePicker (pickerId: number) {
    if (this.selected.length > 1) {
      this.selected.splice(this.findPicker(pickerId), 1)
    }
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
    const products: UserInputProduct[] = []
    this.selected.forEach((element) => {
      products.push(new UserInputProduct(element.product.item, element.product.amount, element.product.unit))
    })
    this.products = products
  }

  static ConstrcutPickers (panel: ProductPanel) {
    if (panel.defaultProducts.length > 0) {
      const newSelected: (typeof ProductPanel.NoneElement)[] = []
      panel.defaultProducts.forEach((product) => {
        newSelected.push({
          pickerId: panel.newPickerId++,
          product: new UserInputProduct(product.item, product.amount, product.unit)
        })
      })
      panel.selected = newSelected
    } else {
      panel.selected = [{
        pickerId: panel.newPickerId++,
        product: new UserInputProduct(Item.Empty, 1, 's')
      }]
    }
  }

  @Watch('defaultProducts')
  onDefaultProductChanged () {
    let pickerChanged = false
    if (this.defaultProducts.length !== this.selected.length) {
      pickerChanged = true
    }
    for (let i = 0; i < this.defaultProducts.length && !pickerChanged; ++i) {
      if (this.defaultProducts[i].item.ID !== this.selected[i].product.item.ID ||
        this.defaultProducts[i].amount !== this.selected[i].product.amount ||
        this.defaultProducts[i].unit !== this.selected[i].product.unit) {
        pickerChanged = true
      }
    }
    if (pickerChanged) {
      ProductPanel.ConstrcutPickers(this)
    }
  }
}
</script>
