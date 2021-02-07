<template>
  <div class="product-picker">
    <b-button-toolbar>
      <b-input-group>
        <b-button-group>
        <b-button
          variant="outline-primary"
          v-on:click="onClick()"
          class="btn-block p-1"
          ref="button"
          style="border-top-right-radius: 0; border-bottom-right-radius: 0"
        >
          <b-container class="d-flex align-items-center m-0 p-0">
            <div class="d-flex float-left align-items-center p-0">
              <b-img
                v-bind:src="require('../assets/' + selectedItem.icon + '.png')"
                style="width: 32px !important; height: 32px !important"
              />
            </div>
            <b-container class="d-md-flex d-none justify-content-center align-items-center border-left border-primary ml-1">
              <span class="button-span">
                {{ selectedItem.isValid ? selectedItem.name : defaultMessage }}
              </span>
            </b-container>
          </b-container>
        </b-button>
        </b-button-group>
        <div class="input-group-append input-group-prepend">
          <div class="input-group-text">@</div>
        </div>
        <b-form-input v-model="amount" type="number" value="1" min="0" style="max-width: 4.5rem" />
        <div class="input-group-append input-group-prepend">
          <div class="input-group-text">/</div>
        </div>
        <b-form-select class="form-control" v-model="unit" :options="unitOptions" style="max-width: 4.5rem"></b-form-select>
      </b-input-group>
    </b-button-toolbar>
    <vue-popper
        v-show="showPicker"
        class="item-picker-popper"
        style="z-index: 2"
        :referenceElm="$refs.button"
        :popperOption="popperProps.popperOption"
        :arrowOffsetScaling="popperProps.arrowOffsetScaling"
        :arrowPosition="popperProps.arrowPosition"
    >
      <div>
          <div v-for="(panelRow, rowIdx) in panel" :key="'row' + rowIdx" class="d-flex bd-highlight">
              <div
                v-for="(product, colIdx) in panelRow"
                :key="'row' + rowIdx + 'col' + colIdx"
                v-on:click="onClick(product)"
                class="p-2 bd-highlight border border-dark bg-secondary"
              >
                <img
                  v-bind:src="require('../assets/' + product.icon + '.png')"
                  style="width: 32px !important; height: 32px !important"
                />
              </div>
          </div>
      </div>
    </vue-popper>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, VModel, Vue, Emit } from 'vue-property-decorator'
import Mixins from '../common/mixin'
import VuePopper from '@livelybone/vue-popper'
import { DataLoader } from '../common/dataloader'
import { Product } from '../common/product'
import '@livelybone/vue-popper/lib/css/index.css'

@Component({
  mixins: [Mixins],
  components: {
    VuePopper
  }
})
export default class ProductPicker extends Vue {
  @Prop() private defaultMessage!: string;
  @Prop() private showPicker = false;
  @VModel() private selectedProduct?: Product;

  private readonly dataLoader = DataLoader.getInstance();
  private selectedItem: Product = Product.Empty;
  private unit = 's';
  private amount = 1;

  private readonly panel: Array<Array<Product>>;

  constructor () {
    super()
    this.panel = this.createPanel()
    console.log(this.panel)
  }

  createPanel (): Array<Array<Product>> {
    const panel: Array<Array<Product>> = []
    for (let i = 11; i <= 17; i++) {
      const panelRow: Array<Product> = []
      for (let j = 1; j <= 12; j++) {
        const gridIndex = i * 100 + j
        const item = DataLoader.getInstance().AllItems.find((item) => {
          return item.GridIndex === gridIndex
        })
        if (item !== undefined) {
          panelRow.push(new Product(item))
        } else {
          panelRow.push(Product.Empty)
        }
      }
      panel.push(panelRow)
    }

    return panel
  }

  @Emit('click')
  onClick (item = Product.Empty) {
    if (item.isValid) {
      this.selectedItem = item
    }
  }

  @Watch('unit')
  onUnitChange () {
    if (this.unit === 'min') {
      this.amount *= 60
    } else {
      this.amount /= 60
    }
    this.onChanged()
  }

  @Watch('selectedItem')
  @Watch('amount')
  onChanged () {
    const newProduct = Object.create(this.selectedItem) as Product
    newProduct.amount = this.amount / (this.unit === 'min' ? 60 : 1)
    this.selectedProduct = newProduct
  }
}
</script>

<style scoped>
  .button-span {
    width: 16rem !important;
  }
  .form-control {
    height: inherit;
  }
</style>
