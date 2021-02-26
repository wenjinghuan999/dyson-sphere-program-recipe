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
                v-if="selectedItem.ID && selectedItem.IconPath"
                :src="require('../assets/' + selectedItem.IconPath + '.png')"
                style="width: 32px !important; height: 32px !important"
              />
              <b-container v-else class="d-flex justify-content-center align-items-center m-0 p-0" style="width: 32px !important; height: 32px !important">
                <b-icon-question-square />
              </b-container>
            </div>
            <b-container class="d-md-flex d-none justify-content-center align-items-center border-left border-primary ml-1">
              <span class="button-span">
                {{ selectedItem.ID ? tr(selectedItem.Name) : defaultMessage }}
              </span>
            </b-container>
          </b-container>
        </b-button>
        </b-button-group>
        <div class="input-group-append input-group-prepend">
          <div class="input-group-text">@</div>
        </div>
        <b-form-input v-model="amount" type="number" value="1" min="0" style="max-width: 4.5rem" />
        <div class="input-group-append">
          <div class="input-group-text">/{{unit}}</div>
        </div>
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
                v-for="(item, colIdx) in panelRow"
                :key="'row' + rowIdx + 'col' + colIdx"
                v-on:click="onClick(item)"
                class="p-2 bd-highlight border border-dark bg-secondary"
              >
                <img
                  v-bind:src="require('../assets/' + item.IconPath + '.png')"
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
import { DataLoader, tr } from '../common/dataloader'
import { Item, UserInputProduct } from '../common/product'
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
  @Prop() private unit!: string;
  @Prop() private defaultProduct!: UserInputProduct;
  @VModel() private selectedProduct!: UserInputProduct;

  private readonly tr = tr;
  private readonly dataLoader = DataLoader.getInstance();

  private selectedItem: Item = Item.Empty;
  private amount = 1;

  private panel: Item[][];
  private static PanelCached: Item[][];

  constructor () {
    super()
    this.panel = ProductPicker.GetPanel()

    this.selectedItem = this.defaultProduct.item
    let amount = this.defaultProduct.amount
    if (this.unit !== this.defaultProduct.unit) {
      if (this.unit === 's') {
        amount *= 60
      } else {
        amount /= 60
      }
    }
    this.amount = amount
  }

  private static CreatePanel (): Item[][] {
    const panel: Item[][] = []
    for (let i = 11; i <= 17; i++) {
      const panelRow: Item[] = []
      for (let j = 1; j <= 12; j++) {
        const gridIndex = i * 100 + j
        const item = DataLoader.getInstance().AllItems.find((item) => {
          return item.GridIndex === gridIndex
        })
        if (item !== undefined) {
          panelRow.push(item)
        } else {
          panelRow.push(Item.Empty)
        }
      }
      panel.push(panelRow)
    }
    for (let i = 21; i <= 24; i++) {
      const panelRow: Item[] = []
      for (let j = 1; j <= 12; j++) {
        const gridIndex = i * 100 + j
        const item = DataLoader.getInstance().AllItems.find((item) => {
          return item.GridIndex === gridIndex
        })
        if (item !== undefined) {
          panelRow.push(item)
        } else {
          panelRow.push(Item.Empty)
        }
      }
      panel.push(panelRow)
    }

    return panel
  }

  private static GetPanel (): Item[][] {
    if (!this.PanelCached) {
      this.PanelCached = this.CreatePanel()
    }
    return this.PanelCached
  }

  @Emit('click')
  onClick (item = Item.Empty) {
    if (item.ID) {
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
  }

  @Watch('selectedItem')
  @Watch('amount')
  onChanged () {
    this.selectedProduct = new UserInputProduct(
      this.selectedItem, +this.amount, this.unit
    )
  }

  @Watch('defaultProduct', { deep: true, immediate: true })
  onDefaultProductChanged () {
    if (this.selectedItem.ID !== this.defaultProduct.item.ID) {
      this.selectedItem = DataLoader.getInstance().ItemMap[this.defaultProduct.item.ID]
    }
    if (this.amount !== this.defaultProduct.amount) {
      this.amount = this.defaultProduct.amount
    }
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
