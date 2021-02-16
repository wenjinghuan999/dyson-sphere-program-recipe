<template>
  <div class="building-and-mining">
    <b-input-group>
      <div class="input-group-prepend">
        <div class="input-group-text">
          <b-img
            v-bind:src="require('../assets/' + building.IconPath + '.png')"
            style="width: 32px !important; height: 32px !important"
          />
        </div>
      </div>
      <div class="input-group-append" v-if="!vein">
        <div class="input-group-text">
          <b-img
            v-bind:src="require('../assets/' + icon + '.png')"
            style="width: 32px !important; height: 32px !important"
          />
        </div>
      </div>
      <div class="input-group-append" v-else>
        <div class="input-group-text">
          <b-img
            v-bind:src="require('../assets/' + vein.IconPath + '.png')"
            style="width: 32px !important; height: 32px !important"
          />
        </div>
      </div>
    </b-input-group>
  </div>
</template>

<script lang="ts">
import { Item, Vein, MiningRecipe } from '@/common/product'
import { Component, Prop, Vue } from 'vue-property-decorator'
import Mixins from '@/common/mixin'
import { DataLoader } from '@/common/dataloader'

@Component({
  mixins: [Mixins]
})
export default class BuildingAndMining extends Vue {
  @Prop() private readonly recipe!: MiningRecipe;

  get icon (): string {
    if (this.recipe && this.recipe.item.IconPath) {
      return this.recipe.item.IconPath
    } else {
      return 'Icons/placeholder'
    }
  }

  get building (): Item {
    return this.recipe.building
  }

  get vein (): Vein | null {
    if (this.recipe.item.MiningFrom) {
      const vein = DataLoader.getInstance().VeinItemMap[this.recipe.item.ID]
      if (vein) {
        return vein
      } else {
        return null
      }
    }
    return null
  }
}
</script>
