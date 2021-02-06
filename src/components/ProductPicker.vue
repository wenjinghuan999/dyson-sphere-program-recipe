<template>
  <div class="product-picker">
    <b-button-toolbar>
      <b-button-group>
        <div class="input-group-text">
          <b-img
            v-bind:src="selectedItem.id >= 0
              ? require('../assets/icons/' + selectedItem.icon)
              : require('../assets/icons/Placeholder.png')"
            style="width: 32px !important; height: 32px !important"
          />
        </div>
        <b-button variant="outline-primary" v-on:click="onClick()" ref="button" class="btn-block button-span mr-1">
          <span>
            {{ selectedItem.id >= 0 ? selectedItem.name : defaultMessage }}
          </span>
        </b-button>
      </b-button-group>
      <b-input-group prepend="@">
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
          <div v-for="rowstart in Array.from({length: 8}, (x, i) => i * 12)" :key="rowstart" class="d-flex bd-highlight">
              <div
                v-for="item in recipeTable.AllItems.slice(rowstart, rowstart + 12)"
                :key="item.id"
                v-on:click="onClick(item)"
                class="p-2 bd-highlight border border-dark bg-secondary"
              >
                <img
                  v-bind:src="require('../assets/icons/' + item.icon)"
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
import { RecipeTable } from '../common/recipe'
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
  @VModel() private selectedItemAndAmount?: typeof Mixins.noneProductAndAmount;

  private readonly recipeTable = RecipeTable.getInstance();
  private selectedItem = Mixins.noneProduct;
  private unit = 's';
  private amount = 1;

  @Emit('click')
  onClick (item = Mixins.noneProduct) {
    if (item.id >= 0 && item.name !== '') {
      this.selectedItem = item
    }
  }

  @Watch('selectedItem')
  @Watch('unit')
  @Watch('amount')
  onChanged () {
    this.selectedItemAndAmount = {
      item: this.selectedItem,
      amount: this.amount * (this.unit === 'min' ? 60 : 1)
    }
  }
}
</script>

<style scoped>
  .button-span {
    width: 18rem !important;
  }
  .form-control {
    height: inherit;
  }
</style>
